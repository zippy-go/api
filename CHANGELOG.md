# Changelog

All notable changes to the ZippyGo API contract are recorded here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the version numbers follow the versioning policy.

## [Unreleased]

## [0.3.0] - 2026-10-14

### Added

- Identity, under the tag `Auth`: `POST /v1/auth/otp/request` (`requestOtp`),
  `POST /v1/auth/otp/verify` (`verifyOtp`), `POST /v1/auth/password/sign-in`
  (`signInWithPassword`), `POST /v1/auth/password` (`changePassword`),
  `POST /v1/auth/refresh` (`refreshSession`), `POST /v1/auth/sign-out`
  (`signOut`) and `GET /v1/me` (`getMe`), with the schemas `OtpChannel`,
  `OtpRequest`, `OtpChallenge`, `OtpVerifyRequest`, `PasswordSignInRequest`,
  `PasswordChangeRequest`, `RefreshRequest`, `TokenResponse`, `User`, `Me`,
  `Membership` and `MembershipRole`. Sign-in creates the user on the first
  successful one-time code. The access token claims are documented on the
  `Auth` tag.
- The `X-Client-Type` header (`ClientTypeHeader`) on the sign-in operations:
  native clients send `native` and receive the refresh token in the body;
  browsers receive it in the `httpOnly` cookie `zg_refresh`, scoped to
  `/v1/auth`. Refresh tokens rotate on every use and reuse revokes the
  session.
- `GET /.well-known/jwks.json` (`getJwks`, tag `Platform`): the Ed25519
  public keys that verify access tokens (`JsonWebKeySet`, `JsonWebKey`).
- Error codes `invalid_code` (401), `code_expired` (401), `too_many_requests`
  (429) and `too_many_attempts` (429); the detail code `password_weak` under
  `validation_failed`, carried in the new optional `code` member of the
  entries of `Problem.errors`.
- Partners (tag `Partners`): `POST /v1/partners` (`createPartner`, the
  caller becomes the owner), `GET /v1/partners` (`listPartners`, platform
  realm only, paginated with `limit` and `cursor`),
  `GET /v1/partners/{partner_id}` (`getPartner`) and `PATCH` (`updatePartner`,
  status changes platform-only), with `Partner`, `PartnerKind`,
  `PartnerStatus`, `PartnerCreate`, `PartnerUpdate` and `PartnerList`, and
  the shared path parameter `PartnerIdPath`.
- Locations (tag `Locations`): `POST` and `GET /v1/partners/{partner_id}/locations`
  (`createLocation`, `listLocations`), `GET` and `PATCH`
  `/v1/partners/{partner_id}/locations/{location_id}` (`getLocation`,
  `updateLocation`), with `Location`, `LocationStatus`, `LocationCreate`,
  `LocationUpdate`, `LocationList` and the common `Address` schema.
- Memberships (tag `Memberships`): `GET /v1/partners/{partner_id}/memberships`
  (`listMemberships`) and `DELETE /v1/partners/{partner_id}/memberships/{membership_id}`
  (`removeMembership`, owners only; the last owner cannot be removed), with
  `MembershipList`.
- Invitations (tag `Invitations`): `POST` and `GET /v1/partners/{partner_id}/invitations`
  (`createInvitation`, `listInvitations`),
  `DELETE /v1/partners/{partner_id}/invitations/{invitation_id}`
  (`revokeInvitation`) and `POST /v1/invitations/{token}/accept`
  (`acceptInvitation`, no credentials, creates the user if needed and signs
  them in), with `Invitation`, `InvitationStatus`, `InvitationCreate`,
  `InvitationList`, `InvitationAcceptRequest` and `InvitationAccepted`.
- Services (tag `Services`): `GET /v1/partners/{partner_id}/services`
  (`listServices`) and `PUT /v1/partners/{partner_id}/services/{kind}`
  (`upsertService`), with `Service`, `ServiceStatus`, `ServiceUpsert` and
  `ServiceList`.
- Error code `invitation_invalid` (410).
- `ServiceKind` gains the values `product_sales` and `field_service` next to
  `delivery`; clients tolerate unknown values by contract.

### Changed

- The `Bearer` security scheme means an access token issued by ZippyGo: an
  EdDSA-signed JWT valid for 15 minutes, obtained from the `Auth` operations.
  The scheme itself (`http`, `bearer`, `JWT`) is unchanged.
- `DevApiKey` stays accepted by `POST /v1/fleet/location-pings` only; its
  replacement and retirement will be announced here.

## [0.2.0] - 2026-10-14

### Added

- `GET /v1/health/details`: the health of the API and of each dependency
  (`HealthDetails`, `HealthChecks`, `DependencyCheck`, `OutboxCheck`,
  `CheckStatus`); `503` with the same body when the service is down.
- `GET /v1/fleet/agents`: agents with their status and last known position
  (`Agent`, `AgentPosition`, `AgentStatus`, `ServiceKind`, `AgentList`),
  filterable by `partner_id` and `status`.
- `POST /v1/fleet/location-pings`: batches of 1 to 500 position reports
  (`LocationPing`, `LocationPingBatch`, `LocationPingsAccepted`), answered
  with `202`.
- `GET /v1/events`: the most recent events, newest first, with `limit` and
  `after` (`Event`, `EventList`).
- `GET /v1/live/agents` and `GET /v1/live/events`: server-sent event streams
  (`ServerSentEventStream`) with the event types `snapshot`, `position`,
  `status`, `event` and `heartbeat`; the frame data schemas `AgentSnapshot`,
  `AgentPositionUpdate` and `AgentStatusUpdate`.
- The `DevApiKey` security scheme (`X-Dev-Api-Key` header), a temporary
  development credential used by `POST /v1/fleet/location-pings` until the
  identity module replaces it.
- The tags `Live` and `Events`, and the shared `PartnerIdQuery` parameter.
- Error code `unprocessable` (422): a well-formed request that cannot be
  processed as a whole.
- Events `fleet.agent.online` and `fleet.agent.offline`, version 1, with
  payload schemas and examples.
- Portal: the Live streams page; Concepts describes an agent as a
  membership in a partner's service, not an identity.
- `info.license` in the OpenAPI document: the contract, the SDKs and the
  portal are released under the MIT licence.

### Changed

- Event envelope: `partner_id` and `correlation_id` may be `null`
  (platform-level events, events not caused by a traceable request), and
  `correlation_id` is a UUID. Both keys are always present.
- The common schema `Error` is renamed to `Problem`; the RFC 9457 problem
  details shape is unchanged. The TypeScript SDK exports the type as
  `Problem` and no longer shadows the global `Error`.

## [0.1.0] - 2026-10-14

### Added

- OpenAPI 3.1 document with `GET /v1/health`, the `ApiKey` and `Bearer`
  security schemes and the tags for every domain.
- Common schemas: `Error` (RFC 9457 problem details), `Money` and
  `HealthResponse`.
- Event envelope schema and the event catalog with `platform.ping`.
- Error catalog with twelve stable error codes.
- TypeScript SDK generated from the OpenAPI document.
- Developer portal with guides, concepts, API reference and this changelog.
