# Authentication

Every operation except the health checks, the token signing keys and the
sign-in operations themselves takes an access token issued by ZippyGo in
the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

An access token is obtained by signing in with a one-time code or with a
password, is valid for 15 minutes and is renewed with a refresh token. The
operations are tagged *Auth* in the [API reference](/reference); this page
walks through them. The one exception for now is
`POST /v1/fleet/location-pings`, which still takes the temporary
development credential in the `X-Dev-Api-Key` header until agents'
devices get credentials of their own.

## One-time codes

The default way to sign in, and the way an account comes into being: the
first successful code for an email address or a phone number creates the
user.

Request a code. The response is `202` with a challenge whether or not an
account exists for the identifier, so the operation reveals nothing about
who has one:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","identifier":"owner@example.com"}'
```

```json
{
  "challenge_id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a23",
  "expires_at": "2026-10-14T08:10:00Z",
  "delivery": "email"
}
```

Then verify the six-digit code from the email or the text message. The
response is a `TokenResponse`:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"challenge_id":"0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a23","code":"123456"}'
```

```json
{
  "access_token": "eyJhbGciOiJFZERTQSIsImtpZCI6...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": null,
  "user": {
    "id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a20",
    "email": "owner@example.com",
    "phone": null,
    "display_name": null,
    "created_at": "2026-10-14T08:00:00Z"
  }
}
```

A wrong code answers `401` with the code `invalid_code`; a correct code
presented after `expires_at` answers `401` with `code_expired`. Request a
new code in both cases. After too many wrong codes the challenge is locked
and every further attempt answers `429` with `too_many_attempts`.

## Passwords

