# Conventions

What every operation honours, whoever calls it: the company's own apps and
outside developers alike use one API. This page is the contract behind the
[API reference](/reference); each operation's description says what it
does, this page says how it behaves.

## Errors

Every error is an RFC 9457 problem details document with the media type
`application/problem+json` and the `Problem` schema: `type`, `title`,
`status`, `detail`, `instance` and `code`, with `errors` when the problem
is specific to parts of the request. Branch on `code`, never on `title` or
`detail`; `detail` is a sentence written for the person on the other end
that a screen may show as it is.

A problem's `type` is `/problems/{code}` resolved against the API host, and
fetching it with `GET /problems/{code}` answers the catalogue entry: the
title, the status, whether retrying can help, a description and the
field-level codes the problem may carry. A code is never renamed or reused
and its status is part of the contract.

| Status | Codes |
| --- | --- |
| 400 | `validation_failed` (every failing part listed in `errors` with a JSON Pointer, a sentence and, where defined, a code such as `malformed_identifier`, `cursor_invalid`, `password_weak`, `gstin_invalid`, `pan_invalid`, `ifsc_invalid`, `audience_required`, `delivery_required`, `code_invalid`, `audience_not_allowed` or one of the `filter_*` and `sort_*` codes), `channel_unknown`, `unknown_permission`, `invalid_scope` |
| 401 | `unauthenticated`, `authentication_failed`, `invalid_code`, `code_expired` |
| 403 | `forbidden`, `not_in_plan`, `access_denied` and `not_enabled_for_partner` (each naming the permission), `permission_escalation`, `no_location_assigned`, `step_up_required`, `two_step_setup_required`, `self_approval`, `consent_required`, `impersonation_read_only` |
| 404 | `not_found`, also for another tenant's record, identical to an id that never existed |
| 405 | `method_not_allowed` |
| 409 | `conflict`, `illegal_transition`, `locations_stranded`, `sign_in_closed`, `idempotency_key_reuse`, `asset_not_usable`, `activation_blocked` (each blocker in `errors` with a code such as `document_missing` or `no_fulfilment`), `partner_archived`, `zone_not_serving`, `vertical_not_offered`, `service_required`, `locations_open`; access: `permission_not_grantable`, `partner_cannot_sign_in`, `outside_entitlements`, `cross_tenant_role`, `cross_tenant_scope`, `role_maintained`, `role_name_reserved`, `role_in_use`, `last_owner`, `cannot_disable_self`, `two_step_self`, `identifier_taken`, `approval_required`, `approval_voided`, `approval_decided` |
| 410 | `invitation_invalid`, `version_retired`, `link_invalid`, `approval_expired` |
| 412 | `precondition_failed` |
| 415 | `unsupported_media_type` |
| 422 | `unprocessable` (well formed but cannot be processed as a whole; `errors` points at the offending parts) |
| 429 | `rate_limited`, `too_many_requests`, `too_many_attempts`, each with `Retry-After` |
| 500 | `internal` (nothing about the cause; logged under `instance`) |
| 503 | `unavailable`, with `Retry-After` when the duration is known; `two_step_unavailable` |

