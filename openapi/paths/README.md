# Paths

One folder per domain, one file per resource. Each file is an OpenAPI
[Path Item Object](https://spec.openapis.org/oas/v3.1.0#path-item-object)
and is attached to its URL in `../openapi.yaml` with a `$ref`.

```
paths/
  platform/health.yaml          GET /v1/health
  platform/health-details.yaml  GET /v1/health/details
  platform/jwks.yaml            GET /.well-known/jwks.json (outside /v1, RFC 8615)
  auth/otp-request.yaml         POST /v1/auth/otp/request
  auth/otp-verify.yaml          POST /v1/auth/otp/verify
  auth/password-sign-in.yaml    POST /v1/auth/password/sign-in
  auth/password.yaml            POST /v1/auth/password
  auth/refresh.yaml             POST /v1/auth/refresh
  auth/sign-out.yaml            POST /v1/auth/sign-out
  auth/me.yaml                  GET /v1/me
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
  (`platform`, `auth`, `partners`, `catalog`, `orders`, `deliveries`,
  `fleet`, `live`, `events`, `subscriptions`, `webhooks`).
- The file name is the resource: plural for collections (`orders.yaml`),
  singular for a single resource addressed by id (`order.yaml`), the action
  for an operation that is neither (`sign-out.yaml`).
- Every operation has an `operationId` (camelCase verb + resource, for
  example `listOrders`, `createOrder`, `getOrder`), a `summary`, a
  `description` and exactly one tag.
- Schemas are referenced by relative path into `../components/schemas`,
  never defined inline, so that the bundler can name them.
- Every operation documents its error responses with the `Problem` schema
  and the `application/problem+json` media type.
- Shared parameters live in `../components/parameters` and are referenced
  by relative path, like schemas.
- Operations that need no credentials say `security: []`; operations that
  accept only access tokens say `security: [{ Bearer: [] }]`. Without a
  `security` entry the document default applies (API key or access token).
- A server-sent events response is `text/event-stream` with the
  `ServerSentEventStream` schema; the event types and their data are listed
  in the operation description, since OpenAPI has no native stream type.
