# Getting started

The ZippyGo API is a JSON API over HTTPS. This page covers what you need to
make a first request; the [API reference](/reference) documents every
endpoint.

::: info Status
The API is being built contract first. The hosts below are placeholders
until the sandbox opens; the reference and SDKs already reflect the final
shape of each released endpoint.
:::

## Hosts

| Environment | Base URL                             |
| ----------- | ------------------------------------ |
| Sandbox     | `https://sandbox.api.zippygo.example` |
| Production  | `https://api.zippygo.example`        |

All paths are prefixed with the major version, currently `/v1`.

## Authentication

Two schemes exist; an operation accepts either unless its reference entry
says otherwise.

- **API key** for server-to-server integrations: send the key in the
  `X-Api-Key` header. Keys are scoped to one partner.
- **Bearer token** for user sessions: send a JWT in the
  `Authorization: Bearer <token>` header.

Health checks need no credentials:

```sh
curl https://sandbox.api.zippygo.example/v1/health
```

```json
{ "status": "ok", "version": "0.1.0", "checked_at": "2026-10-14T08:00:00Z" }
```

## Errors

Every error response is an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457)
problem details document with the media type `application/problem+json`.
Branch on the `code` member, which is stable, rather than on the text:

```json
{
  "type": "/problems/validation_failed",
  "title": "Validation failed",
  "status": 400,
  "detail": "The request body has 1 invalid field.",
  "instance": "/v1/orders",
  "code": "validation_failed",
  "errors": [{ "pointer": "/items/0/quantity", "message": "must be greater than 0" }]
}
```

The full list of codes, with their HTTP status and whether a retry can
succeed, is the
[error catalog](https://github.com/zippy-go/api/blob/main/errors/catalog.yaml).

## Conventions

- Timestamps are RFC 3339 strings in UTC.
- Money is always an object with `minor_units` (integer) and `currency`
  (ISO 4217), never a bare number.
- Property names are `snake_case`; enumeration values are lowercase.
- Clients must ignore properties and enumeration values they do not know:
  adding them is not a breaking change (see [Versioning](/versioning)).

## SDKs

The TypeScript SDK is generated from the OpenAPI document and lives in the
repository under `sdks/typescript`; it will be published to GitHub Packages
under the `@zippy-go` scope later and is not published yet:

```ts
import { client, getHealth } from '@zippy-go/api';

client.setConfig({
  baseUrl: 'https://sandbox.api.zippygo.example',
  headers: { 'X-Api-Key': process.env.ZIPPYGO_API_KEY },
});

const { data, error } = await getHealth();
```

Dart (OpenAPI Generator `dart-dio`) and Rust (`progenitor`) SDKs follow
when they are first needed.
