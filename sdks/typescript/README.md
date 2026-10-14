# @zippy-go/api

TypeScript SDK for the ZippyGo API, generated from the OpenAPI document in
this repository with [`@hey-api/openapi-ts`](https://heyapi.dev). It uses
the Fetch API, has no runtime dependencies and works in Node.js 22+ and in
browsers.

Status: generated and committed. It will be published to GitHub Packages
under the `@zippy-go` scope later; it is not published yet.

## Usage

```ts
import { client, getHealth } from '@zippy-go/api';

client.setConfig({
  baseUrl: 'https://sandbox.api.zippygo.example',
  headers: { 'X-Api-Key': process.env.ZIPPYGO_API_KEY },
});

const { data, error } = await getHealth();
if (error) {
  console.error(error.code, error.title);
} else {
  console.log(data.status, data.version);
}
```

Every operation is a function named after its `operationId` and returns
`{ data, error, request, response }`. Pass `throwOnError: true` in the
options to get exceptions instead. Types for every schema are exported from
the package root (`HealthResponse`, `Money`, `Error`, ...).

## Layout

```
src/
  index.ts         Public entry point (generated)
  sdk.gen.ts       One function per operation
  types.gen.ts     Request, response and schema types
  client.gen.ts    The default client instance
  client/, core/   The bundled Fetch client runtime
```

Everything under `src/` is generated. Do not edit it by hand: change the
OpenAPI document and run `pnpm check` (or `pnpm bundle && pnpm gen:ts`)
from the repository root, then commit the result. CI fails if the committed
output is stale.
