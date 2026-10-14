# Getting started

The ZippyGo API is a JSON API over HTTPS. This page covers what you need to
make a first request and the first things to do; the
[API reference](/reference) documents every endpoint.

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

All paths are prefixed with the major version, currently `/v1`, except
the token signing keys at `/.well-known/jwks.json`.

## Authentication

Requests carry an access token issued by ZippyGo: sign in with a one-time
code or a password, send `Authorization: Bearer <access_token>` and
refresh the token before it expires, after 15 minutes.
[Authentication](/authentication) walks through the flows, the token
lifetimes, how browsers and native apps handle the refresh token and how
to verify tokens yourself.

Server-to-server integrations will use partner-scoped API keys in the
`X-Api-Key` header (`ApiKey` in the reference); the operations that issue
keys are not released yet. `POST /v1/fleet/location-pings` still takes
the temporary development credential in the `X-Dev-Api-Key` header
(`DevApiKey`) until agents' devices get credentials of their own.

Health checks need no credentials:

```sh
curl https://sandbox.api.zippygo.example/v1/health
```

```json
{ "status": "ok", "version": "0.3.0", "checked_at": "2026-10-14T08:00:00Z" }
```

## First steps

Everything in the API belongs to a partner, so the first thing to do after
signing in is to create one. The user who creates a partner is its owner.

Sign in with a one-time code and keep the `access_token` from the response
(the two calls are shown in full under [Authentication](/authentication)):

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","identifier":"owner@example.com"}'
curl -X POST https://sandbox.api.zippygo.example/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"challenge_id":"<challenge_id from the first call>","code":"<code from the email>"}'
```

Create the partner:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/partners \
  -H "Authorization: Bearer $ZIPPYGO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kind":"organisation","name":"Example Partner"}'
```

```json
{
  "id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a02",
  "kind": "organisation",
  "name": "Example Partner",
  "legal_name": null,
  "status": "pending",
  "contact_email": null,
  "contact_phone": null,
  "created_at": "2026-10-14T08:05:00Z",
  "updated_at": "2026-10-14T08:05:00Z"
}
```

A new partner is `pending` until the platform realm activates it.
`GET /v1/me` now lists the membership with the role `owner`; the access
token carries it from the next refresh on. From here, as the owner:

- add a location with `POST /v1/partners/{partner_id}/locations` (name,
  address, coordinates, time zone);
- switch on a service with
  `PUT /v1/partners/{partner_id}/services/{kind}`, where `kind` is
  `product_sales`, `field_service` or `delivery`;
- invite a teammate with `POST /v1/partners/{partner_id}/invitations`
  (email address and role); they join by accepting the link in the email.

[Concepts](/concepts) explains the terms; the
[API reference](/reference) has every field.

## Errors

Every error response is an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457)
problem details document with the media type `application/problem+json`;
the [API reference](/reference) describes it as the `Problem` schema.
Branch on the `code` member, which is stable, rather than on the text:

```json
{
  "type": "/problems/validation_failed",
  "title": "Validation failed",
  "status": 400,
  "detail": "The request body has 1 invalid field.",
  "instance": "/v1/auth/password",
  "code": "validation_failed",
  "errors": [
    { "pointer": "/new_password", "message": "must be at least 12 characters long", "code": "password_weak" }
  ]
}
```

An `errors` entry carries a `code` of its own when the catalog defines
one for the field-level problem, as `password_weak` here. The full list of
codes, with their HTTP status and whether a retry can succeed, is the
[error catalog](https://github.com/zippy-go/api/blob/main/errors/catalog.yaml).

## Live data

`GET /v1/live/agents` and `GET /v1/live/events` push changes as server-sent
events instead of being polled; see [Live streams](/live-streams).

## Conventions

- Timestamps are RFC 3339 strings in UTC.
- Identifiers are UUIDs.
- Money is always an object with `minor_units` (integer) and `currency`
  (ISO 4217), never a bare number.
- Property names are `snake_case`; enumeration values are lowercase.
- Clients must ignore properties and enumeration values they do not know:
  adding them is not a breaking change (see [Versioning](/versioning)).

## SDKs

The TypeScript SDK is generated from the OpenAPI document and lives in the
repository under `sdks/typescript`; it will be published to GitHub Packages
under the `@zippy-go` scope later and is not published yet. The client
sends the access token through its `auth` option:

```ts
import { client, createPartner, getMe } from '@zippy-go/api';

client.setConfig({
  baseUrl: 'https://sandbox.api.zippygo.example',
  auth: () => accessToken, // from verifyOtp or signInWithPassword
});

const { data: me } = await getMe();
const { data: partner, error } = await createPartner({
  body: { kind: 'organisation', name: 'Example Partner' },
});
```

Dart (OpenAPI Generator `dart-dio`) and Rust (`progenitor`) SDKs follow
when they are first needed.
