# Changelog

All notable changes to the ZippyGo API contract are recorded here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the version numbers follow the versioning policy.

## [Unreleased]

## [0.6.0] - 2026-10-15

### Added

- The live stream (specification `realtime-messaging`, tag `Live`):
  `GET /v1/live/stream?channels=` opens one server-sent events stream on
  the channels an app names, from the closed vocabulary (`broadcast`,
  `store-{location_id}-menu`, `private-broadcast`,
  `private-customer-{customer_id}-orders`, `private-order-{order_id}`,
  `private-location-{location_id}-orders|notices|catalog|kitchen|tables`,
  `private-partner-{partner_id}-agents`, `private-agents`,
  `private-orders`, `private-agent-{agent_id}-tasks`); a name no channel
  produces is `400` (`channel_unknown`); private channels are authorised
  when the stream opens and an open is refused as a whole with `errors` by
  position (`401`, `403`, `404`); public channels need no credential.
  Frames: `snapshot` (`AgentsSnapshot`) or `resync` (`Resync`) per channel
  on open, `signal` (`Signal`), `agent.position` (`AgentPositionFrame`),
  `agent.status` (`AgentStatusFrame`), `heartbeat` every 15 seconds and
  `close` (`Close`: `token_expired`, `revoked`, `replaced`).
- `GET /v1/live/config` (`LiveConfig`): whether live updates are available
  and how a client behaves (heartbeat, stale threshold, backoff, the cap of
  four connections per session, the board re-read interval); `503`
  (`unavailable`) on the stream when they are off.

## [0.5.0] - 2026-10-15

### Added

- Reference data (specification `platform-reference-data`): countries
  (`/v1/countries`, tag `Countries`) with their status and switches for
  orders and sign-in, each change with a reason, holiday calendars, the
  country layer of service policy and schedules and the default service
  area; currencies (`/v1/currencies`, tag `Currencies`).
- Service areas (`/v1/service-areas`, tag `Service areas`): the geography
  tree with PostGIS fences drawn at one level only; public resolution of a
  pin (`GET /v1/service-areas/resolve`, no token) to the area it is inside,
  the nearest serving one within the cap or the country's default, with
  `serviceable` and a reason; status changes with a reason and their
  deactivation impact; division with a dry run (`division-plan`), `divide`
  refused with `409` (`locations_stranded`) unless forced with a reason,
  and `merge`; the Verticals an area offers and their order; campaign slots
  and the validated display grid.
- Verticals (`/v1/verticals`, tag `Verticals`) with categories, image,
  lifecycle and reach; campaign slots (`/v1/campaign-slots/{id}`, tag
  `Campaign slots`), whose deletion repairs every grid that placed them.
- Store types and service types (`/v1/store-types`, `/v1/service-types`,
  tags `Store types` and `Service types`) with the closed field catalogues
  (`/v1/store-fields`, `/v1/service-fields`) and the lifecycle with
  `draft`; `409` (`illegal_transition`) on a move the lifecycle refuses.
- Platform settings (`/v1/settings`, tag `Settings`): the closed, bounded
  set with defaults; `400` (`setting_out_of_range`) outside the bounds;
  `DELETE` restores the default.
- Partner and Location layers of service policy and schedules (tag
  `Partner policy`): `GET`, `PUT /v1/partners/{partner_id}/policy` and
  `.../schedule`, the same under `.../locations/{location_id}`, policy
  versions, the explain `GET .../locations/{location_id}/policy/effective`
  naming the layer and version behind every field, the effective schedule
  and `GET .../schedule/trading?at=`.
- `Location.service_area_id`: the service area a location's pin resolves
  to; creating or moving a location whose pin is outside every area is
  `422` (`unprocessable`) on `/lat` and `/lng`.
- `POST /v1/auth/otp/request` answers `409` (`sign_in_closed`) for a phone
  number whose country is not accepting sign-in.
- Events `reference.vertical.transitioned`,
  `reference.country.status_changed` and
  `reference.service_area.status_changed`, version 1.

## [0.4.0] - 2026-10-15

### Added

