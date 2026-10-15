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
walks through them. Background jobs use service tokens instead, described
at the end of this page.

## Surfaces

Every session is for one surface, and so is every token it issues:

| Surface         | `audience` | Signs in with                              | Refresh token idle / absolute limit |
| --------------- | ---------- | ------------------------------------------ | ----------------------------------- |
| Partner console | `partner`  | One-time code or password, then two-step sign-in when it is on | 14 days / 90 days |
| Mission Control | `platform` | Password and a second factor, platform staff only | 60 minutes / 12 hours |
| Agent app       | `agent`    | One-time code, agents only                 | 30 days / 180 days                  |

The Agent app admits agents only: people who hold an agent membership in
a Service. Anybody else signing in to it gets the answer every failed
sign-in gets, `401` `authentication_failed`, and a code asked for it never
creates an account.

A token is refused by every surface it does not name: a Partner console
token opens nothing in Mission Control, and the other way round. A sign-in
names its surface in `audience` and says how the refresh token travels in
`delivery`:

- `cookie`, for browsers: the refresh token is set in an `httpOnly`,
  `Secure`, `SameSite=Strict` cookie named for the surface
  (`zg_refresh_partner`, `zg_refresh_platform`, `zg_refresh_agent`) and
  scoped to `Path=/v1/auth`, so it is sent to the refresh and sign-out
  operations only, and two consoles open in one browser never disturb each
  other. `refresh_token` in the body is `null`.
- `body`, for mobile and desktop apps: the refresh token comes in
  `refresh_token`; keep it in the platform's secure storage.

The choice is bound to the session for good. Both are required on every
sign-in: without `audience` the answer is `400` `validation_failed` with
`audience_required` on `/audience`, without `delivery` the same with
`delivery_required`. Since 0.10.0 there is no sign-in without a surface: the
`zg_refresh` cookie, the `X-Client-Type` header and the password sign-in
that opened Mission Control for platform staff unasked are gone.

## One-time codes

The default way to sign in to the Partner console and the Agent app, and
the way an account comes into being: the first successful code for an
email address or a phone number creates the user, on the Partner console.
Mission Control is never offered a code.

Request a code. The response is `202` with a challenge whether or not an
account exists for the identifier, so the operation reveals nothing about
who has one. A code works for five minutes:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","identifier":"owner@example.com","audience":"partner"}'
```

```json
{
  "challenge_id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a23",
  "expires_at": "2026-10-14T08:05:00Z",
  "delivery": "email"
}
```

Then verify the six-digit code from the email or the text message, naming
the surface and the delivery. The response is a `TokenResponse`:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"challenge_id":"0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a23","code":"123456","audience":"partner","delivery":"body"}'
```

```json
{
  "access_token": "eyJhbGciOiJFZERTQSIsImtpZCI6...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "c2FtcGxlLXJlZnJlc2gtdG9rZW4",
  "user": {
    "id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a20",
    "email": "owner@example.com",
    "phone": null,
    "display_name": null,
    "created_at": "2026-10-14T08:00:00Z"
  },
  "audience": "partner",
  "two_step_setup_required": false
}
```

A wrong code answers `401` with the code `invalid_code`; an unknown, used
or expired challenge answers `401` with `code_expired`. Request a new code
in both cases. Five wrong codes lock the challenge, and every further
attempt answers `429` with `too_many_attempts`.

## Passwords

Sign in with an email address and a password, naming the surface:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/password/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"example-passphrase-2026","audience":"partner","delivery":"cookie"}'
```

The response is the same `TokenResponse`. An unknown email address, a
wrong password, a user without a password, a disabled account and a
surface the account may not enter all answer `401`
`authentication_failed`, in about the same time, without saying which it
was.

A user gets a password by choosing one when accepting an invitation, or by
setting one with `POST /v1/auth/password` after signing in with a code.
A first password is a sensitive act: prove it is you first with
`POST /v1/auth/step-up` (below), unless the session signed in less than ten
minutes ago, since signing in is that proof. Passwords are 12 to 200 characters and
not blank; anything else is rejected with `400` `validation_failed` and an
`errors` entry whose `code` is `password_weak`. Changing a password needs
the current one and ends every session of the user, the current one
included.

A forgotten password is reset through a link. Ask for it from the console
the person signs in to; the answer is always `202`, and the email goes out
only when the address signs in there:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/password/reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","audience":"partner"}'
```

The link opens `/reset-password/{token}` on that console, works once, for
thirty minutes, and only there; asking again makes earlier links useless.
The console's page sends the token with the new password to
`POST /v1/auth/password/reset`, which ends every session of the user. An
expired, used, replaced or foreign link answers `410` `link_invalid`.

## Two-step sign-in

A person turns on two-step sign-in with an authenticator app: they start
with `POST /v1/auth/two-step/setup`, which returns a secret and an
`otpauth://` link to show as a QR code, and finish with a code from the app
at `POST /v1/auth/two-step/confirm`, which returns ten recovery codes,
shown once. `POST /v1/auth/two-step/recovery-codes` replaces them and
`POST /v1/auth/two-step/disable` turns two-step sign-in off, both after the
password again.

