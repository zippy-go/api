# @zippy-go/api

TypeScript SDK for the ZippyGo API, generated from the OpenAPI document in
this repository with [`@hey-api/openapi-ts`](https://heyapi.dev). It uses
the Fetch API, has no runtime dependencies and works in Node.js 22+ and in
browsers.

Status: generated and committed. It will be published to GitHub Packages
under the `@zippy-go` scope later; it is not published yet.

## Usage

```ts
import { client, getMe } from '@zippy-go/api';

client.setConfig({
  baseUrl: 'https://sandbox.api.zippygo.example',
  auth: () => accessToken, // from verifyOtp or signInWithPassword
});

const { data, error } = await getMe();
if (error) {
  console.error(error.code, error.title);
} else {
  console.log(data.user.id, data.memberships.length);
}
```

Operations declare the credential they take, so the `auth` callback is
called only for those that need an access token; operations that accept
an API key instead take it as a header (`headers: { 'X-Api-Key': key }`).
The Authentication page of the developer portal walks through signing in
with `requestOtp`, `verifyOtp` and `signInWithPassword`.

Every operation is a function named after its `operationId` and returns
`{ data, error, request, response }`. Pass `throwOnError: true` in the
options to get exceptions instead. Types for every schema are exported from
the package root (`Agent`, `Event`, `HealthDetails`, `Problem`, ...).

## Streams

`streamAgents` and `streamEvents` open the server-sent event streams
(`GET /v1/live/agents` and `GET /v1/live/events`). They resolve to
`{ stream }`, an async generator that yields the parsed `data` of every
frame and reconnects with backoff when the connection drops. A frame's event
name is only visible in the `onSseEvent` callback, so handle frames there.
The contract models the stream body as a string, so `data` is typed as
`string` although the client has already parsed the JSON: cast it through
`unknown` to the frame's schema (`AgentSnapshot`, `AgentPositionUpdate`,
`AgentStatusUpdate` or `Event`).

```ts
import { streamEvents, type Event } from '@zippy-go/api';

const { stream } = await streamEvents({
  onSseEvent: ({ event, data }) => {
    if (event === 'event') console.log((data as unknown as Event).type);
  },
});
for await (const _frame of stream) {
  // keeps the connection open
}
```

The Live streams page of the developer portal documents the event types of
each stream and how to recover from a dropped connection.

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
