# Paths

One folder per domain, one file per resource. Each file is an OpenAPI
[Path Item Object](https://spec.openapis.org/oas/v3.1.0#path-item-object)
and is attached to its URL in `../openapi.yaml` with a `$ref`.

```
paths/
  platform/health.yaml          GET /v1/health
  platform/health-details.yaml  GET /v1/health/details
  fleet/agents.yaml             GET /v1/fleet/agents
  fleet/location-pings.yaml     POST /v1/fleet/location-pings
  events/events.yaml            GET /v1/events
  live/agents.yaml              GET /v1/live/agents (server-sent events)
  live/events.yaml              GET /v1/live/events (server-sent events)
  orders/orders.yaml            /v1/orders            (collection, planned)
  orders/order.yaml             /v1/orders/{order_id} (single resource, planned)
```

Rules:

- Folder names are the lowercase domain, matching the tag in `openapi.yaml`
  (`platform`, `partners`, `catalog`, `orders`, `deliveries`, `fleet`,
  `live`, `events`, `subscriptions`, `webhooks`).
- The file name is the resource: plural for collections (`orders.yaml`),
  singular for a single resource addressed by id (`order.yaml`).
- Every operation has an `operationId` (camelCase verb + resource, for
  example `listOrders`, `createOrder`, `getOrder`), a `summary`, a
  `description` and exactly one tag.
- Schemas are referenced by relative path into `../components/schemas`,
  never defined inline, so that the bundler can name them.
- Every operation documents its error responses with the `Problem` schema
  and the `application/problem+json` media type.
- Shared parameters live in `../components/parameters` and are referenced
  by relative path, like schemas.
- A server-sent events response is `text/event-stream` with the
  `ServerSentEventStream` schema; the event types and their data are listed
  in the operation description, since OpenAPI has no native stream type.