- The conventions every operation honours, described on the root document
  and on the portal's Conventions page: problem codes dereferenceable at
  `GET /problems/{code}` (`getProblemType`, tag `Platform`, schemas
  `ProblemType` and `ProblemTypeDetail`); the `RateLimit-Limit`,
  `RateLimit-Remaining` and `RateLimit-Reset` headers on every response and
  `429` (`rate_limited`) with `Retry-After`; the `X-Correlation-Id` header
  (`CorrelationIdHeader`), accepted on every request and echoed on every
  response; `Idempotency-Key` (`IdempotencyKeyHeader`) on writes, with the
  replay header `Idempotent-Replayed`; `ETag` (header `ETag`),
  `If-None-Match` (`IfNoneMatchHeader`) with `304` and `If-Match`
  (`IfMatchHeader`) with `412` (`precondition_failed`) on versioned
  resources; `Deprecation`, `Sunset` and `Link` on a deprecated major and
  `410` (`version_retired`) after its sunset.
- Field-level codes under `validation_failed`: `malformed_identifier`,
  `cursor_invalid`, `idempotency_key_missing`, the filter grammar's
  `filter_unreadable`, `filter_field_unknown`,
  `filter_operator_unsupported`, `filter_value_unknown`,
  `filter_or_unindexed`, `filter_in_empty`, `filter_text_empty`,
  `filter_group_empty`, `filter_range_empty`, `filter_too_deep`,
  `filter_too_wide`, `sort_too_many` and `sort_field_unknown`, and
  `setting_out_of_range`, `unsupported_file_type`, `file_too_large` and
  `crop_outside` for the reference data and asset operations to come.
- Error codes `channel_unknown` (400), `illegal_transition` (409),
  `locations_stranded` (409), `sign_in_closed` (409), `asset_not_usable`
  (409) and `version_retired` (410).
- The collection grammar: `filter` (a JSON tree of `eq`, `in`, `range`,
  `text`, `within`, `and` and `or`), `sort` (up to three declared keys) and
  `facets` on `GET /v1/partners`, with `kind` as a named filter;
  `GET /v1/partners/filters` (`getPartnerFilters`, schemas `FilterSchema`
  and `FilterField`) and `GET /v1/partners/summary` (`getPartnerSummary`,
  `CollectionSummary`); facet counts in `PartnerList.facets` (`Facet`,
  `FacetCount`).
- The audit log (tag `Audit`): `GET /v1/audit-log` (`listAuditEntries`,
  schemas `AuditEntry`, `AuditActor`, `AuditTarget`, `AuditEntryList`),
  `GET /v1/audit-log/filters` (`getAuditFilters`) and
  `GET /v1/audit-log/{entry_id}` (`getAuditEntry`). Entries are never
  changed or deleted; the methods that would are `405` and logged.
- `Partner` and `Location` carry `version`, `created_by` and `updated_by`;
  `PartnerUpdate` takes an optional `reason` kept in the audit log with a
  status change; `GET` and `PATCH` of a partner or a location document the
  `ETag` and the conditional headers.
- `GET /v1/fleet/agents` and `GET /v1/live/agents` document `404` for a
  `partner_id` the caller does not belong to, answered like an unknown id.
- `generated/platform-openapi.json`, the document the platform serves, and
  `pnpm platform:check`, which fails when a path and method the platform
  serves is missing from this contract or the contract describes one the
  platform does not serve.
- Portal: the Conventions page (errors and the catalogue, identifiers,
  money and time, paging, filtering, idempotency, conditional requests,
  rate limits, correlation, deprecation).

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
- Events, version 1, each with a payload schema and a validated example:
  `identity.user.registered`, `identity.session.created`,
  `identity.invitation.sent`, `identity.invitation.accepted`,
  `tenancy.partner.created`, `tenancy.partner.status_changed`,
  `tenancy.location.created`, `tenancy.membership.created` and
  `tenancy.service.updated`. Payloads carry identifiers only, never email
  addresses or phone numbers; the identity events that are not scoped to a
  partner have `partner_id: null` in the envelope.
- Portal: the Authentication guide (one-time codes, passwords, token
  lifetimes, cookie versus native refresh, verifying tokens with the JWKS,
  rate limits); Concepts describes users, memberships and their roles,
  services and their kinds, and the platform realm; Getting started signs
  in and creates a partner before anything else.

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