With two-step sign-in on, a right password or code answers `202` with a
`TwoStepChallenge` instead of a session:

```json
{
  "challenge_id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a26",
  "expires_at": "2026-10-14T08:05:00Z",
  "methods": ["authenticator", "recovery_code"]
}
```

Complete the sign-in within five minutes with six digits from the app, or
one recovery code, at `POST /v1/auth/two-step/verify`; the session goes to
the surface the sign-in named, delivered as it stated. Five wrong codes end
the challenge.

Platform staff never reach Mission Control with a password alone. Until
they have set up a second factor, their Mission Control session
(`two_step_setup_required` is `true`) reaches only `GET /v1/me`, the two
set-up operations and sign-out; everything else answers `403`
`two_step_setup_required`. A person who lost their phone and their
recovery codes asks an administrator: a partner owner turns it off with
`POST /v1/partners/{partner_id}/members/{membership_id}/two-step/reset`,
and for platform staff it is a four-eyes proposal.

## Step-up before sensitive acts

Some acts need a fresh proof that the signed-in person is at the keyboard:
setting a first password and starting a change of the sign-in address,
today. Without one they answer `403` `step_up_required`, which a client
reads as a prompt, not as a sign-out. Prove it with exactly one of the
password, an authenticator code, or a code sent to the account's own
address by `POST /v1/auth/step-up/code`:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/step-up \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"password":"example-passphrase-2026"}'
```

The proof stands ten minutes, for this session only; then repeat the act.
A sign-in is a proof too: for its first ten minutes a session needs no
step-up, as proven with the factor the person used last.

## Changing the sign-in address

`POST /v1/auth/identifier-change` sends a code to a new email address or
phone number; the account is unchanged until
`POST /v1/auth/identifier-change/confirm` receives the code, the old
address is told and every other session ends. `GET /v1/me` shows the
pending address, and `DELETE /v1/auth/identifier-change` cancels it.

## Tokens and sessions

| Token         | Where it travels                                                   | Lifetime                                                                                                   |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Access token  | `access_token` in the `TokenResponse`; sent as `Authorization: Bearer` | 15 minutes (`expires_in` is `900`). Renew it with `POST /v1/auth/refresh` before it expires.            |
| Refresh token | The surface's cookie for `cookie` delivery, `refresh_token` in the body for `body` delivery | Single use: every refresh issues a new one. Valid for the surface's idle limit from its issue; the session ends at the absolute limit whatever the refreshes. |

The access token is a JSON Web Token typed `at+jwt` and signed with EdDSA
(Ed25519). Its claims:

| Claim         | Meaning                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------- |
| `sub`         | The user id; on a service token, the job's credential.                                       |
| `iss`         | The issuer: the base URL of the API host that issued the token.                              |
| `aud`         | The surface: `partner`, `platform`, `agent`, or `service` for a background job.              |
| `iat`, `exp`  | Issued-at and expiry as Unix timestamps; `exp` is at most 15 minutes after `iat`.            |
| `jti`         | The token id, unique per token.                                                              |
| `sid`         | The session id, shared by every token of the session.                                        |
| `memberships` | On a `partner` token, the user's memberships as a compact list of `{ "p": "<partner_id>", "r": "<role>" }`. |
| `platform`    | On a `platform` token, the user's platform role names.                                       |
| `job`         | On a `service` token only, the one job it may do.                                            |
| `act`         | On an impersonation token only: the platform member viewing the Partner console as `sub`, with an owner's consent. |

The claims are fixed when the token is issued and are hints only: the API
decides what a user may do from its records on every request, so a
revoked grant stops working at once. `GET /v1/me` reflects the current
state, with every grant and the permissions it carries.

`POST /v1/auth/sign-out` ends the session of the bearer token, or of the
refresh cookie or body token when the access token has expired, and clears
the surface's cookie; with `{"everywhere": true}` it ends every session of
the user on every surface. It answers `204`, whether or not a session was
left to end. A Mission Control access token stops working on its next
request; other access tokens stay valid until their `exp`, at most 15
minutes, so discard them.

## Viewing a Partner's console with consent

Platform staff view a Partner's console as one of its owners only with that
owner's consent, through a view-as token from
`POST /v1/platform/impersonation/sessions`. It carries `act` and reaches
the consented Partner and nothing else: any other Partner of the owner's
answers `404` as if it did not exist, `GET /v1/me` lists the consented
membership alone and says who views in `impersonation`, a viewing-only
consent refuses every change (`403` `impersonation_read_only`), and a
consent allowing changes still refuses anything outside that Partner,
the owner's password, two-step, sign-out and new Partners included (`403`
`forbidden`). The member ends it at
`POST /v1/platform/impersonation/sessions/{impersonation_id}/end`.

## Refreshing

**Browsers** call `POST /v1/auth/refresh` with the cookie and the surface,
so the right cookie is read; the response carries a new access token and
sets a new cookie:

```ts
const response = await fetch('https://sandbox.api.zippygo.example/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audience: 'partner' }),
});
const { access_token } = await response.json();
```

**Apps** send the refresh token back in the body and replace it with the
one in the response:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"c2FtcGxlLXJlZnJlc2gtdG9rZW4"}'
```

