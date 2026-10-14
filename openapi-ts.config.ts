import { defineConfig } from '@hey-api/openapi-ts';

// Generates the TypeScript SDK (sdks/typescript/src) from the bundled OpenAPI
// document. Run `pnpm bundle` first; `pnpm check` does both in order.
export default defineConfig({
  input: './dist/openapi.json',
  output: {
    path: 'sdks/typescript/src',
    clean: true,
    tsConfigPath: 'sdks/typescript/tsconfig.json',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    {
      name: '@hey-api/client-fetch',
      // Re-export `client`, `createClient` and `createConfig` from the package
      // index so consumers can set the base URL and credentials.
      exportFromIndex: true,
    },
  ],
});
