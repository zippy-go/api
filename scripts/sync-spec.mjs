// Copies the bundled OpenAPI document into the portal's public folder so the
// reference page can load it from /openapi.json. Run `pnpm bundle` first.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'dist/openapi.json');
const target = resolve(root, 'portal/public/openapi.json');

if (!existsSync(source)) {
  console.error(`Missing ${source}. Run \`pnpm bundle\` first.`);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`Copied ${source} -> ${target}`);
