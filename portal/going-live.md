# Going live

When your integration works in the sandbox, it goes live with a production key. The checklist in
the Partner console, under **Developer**, tracks the steps:

1. **A first call answered** with a sandbox key.
2. **A webhook endpoint verified**: the endpoint answered the `platform.ping` sent when it was
   registered with a 2xx.
3. **A test order placed and delivered** in the sandbox, its webhooks received and their
   signatures checked.
4. **Going live**: a production key, which only an active Partner can create.

## What changes

| | Sandbox | Production |
| --- | --- | --- |
| Key | `zg_test_…` | `zg_live_…` |
| Acts on | the Partner's twin | the Partner |
| Requests a minute | 120 | 300, 1,200 on Pro |
| Payments | the simulated provider and its test instruments | the payment gateway |
| Messages | the sandbox inbox | the customers and staff themselves |
| Deliveries | the sandbox Agent, on your pace or by hand | the Partner's Agents and the platform fleet |
| Ids | the twin's Locations and orders | the Partner's own |

Replace the twin's Location ids with the Partner's own, register your production webhook endpoint
over HTTPS, and keep the production key on your server: never in an app or a browser. The
sandbox's own operations (`/v1/sandbox/…`) answer `403 sandbox_key_required` to a production key.

## Before you switch

- Every write carries an `Idempotency-Key`, so a retry never places an order twice.
- Your endpoint answers within 10 seconds and does its work afterwards; a delivery that fails is
  retried after 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours and 24 hours.
- You check each webhook's signature and refuse a delivery older than your replay tolerance.
- You handle `429` by waiting the `Retry-After` it gives, and you read the `RateLimit-*` headers
  of every answer. [Limits](/limits) has the numbers.
