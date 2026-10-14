// Validates the event contract:
//  - every JSON Schema under events/ compiles as JSON Schema 2020-12
//  - every catalog entry points at an existing payload schema and example
//  - every example validates against the envelope and its payload schema
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const eventsDir = resolve(root, 'events');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`FAIL ${message}`);
};

// 1. Every schema file compiles.
const schemaFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (entry.endsWith('.schema.json')) schemaFiles.push(path);
  }
};
walk(eventsDir);
for (const file of schemaFiles) {
  try {
    ajv.compile(readJson(file));
    console.log(`ok   ${relative(root, file)} compiles`);
  } catch (error) {
    fail(`${relative(root, file)}: ${error.message}`);
  }
}

// 2. Catalog entries are complete and their examples validate.
const validateEnvelope = ajv.getSchema(readJson(resolve(eventsDir, 'envelope.schema.json')).$id);
const catalog = parseYaml(readFileSync(resolve(eventsDir, 'catalog.yaml'), 'utf8'));
const typePattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

for (const event of catalog.events ?? []) {
  const label = `${event.type} v${event.version}`;
  if (!typePattern.test(event.type ?? '')) fail(`${label}: type must match ${typePattern}`);
  if (!Number.isInteger(event.version) || event.version < 1) fail(`${label}: version must be a positive integer`);
  if (!event.description) fail(`${label}: description is required`);

  const payloadSchemaPath = resolve(eventsDir, event.payload_schema ?? '');
  const examplePath = resolve(eventsDir, event.example ?? '');
  let validatePayload;
  try {
    validatePayload = ajv.getSchema(readJson(payloadSchemaPath).$id);
    if (!validatePayload) throw new Error('schema has no $id or was not compiled');
  } catch (error) {
    fail(`${label}: payload_schema ${event.payload_schema}: ${error.message}`);
    continue;
  }

  let example;
  try {
    example = readJson(examplePath);
  } catch (error) {
    fail(`${label}: example ${event.example}: ${error.message}`);
    continue;
  }

  if (example.type !== event.type || example.version !== event.version) {
    fail(`${label}: example must carry type ${event.type} and version ${event.version}`);
  }
  if (!validateEnvelope(example)) fail(`${label}: example envelope: ${ajv.errorsText(validateEnvelope.errors)}`);
  if (!validatePayload(example.payload)) fail(`${label}: example payload: ${ajv.errorsText(validatePayload.errors)}`);
  if (failures === 0) console.log(`ok   ${label} example validates`);
}

if (failures > 0) {
  console.error(`${failures} event contract problem(s)`);
  process.exit(1);
}
console.log('Event contract OK');