For both kinds of client, a refresh token works once. The token spent by
the latest refresh is forgiven for fifteen seconds and answers with the
same successor, so two tabs refreshing at once stay signed in; presenting
an older one revokes the whole session, which protects against a stolen
token. A refresh that answers `401` (`unauthenticated`) therefore always
means "sign in again".

## With the TypeScript SDK

The SDK functions are named after the operations. The client takes the
access token through its `auth` option and sends it on every operation
that needs one:

```ts
import { client, getMe, requestOtp, verifyOtp, verifyTwoStep } from '@zippy-go/api';

client.setConfig({ baseUrl: 'https://sandbox.api.zippygo.example' });

const { data: challenge } = await requestOtp({
  body: { channel: 'email', identifier: 'owner@example.com', audience: 'partner' },
});
const { data, response } = await verifyOtp({
  body: {
    challenge_id: challenge!.challenge_id,
    code: '123456',
    audience: 'partner',
    delivery: 'body', // 'cookie' in a browser
  },
});

// 202: two-step sign-in is on, and the session waits for the second step.
const session =
  response.status === 202 && data && 'methods' in data
    ? (await verifyTwoStep({ body: { challenge_id: data.challenge_id, code: '654321' } })).data
    : data;

client.setConfig({ auth: () => (session as { access_token: string }).access_token });

const { data: me } = await getMe();
```

In a browser, pass `credentials: 'include'` in `client.setConfig` so that
the surface's cookie is sent to `refreshSession` and `signOut`.

## Service tokens for background jobs

Workers, the simulator and CI never sign in as a person. Each job holds a
credential, issued when it is provisioned, and mints a service token from
it:

```sh
curl -X POST https://sandbox.api.zippygo.example/v1/auth/service-tokens \
  -H "Content-Type: application/json" \
  -d '{"credential":"<the job credential>"}'
```

```json
{ "access_token": "eyJhbGciOiJFZERTQSIs...", "token_type": "Bearer", "expires_in": 3600, "job": "simulator" }
```

A service token (`aud` `service`) names one job, holds no memberships and
lasts at most an hour; mint another when it expires. Every operation for
people refuses it, and only the operations a job may call accept it, such
as `POST /v1/fleet/location-pings` for the simulator.

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
accept only `EdDSA` and the type `at+jwt`, and check `iss`, `exp` and an
`aud` naming the surface your service serves (`partner` for a partner
backend). Cache the key set and fetch it again when a token carries a `kid`
you do not have: keys rotate, a new key is published before it signs
tokens and a retired key stays in the set while tokens signed with it can
still be valid. With a JOSE library, for example
[`jose`](https://github.com/panva/jose):

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL('https://sandbox.api.zippygo.example/.well-known/jwks.json'));

const { payload } = await jwtVerify(token, jwks, {
  issuer: 'https://sandbox.api.zippygo.example',
  audience: 'partner',
  typ: 'at+jwt',
  algorithms: ['EdDSA'],
});
```

Treat `memberships` and `platform` in the payload as a snapshot taken when
the token was issued, at most 15 minutes old.

## Rate limits

- `POST /v1/auth/otp/request` refuses a second code for an identifier
  within a minute, more than ten a day for one identifier and more than two
  hundred an hour from one client. Over a limit it answers `429` with the
  code `too_many_requests` and a `Retry-After` header with the seconds to
  wait.
- Five failed sign-ins in fifteen minutes for one identifier on one
  surface, or from one client, lock it for the rest of the window: `429`
  `too_many_requests` with `Retry-After`. Wrong codes, wrong second steps
  and wrong passwords given to prove the signed-in person all count.
- `POST /v1/auth/otp/verify` and `POST /v1/auth/two-step/verify` end the
  challenge after five wrong codes and answer `429` with
  `too_many_attempts`; the only way forward is a new sign-in.
- Five password links in fifteen minutes per address and per client are
  sent; beyond that the answer is the same `202` and nothing is sent.

Clients honour `Retry-After` and do not retry a `401` from the sign-in
operations.

## After signing in

On the Partner console, everything belongs to a partner. A new user has no
memberships yet (`GET /v1/me` returns an empty list), creates a partner
with `POST /v1/partners` and becomes its owner, or joins an existing one
by accepting an invitation. An invitation into the platform opens Mission
Control even before a role is granted: until a second administrator
approves the role it was proposed with, the session reaches `GET /v1/me`
(no roles), the two-step set-up and sign-out, and everything else answers
`403` `access_denied`. What a member may do is decided by the roles
they are granted, at the whole partner or at chosen Locations and
Services; the *Access* tag of the reference has the details.
[Getting started](/getting-started) continues from there.
