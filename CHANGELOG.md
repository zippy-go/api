# Changelog

All notable changes to the ZippyGo API contract are recorded here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the version numbers follow the versioning policy.

## [Unreleased]

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
