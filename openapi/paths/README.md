# Paths

One folder per domain, one file per resource. Each file is an OpenAPI
[Path Item Object](https://spec.openapis.org/oas/v3.1.0#path-item-object)
and is attached to its URL in `../openapi.yaml` with a `$ref`.

```
paths/
  platform/health.yaml        GET /v1/health
  orders/orders.yaml          /v1/orders            (collection, planned)
  orders/order.yaml           /v1/orders/{order_id} (single resource, planned)
```

Rules:

- Folder names are the lowercase domain, matching the tag in `openapi.yaml`
  (`platform`, `partners`, `catalog`, `orders`, `deliveries`, `fleet`,
  `subscriptions`, `webhooks`).
- The file name is the resource: plural for collections (`orders.yaml`),
  singular for a single resource addressed by id (`order.yaml`).
- Every operation has an `operationId` (camelCase verb + resource, for
  example `listOrders`, `createOrder`, `getOrder`), a `summary`, a
  `description` and exactly one tag.
- Schemas are referenced by relative path into `../components/schemas`,
  never defined inline, so that the bundler can name them.
- Every operation documents its error responses with the `Error` schema and
  the `application/problem+json` media type.