The full catalogue with every message template is
[`errors/catalog.yaml`](https://github.com/zippy-go/api/blob/main/errors/catalog.yaml).

## Identifiers, money and time

Every identifier is a UUID version 7, named `id` on its own record and
`<entity>_id` as a reference, so ids sort by creation. A malformed id in a
path, query or body is `400` with the field-level code
`malformed_identifier`, never a `404` and never a `500`.

Amounts are the `Money` schema: an integer in minor units (paise, cents)
and a currency code, never a bare decimal. Instants are RFC 3339 in UTC
with names ending in `_at`; a local date is `YYYY-MM-DD` and a local time
`HH:MM`, each with the time zone of the place it belongs to. Properties
are `snake_case`, enumeration values lowercase `snake_case`, and clients
ignore properties and values they do not know, which is what makes
additive changes safe.

## Paging

Every list takes `limit` (1 to 100, 25 by default) and an opaque `cursor`,
and answers its items with `next_cursor`, `null` on the last page. Cursors
are keyset cursors issued by the platform and bound to the operation, the
filter, the sort and the caller, so a row inserted or removed while paging
neither repeats nor skips another; a cursor from another query, another
caller or a tampered one is `400` with `cursor_invalid`. Every sort ends in
the id as a tiebreaker. A bounded reference collection may answer whole in
one page.

## Filtering, sorting and facets

Developers get named parameters first (`q`, `status`, `kind`). Consoles
use the full grammar: `filter` carries a JSON tree, `sort` up to three
declared keys with `-` for descending, and `facets` the enumeration
fields to count alongside the page. Each collection declares its fields
at `/filters` (`FilterSchema`): the type decides the control a console
draws and the operators each field admits.

```json
{
  "op": "and",
  "operands": [
    { "op": "eq", "field": "status", "value": "active" },
    { "op": "text", "field": "name", "value": "biryani", "match": "contains" },
    { "op": "range", "field": "created_at", "gte": "2026-10-01T00:00:00Z" }
  ]
}
```

The operators are `eq`, `in`, `range` (either bound absent), `text`
(`contains` or `starts_with`, literal and case-insensitive), `within` (a
service area subtree) and the groups `and` and `or`. Trees nest at most
three levels and hold at most twenty operands per list or group; text
search is accepted only as a top-level all-of condition. A facet is counted
with that field's own condition removed, so a tile can be clicked back out
of, and every declared value appears even at zero. `/summary` counts the
whole collection by its enumeration fields without fetching rows, from a
copy at most 30 seconds old.

## Idempotency keys

A write may carry `Idempotency-Key`, a UUID the client mints; writes that
move money or place an order require it. The key is scoped to the caller
and remembered for 24 hours. A repeat with the same key and the same
request answers what the first made, with the same status and body and
`Idempotent-Replayed: true`, and makes nothing new; the same key with a
different method, path or body is `409` (`idempotency_key_reuse`); a
repeat that arrives while the first is still being processed waits for
it; a first that failed with a `5xx` is processed afresh.

## Conditional requests

A versioned resource (partners and locations today) carries `version` and
answers reads with an `ETag` of `"v<version>"`. Send it back in
`If-None-Match` to be answered `304` when nothing changed. Send it in
`If-Match` on a write to be refused with `412` (`precondition_failed`)
when someone else changed the record first; a write without `If-Match` is
accepted. Every write raises the version by one.

## Rate limits

Every caller has a quota per minute: 600 requests per access token, 120
per client address for unauthenticated requests, 300 per API key. Every
response says where you stand:

```http
RateLimit-Limit: 600
RateLimit-Remaining: 597
RateLimit-Reset: 41
```

Over quota is `429` (`rate_limited`) with `Retry-After` in seconds.
Per-action limits, such as one-time codes per identifier, answer
`too_many_requests` with their own `Retry-After`. Open streams count
against a separate connection limit, described on the Live streams page.

## Correlation

Send `X-Correlation-Id`, a UUID, to follow a request through logs, events
and the audit log; without it the platform mints one. Every response
carries the value in `X-Correlation-Id`, and every event caused by the
request carries it as `correlation_id`.

## The audit log

Every privileged act, such as activating or suspending a partner, changing
roles or memberships, or changing reference data, appends an entry to the
audit log: who, as which membership, when, from which address, the action,
the target, the values before and after, the reason where one is required
and the correlation id. Entries are never changed or deleted. The
operations tagged *Audit* read them.

## Versioning and deprecation

The major version is in the path (`/v1`); changes within a major are
additive only, and the [versioning policy](/versioning) explains what that
means. A deprecated major keeps answering for at least 180 days with the
`Deprecation`, `Sunset` and `Link` headers naming its successor, then
answers `410` (`version_retired`).
