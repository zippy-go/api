# Events

ZippyGo publishes events when something happens to a partner's data:
an order is placed, a delivery is assigned, a subscription renews. Every
event is wrapped in the same envelope and the business data lives in a
versioned payload.

## Envelope

The envelope is defined by
[`envelope.schema.json`](https://github.com/zippy-go/api/blob/main/events/envelope.schema.json)
(JSON Schema 2020-12):

| Field             | Type               | Meaning                                                                 |
| ----------------- | ------------------ | ----------------------------------------------------------------------- |
| `id`              | string (UUID v7)   | Unique, time-ordered event id. Deduplicate on it.                       |
| `type`            | string             | `<domain>.<event>`, for example `order.placed`.                         |
| `version`         | integer            | Payload schema version for this type.                                   |
| `occurred_at`     | string (RFC 3339)  | When the event happened, in UTC.                                        |
| `partner_id`      | string (UUID) or null | The partner the event belongs to; `null` for platform-level events that are not scoped to a partner. |
| `correlation_id`  | string (UUID) or null | Shared by everything that stems from the same originating action; `null` when the event was not caused by a traceable request. |
| `payload`         | object             | Event data, defined per `type` and `version` in the catalog.            |

```json
{
  "id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a01",
  "type": "platform.ping",
  "version": 1,
  "occurred_at": "2026-10-14T08:00:00Z",
  "partner_id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a02",
  "correlation_id": "0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a03",
  "payload": {}
}
```

## Catalog

Every event type and version is listed in
[`catalog.yaml`](https://github.com/zippy-go/api/blob/main/events/catalog.yaml)
with its payload schema and a validated example. Domain events are added
together with the endpoints that produce them. Payloads carry identifiers,
never email addresses or phone numbers; fetch personal data from the API
with the identifiers when it is needed.

| Type                  | Version | Description                                                      |
| --------------------- | ------- | ---------------------------------------------------------------- |
| `platform.ping`       | 1       | Sent on request to verify that a webhook endpoint receives and acknowledges deliveries. Carries no business data. |
| `fleet.agent.online`  | 1       | An agent went online in one of the partner's services and is reporting. Payload: `agent_id`, `partner_id`, `at`. |
| `fleet.agent.offline` | 1       | An agent went offline, by signing off or by not reporting for too long. Payload: `agent_id`, `partner_id`, `last_seen_at`. |
| `identity.user.registered` | 1 | A user was created, by a first one-time code or by accepting an invitation. Not scoped to a partner. Payload: `user_id`, `channel`. |
| `identity.session.created` | 1 | A user signed in and a session was created. Not scoped to a partner. Payload: `user_id`, `session_id`. |
| `identity.invitation.sent` | 1 | An invitation to join a partner was created and its email is being sent. Payload: `invitation_id`, `partner_id`, `role`. |
| `identity.invitation.accepted` | 1 | An invitation was accepted and became a membership. Payload: `invitation_id`, `partner_id`, `user_id`. |
| `tenancy.partner.created` | 1 | A partner was created, `pending`, with its creator as first owner. Payload: `partner_id`, `kind`, `created_by`. |
| `tenancy.partner.status_changed` | 1 | The platform realm changed a partner's status along its lifecycle. Payload: `partner_id`, `status`, `previous_status`. |
| `tenancy.partner.updated` | 1 | A partner's profile, legal identity, kind, contacts, logo or banner changed. Payload: `partner_id`, `changed` (member names, never values). |
| `tenancy.location.created` | 1 | A location was added to a partner. Payload: `location_id`, `partner_id`. |
| `tenancy.location.updated` | 1 | A location's profile, settings, fulfilment, listing, pause, pictures or fields changed. Payload: `partner_id`, `location_id`, `changed`. |
| `tenancy.location.status_changed` | 1 | A location moved along its lifecycle. Payload: `partner_id`, `location_id`, `status`, `previous_status`. |
| `tenancy.location.deleted` | 1 | A location was deleted softly, into the bin. Payload: `partner_id`, `location_id`. |
| `tenancy.location.restored` | 1 | A location was restored from the bin. Payload: `partner_id`, `location_id`. |
| `tenancy.location.paused` | 1 | A location was paused until a moment. Payload: `partner_id`, `location_id`, `until`, `reason`. |
| `tenancy.location.resumed` | 1 | A paused location was resumed before its moment. Payload: `partner_id`, `location_id`. |
| `tenancy.document.filed` | 1 | A partner filed a compliance document. Payload: `partner_id`, `document_id`, `kind`. |
| `tenancy.document.reviewed` | 1 | Platform staff approved or rejected a compliance document. Payload: `partner_id`, `document_id`, `kind`, `outcome`. |
| `tenancy.document.removed` | 1 | A compliance document was taken off file. Payload: `partner_id`, `document_id`, `kind`. |
| `tenancy.document.notice_sent` | 1 | An expiry or rejection notice went to the partner's contacts. Payload: `partner_id`, `document_id`, `kind`, `step`, `recipients`. |
| `tenancy.payout_account.changed` | 1 | A partner stated or changed its payout account. Payload: `partner_id`, `account_changed`. |
| `tenancy.payout_account.verified` | 1 | Platform staff verified a payout account. Payload: `partner_id`. |
| `tenancy.membership.created` | 1 | A user became a member of a partner. Payload: `membership_id`, `partner_id`, `user_id`, `role`. |
| `tenancy.service.updated` | 1 | A partner's service was registered, enabled, disabled, configured, switched on or off at a location, or repriced. Payload: `partner_id`, `kind`, `status`, `service_id`, `name`, `changed`, `previous_status`, `pricing_version`. |
| `tenancy.plan.changed` | 1 | A partner's plan changed; services of kinds it lacks were disabled. Payload: `partner_id`, `plan`, `previous_plan`, `trial_ended`, `disabled_service_ids`. |

## Consuming events

The API exposes events directly, in the same envelope. `GET /v1/events`
returns the most recent events, newest first, and takes `after` (the newest
id already received) for polling. `GET /v1/live/events` pushes events as
they are published, over a server-sent events stream; the Live streams page
of the developer portal describes the stream and how to recover from a
dropped connection. Webhooks, below, push events to partner systems.

## Versioning

- Within a version, changes are additive only: new optional fields may
  appear in a payload at any time. Consumers must ignore fields they do not
  know.
- Removing or renaming a field, changing its type or meaning, or making an
  optional field required is a breaking change and is published as a new
  `version` of the same `type`. The previous version keeps being published
  during a deprecation window announced in the changelog.
- The envelope itself follows the same rule: fields are only ever added.

## Delivery and retries

Webhooks push events to partner systems; the mechanics below are the
planned behaviour and are confirmed when webhook endpoints become available
in the API.

- Each event is delivered as an HTTP `POST` with the envelope as the JSON
  body and `Content-Type: application/json`.
- Delivery is at least once. A redelivery carries the same `id`; consumers
  deduplicate on it.
- Events are not guaranteed to arrive in order. Order by `occurred_at` when
  order matters.
- A delivery counts as acknowledged when the endpoint answers with any
  `2xx` status within the delivery timeout. Any other status, or a timeout,
  schedules a retry with exponential backoff over a bounded window. An
  endpoint that keeps failing is disabled and the partner is notified.

## Signatures

Every delivery will carry an `X-ZippyGo-Signature` header so that consumers
can verify that it came from ZippyGo and was not altered in transit. The
planned mechanism is an HMAC with SHA-256 over the raw request body, keyed
with the endpoint's signing secret, in the form

```
X-ZippyGo-Signature: t=<unix timestamp>,v1=<hex-encoded HMAC-SHA256 of "<t>.<raw body>">
```

Consumers recompute the HMAC with their secret, compare it in constant time
and reject deliveries whose timestamp is older than their replay tolerance.
The exact header format is final once webhook endpoints are released and is
documented here first.
