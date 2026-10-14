// Checks that the contract and the document the platform serves describe the same operations:
// every path and method in generated/platform-openapi.json (copied from the platform's
// /openapi.json) must be in the bundled contract, and every operation of the contract must be
// served by the platform. System routes the contract does not cover are allowed below.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const contract = readJson(resolve(root, 'dist/openapi.json'));
const platform = readJson(resolve(root, 'generated/platform-openapi.json'));

// Routes the platform serves for operators and tooling, not for integrators.
const systemRoutes = new Set(['/health', '/ready', '/openapi.json', '/docs']);
const methods = ['get', 'post', 'put', 'patch', 'delete'];

const operations = (document) => {
  const set = new Set();
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    for (const method of methods) {
      if (item[method]) set.add(`${method.toUpperCase()} ${path}`);
    }
  }
  return set;
};

const served = operations(platform);
const described = operations(contract);
let failures = 0;
for (const operation of served) {
  const path = operation.split(' ')[1];
  if (systemRoutes.has(path)) continue;
  if (!described.has(operation)) {
    failures += 1;
    console.error(`FAIL ${operation} is served by the platform but not described by the contract`);
  }
}
for (const operation of described) {
  if (!served.has(operation)) {
    failures += 1;
    console.error(`FAIL ${operation} is described by the contract but not served by the platform`);
  }
}
if (failures > 0) {
  console.error(`${failures} contract conformance problem(s)`);
  process.exit(1);
}
console.log(`Contract conformance OK: ${described.size} operations described and served`);
