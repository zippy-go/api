// Writes the portal's generated pages from the catalogs, so they never drift from them:
//  - portal/errors.md: every problem code with its status, title, message, whether to retry and
//    when it occurs; each code is an anchor, which a problem's `type` resolves to.
//  - portal/event-catalog.md: every event version with its payload's fields and its example.
// Run by `pnpm portal:sync`; the pages are build output, ignored by git.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

// Errors.
const errors = parse(read('errors/catalog.yaml')).errors;
const errorPage = [
  '---',
  'title: Errors',
  'outline: false',
  '---',
  '',
  '# Errors',
  '',
  'Every error is an RFC 9457 problem details document whose `code` is one of the codes below,',
  'and whose `type` is `/problems/{code}`: the API answers that path with the same entry, and',
  'each code here is an anchor. `detail` says what happened in a sentence; `errors` lists each',
  'invalid field with a pointer, a reason and, where one is defined, a field code.',
  '',
  '| Code | Status | Title | Retry |',
  '| --- | --- | --- | --- |',
  ...errors.map((entry) => `| [\`${entry.code}\`](#${entry.code}) | ${entry.status} | ${cell(entry.title)} | ${entry.retryable ? 'yes' : 'no'} |`),
  '',
];
for (const entry of errors) {
  errorPage.push(`## \`${entry.code}\` {#${entry.code}}`, '');
  errorPage.push(`**${entry.status} ${cell(entry.title)}.** ${cell(entry.description)}`, '');
  errorPage.push(`Detail: “${cell(entry.message)}” ${entry.retryable ? 'Retrying the same request may succeed.' : 'Retrying the same request answers the same.'}`, '');
  if (entry.details?.length) {
    errorPage.push('| Field code | Sentence | When |', '| --- | --- | --- |');
    for (const detail of entry.details) {
      errorPage.push(`| \`${detail.code}\` | ${cell(detail.message)} | ${cell(detail.description)} |`);
    }
    errorPage.push('');
  }
}
writeFileSync(resolve(root, 'portal/errors.md'), `${errorPage.join('\n')}\n`);

// Events.
const events = parse(read('events/catalog.yaml')).events;
const eventPage = [
  '---',
  'title: Event catalog',
  'outline: [2, 2]',
  '---',
  '',
  '# Event catalog',
  '',
  'Every event, version by version, with its payload\'s fields and an example of the whole',
  'envelope. A consumer ignores fields it does not know; a new optional field is an additive',
  'change, and anything else is a new version. [Events](/events) explains the envelope and the',
  'delivery guarantees.',
  '',
];
for (const event of events) {
  const schema = JSON.parse(read(`events/${event.payload_schema.replace(/^\.\//, '')}`));
  const example = read(`events/${event.example.replace(/^\.\//, '')}`).trim();
  const required = new Set(schema.required ?? []);
  eventPage.push(`## \`${event.type}\` v${event.version}`, '', cell(event.description), '');
  eventPage.push('| Field | Type | Description |', '| --- | --- | --- |');
  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    const type = [property.type ?? (property.$ref ? 'object' : 'any')].flat().join(' or ');
    const optional = required.has(name) ? '' : ' (optional)';
    eventPage.push(`| \`${name}\`${optional} | ${cell(type)} | ${cell(property.description)} |`);
  }
  eventPage.push('', '```json', example, '```', '');
}
writeFileSync(resolve(root, 'portal/event-catalog.md'), `${eventPage.join('\n')}\n`);
console.log(`Wrote ${errors.length} errors and ${events.length} events into the portal`);