A user who prefers not to wait for a code sets a password after signing
in with one, through `POST /v1/auth/password` with `current_password` set
to `null` the first time, or chooses one when accepting an invitation.
Passwords are at least 12 characters long; a shorter one is rejected with
`400` `validation_failed` and an `errors` entry whose `code` is
`password_weak`.

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/password/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"example-passphrase-2026"}'
```

The response is the same `TokenResponse`. A wrong email address, a wrong
password or a user without a password all answer `401` `unauthenticated`,
without saying which it was.

## Tokens and sessions

| Token         | Where it travels                                                   | Lifetime                                                                                                   |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Access token  | `access_token` in the `TokenResponse`; sent as `Authorization: Bearer` | 15 minutes (`expires_in` is `900`). Renew it with `POST /v1/auth/refresh` before it expires.            |
| Refresh token | The `zg_refresh` cookie for browsers, `refresh_token` in the body for native clients | Single use: every refresh issues a new one and invalidates the old one. The session it belongs to ends on sign-out, on reuse of a refresh token or when the server expires it. |

The access token is a JSON Web Token signed with EdDSA (Ed25519). Its
claims:

| Claim         | Meaning                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------- |
| `sub`         | The user id.                                                                                 |
| `iss`         | The issuer: the base URL of the API host that issued the token.                              |
| `aud`         | `zippygo`.                                                                                   |
| `iat`, `exp`  | Issued-at and expiry as Unix timestamps; `exp` is at most 15 minutes after `iat`.            |
| `jti`         | The token id, unique per token.                                                              |
| `sid`         | The session id, shared by every token of the session.                                        |
| `memberships` | The user's memberships as a compact list of `{ "p": "<partner_id>", "r": "<role>" }`.        |
| `platform`    | The user's platform roles; empty for everyone outside the platform realm.                    |

The claims are fixed when the token is issued. When the user joins or
leaves a partner, the token catches up at the next refresh; `GET /v1/me`
reflects the current state at once.

`POST /v1/auth/sign-out`, with the access token, revokes the session and
clears the cookie. The access token itself stays valid until its `exp`, at
most 15 minutes, so discard it.

## Browsers and native clients

Where the refresh token travels depends on the client, because a browser
should never hold a long-lived credential where scripts can read it.

**Browsers** receive the refresh token in a cookie set by the sign-in
response: `zg_refresh`, `HttpOnly`, `Secure`, `SameSite=Strict` and scoped
to `Path=/v1/auth`, so it is sent only to the refresh and sign-out
operations and never to the rest of the API. `refresh_token` in the body
is `null`. To refresh, call `POST /v1/auth/refresh` with the cookie and no
body; the response carries a new access token and sets a new cookie:

```ts
const response = await fetch('https://sandbox.api.zippygo.example/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
const { access_token } = await response.json();
```

**Native clients** (mobile and desktop apps) send the header
`X-Client-Type: native` on the sign-in operations (`POST /v1/auth/otp/verify`,
`POST /v1/auth/password/sign-in`, `POST /v1/invitations/{token}/accept`).
The refresh token then comes in `refresh_token` in the body and no cookie
is set. Keep it in the platform's secure storage, send it back in the body
of `POST /v1/auth/refresh` and replace it with the one in the response:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"c2FtcGxlLXJlZnJlc2gtdG9rZW4"}'
```

For both kinds of client, a refresh token works once. Presenting one that
was already used revokes the whole session, which protects against a
stolen token; the user signs in again. A refresh that answers `401`
(`unauthenticated`) therefore always means "sign in again", and a refresh
whose response was lost cannot be retried with the same token.

## With the TypeScript SDK

The SDK functions are named after the operations. The client takes the
access token through its `auth` option and sends it on every operation
that needs one:

```ts
import { client, createPartner, getMe, requestOtp, verifyOtp } from '@zippy-go/api';

client.setConfig({ baseUrl: 'https://sandbox.api.zippygo.example' });

const { data: challenge } = await requestOtp({
  body: { channel: 'email', identifier: 'owner@example.com' },
});
const { data: session } = await verifyOtp({
  body: { challenge_id: challenge!.challenge_id, code: '123456' },
  headers: { 'X-Client-Type': 'native' }, // omit in a browser
});

client.setConfig({ auth: () => session!.access_token });

const { data: me } = await getMe();
const { data: partner } = await createPartner({
  body: { kind: 'organisation', name: 'Example Partner' },
});
```

In a browser, pass `credentials: 'include'` in `client.setConfig` so that
the `zg_refresh` cookie is sent to `refreshSession`.

## Verifying tokens yourself

A service of your own that receives ZippyGo access tokens, for example a
partner backend called by the partner's web app, can verify them without
calling the API. The public keys are published as a JSON Web Key Set at
`GET /.well-known/jwks.json`, which needs no credentials:

```json
{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "kid": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a50",
      "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
      "use": "sig",
      "alg": "EdDSA"
    }
  ]
}
```

Verify the signature with the key whose `kid` matches the token header,
accept only `EdDSA`, and check `iss`, `aud` (`zippygo`) and `exp`. Cache
the key set and fetch it again when a token carries a `kid` you do not
have: keys rotate, a new key is published before it signs tokens and a
retired key stays in the set while tokens signed with it can still be
valid. With a JOSE library, for example
[`jose`](https://github.com/panva/jose):

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL('https://sandbox.api.zippygo.example/.well-known/jwks.json'));

const { payload } = await jwtVerify(token, jwks, {
  issuer: 'https://sandbox.api.zippygo.example',
  audience: 'zippygo',
  algorithms: ['EdDSA'],
});
```

Treat `memberships` and `platform` in the payload as a snapshot taken when
the token was issued, at most 15 minutes old.

## Rate limits

- `POST /v1/auth/otp/request` is limited per identifier and per client.
  Over the limit it answers `429` with the code `too_many_requests` and a
  `Retry-After` header with the seconds to wait.
- `POST /v1/auth/otp/verify` locks the challenge after too many wrong
  codes and answers `429` with `too_many_attempts`; the only way forward is
  a new code.
- The password sign-in and the refresh operations answer `429` with a
  `Retry-After` header when called too often.

The exact quotas are published with the sandbox. Clients honour
`Retry-After` and do not retry a `401` from the sign-in operations.

## After signing in

Everything in the API belongs to a partner. A new user has no memberships
yet (`GET /v1/me` returns an empty list), creates a partner with
`POST /v1/partners` and becomes its owner, or joins an existing one by
accepting an invitation. [Getting started](/getting-started) continues
from there.
