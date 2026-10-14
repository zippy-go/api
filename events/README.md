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
| `partner_id`      | string (UUID)      | The partner the event belongs to.                                       |
| `correlation_id`  | string             | Shared by everything that stems from the same originating action.       |
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
with its payload schema and a validated example. The catalog currently
contains `platform.ping` only; domain events are added together with the
endpoints that produce them.

| Type            | Version | Description                                                      |
| --------------- | ------- | ---------------------------------------------------------------- |
| `platform.ping` | 1       | Sent on request to verify that a webhook endpoint receives and acknowledges deliveries. Carries no business data. |

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

Webhooks are the first delivery channel; the mechanics below are the
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
