# Paths

One folder per domain, one file per resource. Each file is an OpenAPI
[Path Item Object](https://spec.openapis.org/oas/v3.1.0#path-item-object)
and is attached to its URL in `../openapi.yaml` with a `$ref`.

```
paths/
  platform/health.yaml          GET /v1/health
  platform/health-details.yaml  GET /v1/health/details
  platform/jwks.yaml            GET /.well-known/jwks.json (outside /v1, RFC 8615)
  platform/problem.yaml         GET /problems/{code} (outside /v1: every problem's type resolves here)
  auth/otp-request.yaml         POST /v1/auth/otp/request
  auth/otp-verify.yaml          POST /v1/auth/otp/verify
  auth/password-sign-in.yaml    POST /v1/auth/password/sign-in
  auth/password.yaml            POST /v1/auth/password
  auth/refresh.yaml             POST /v1/auth/refresh
  auth/sign-out.yaml            POST /v1/auth/sign-out
  auth/me.yaml                  GET /v1/me
  auth/two-step-*.yaml          POST /v1/auth/two-step/verify, setup, confirm, recovery-codes, disable
  auth/step-up.yaml             POST /v1/auth/step-up (+ step-up-code.yaml, POST /v1/auth/step-up/code)
  auth/password-reset*.yaml     POST /v1/auth/password/reset-request, POST /v1/auth/password/reset
  auth/identifier-change.yaml   POST, DELETE /v1/auth/identifier-change (+ identifier-change-confirm.yaml)
  auth/service-tokens.yaml      POST /v1/auth/service-tokens
  auth/customer-codes.yaml      POST /v1/auth/customer/codes (+ customer-verify.yaml, customer-register.yaml)
  customers/profile.yaml        GET, PATCH /v1/customer/profile
  customers/consent.yaml        PUT /v1/customer/consent
  customers/addresses.yaml      GET, POST /v1/customer/addresses (+ address.yaml, PATCH, DELETE .../{address_id};
                                address-selected.yaml, PUT .../{address_id}/selected)
  customers/location.yaml       GET /v1/customer/location
  customers/sessions.yaml       GET /v1/customer/sessions (+ session.yaml, DELETE .../{session_id};
                                device.yaml, DELETE /v1/customer/devices/{device_id})
  customers/sections.yaml       GET /v1/customer/sections
  storefront/resolve.yaml       GET /v1/storefront/resolve (+ serviceability.yaml, zones.yaml, home.yaml)
  storefront/vertical-stores.yaml GET /v1/storefront/verticals/{vertical}/stores
  geocoding/reverse.yaml        GET /v1/geocoding/reverse (+ suggestions.yaml)
  partners/partners.yaml        POST, GET /v1/partners
  partners/filters.yaml         GET /v1/partners/filters
  partners/summary.yaml         GET /v1/partners/summary
  partners/partner.yaml         GET, PATCH /v1/partners/{partner_id}
  partners/activation.yaml      GET /v1/partners/{partner_id}/activation
  partners/standing.yaml        GET /v1/partners/{partner_id}/standing
  partners/logo.yaml            PUT /v1/partners/{partner_id}/logo (+ banner.yaml)
  documents/documents.yaml      GET, POST /v1/partners/{partner_id}/documents
  documents/document.yaml       GET, DELETE /v1/partners/{partner_id}/documents/{document_id}
  documents/document-review.yaml POST /v1/partners/{partner_id}/documents/{document_id}/review
  documents/review-queue.yaml   GET /v1/partner-documents
  payouts/payout-account.yaml   GET, PUT /v1/partners/{partner_id}/payout-account (+ payout-account-verify.yaml)
  plans/plan.yaml               GET, PUT /v1/partners/{partner_id}/plan (+ plan-impact.yaml)
  locations/locations.yaml      POST, GET /v1/partners/{partner_id}/locations
  locations/location.yaml       GET, PATCH, DELETE /v1/partners/{partner_id}/locations/{location_id}
  locations/bin.yaml            GET /v1/partners/{partner_id}/locations/bin (+ restore.yaml)
  locations/<operations>.yaml   .../locations/{location_id}/activation, fulfilment, order-settings, listing, pause,
                                logo, banner, holidays, holidays/{date}/closure
  memberships/memberships.yaml  GET /v1/partners/{partner_id}/memberships
  memberships/membership.yaml   DELETE /v1/partners/{partner_id}/memberships/{membership_id}
  invitations/invitations.yaml  POST, GET /v1/partners/{partner_id}/invitations
  invitations/invitation.yaml   DELETE /v1/partners/{partner_id}/invitations/{invitation_id}
  invitations/accept.yaml       POST /v1/invitations/{token}/accept
  services/services.yaml        GET, POST /v1/partners/{partner_id}/services
  services/service.yaml         GET, PUT, PATCH /v1/partners/{partner_id}/services/{kind}
  services/service-location.yaml GET, PUT, DELETE .../services/{service_id}/locations/{location_id}
  services/pricing.yaml         GET, PUT .../services/{service_id}/pricing (+ pricing-quote.yaml)
  access/permissions.yaml       GET /v1/permissions (+ partner-permissions.yaml, GET /v1/partners/{partner_id}/permissions)
  access/entitlements.yaml      GET, PUT /v1/partners/{partner_id}/entitlements
  access/partner-roles.yaml     GET, POST /v1/partners/{partner_id}/roles (+ partner-role.yaml, GET, PATCH, DELETE .../{role_id})
  access/members.yaml           GET /v1/partners/{partner_id}/members (+ member.yaml, GET, PATCH, DELETE .../{membership_id};
                                member-access.yaml, -disable, -enable, -grants, -grant, -two-step-reset)
  access/*access-history.yaml   GET /v1/partners/{partner_id}/access-history, GET /v1/platform/access-history
  access/platform-*.yaml        /v1/platform/roles (+ {role_id}), /v1/platform/staff (+ {membership_id}, enable),
                                /v1/platform/invitations (+ {invitation_id})
  oversight/approval*.yaml      /v1/platform/approvals (list, propose), {approval_id} (get, approve, reject)
  oversight/consents.yaml       GET, POST /v1/platform/impersonation/consents
  oversight/impersonation*.yaml GET, POST /v1/platform/impersonation/sessions, {impersonation_id}/end, /token
  oversight/partner-*.yaml      /v1/partners/{partner_id}/impersonation/consents (+ approve, reject, revoke), /sessions
  audit/audit-log.yaml          GET /v1/audit-log
  audit/filters.yaml            GET /v1/audit-log/filters
  audit/entry.yaml              GET /v1/audit-log/{entry_id}
  fleet/agents.yaml             GET /v1/fleet/agents
  fleet/location-pings.yaml     POST /v1/fleet/location-pings
  events/events.yaml            GET /v1/events
  live/agents.yaml              GET /v1/live/agents (server-sent events)
  live/events.yaml              GET /v1/live/events (server-sent events)
  live/stream.yaml              GET /v1/live/stream (server-sent events, the one stream every app holds)
  live/config.yaml              GET /v1/live/config
  assets/purposes.yaml          GET /v1/assets/purposes
  assets/grants.yaml            POST /v1/assets/grants
  partners/assets-grants.yaml   POST /v1/partners/{partner_id}/assets/grants
  assets/asset.yaml             GET, DELETE /v1/assets/{asset_id}
  assets/confirm.yaml           POST /v1/assets/{asset_id}/confirm
  assets/crops.yaml             POST /v1/assets/{asset_id}/crops
  assets/link.yaml              GET /v1/assets/{asset_id}/link
  assets/renditions.yaml        GET /v1/assets/{asset_id}/renditions/{name}
  currencies/currencies.yaml    GET, POST /v1/currencies
  currencies/currency.yaml      GET, PATCH /v1/currencies/{code}
  countries/countries.yaml      GET, POST /v1/countries
  countries/country.yaml        GET, PATCH /v1/countries/{alpha2}
  countries/<switch>.yaml       PUT /v1/countries/{alpha2}/status, /orders, /sign-in, /default-service-area
  countries/holidays.yaml       GET, PUT /v1/countries/{alpha2}/holidays
  countries/policy.yaml         GET, PUT /v1/countries/{alpha2}/policy (+ policy-versions.yaml)
  countries/schedule.yaml       GET, PUT /v1/countries/{alpha2}/schedule
  service-areas/*.yaml          /v1/service-areas (list, create), resolve, {service_area_id} (get, patch), fence, status,
                                impact, division-plan, divide, merge, policy (+ versions), schedule, verticals,
                                vertical-order, campaign-slots, display-grid
  verticals/*.yaml              /v1/verticals (list, create), {vertical_id} (get, patch), status, image, categories, reach
  campaign-slots/campaign-slot.yaml GET, PATCH, DELETE /v1/campaign-slots/{campaign_slot_id}
  store-types/*.yaml            /v1/store-types (list, create), {store_type_id} (get, patch), status; store-fields
  service-types/*.yaml          /v1/service-types (list, create), {service_type_id} (get, patch), status; service-fields
  settings/settings.yaml        GET /v1/settings
  settings/setting.yaml         GET, PUT, DELETE /v1/settings/{key}
  partners/policy.yaml          GET, PUT /v1/partners/{partner_id}/policy (+ policy-versions.yaml, schedule.yaml)
  locations/policy.yaml         GET, PUT .../locations/{location_id}/policy (+ policy-versions, policy-effective,
                                schedule, schedule-effective, schedule-trading)
  catalog/catalog.yaml          GET /v1/partners/{partner_id}/locations/{location_id}/catalog (+ catalog-tree.yaml, GET .../catalog/tree)
  catalog/categories*.yaml      GET, POST .../catalog/categories; order (PUT); category.yaml {category_id} (GET, PATCH, DELETE);
                                category-items.yaml (GET, PUT); category-duplicate.yaml (POST)
  catalog/items*.yaml           GET, POST .../catalog/items; filters (GET); bulk (POST); item.yaml {item_id} (GET, PATCH, DELETE);
                                item-duplicate.yaml (POST), item-modifiers.yaml (PUT), item-stock.yaml (PUT)
  catalog/variant-*.yaml        .../items/{item_id}/variants/{variant_id}/stock (PUT), price (PUT), price-history (GET)
  catalog/modifier*.yaml        GET, POST .../catalog/modifiers; modifier.yaml {modifier_id} (GET, PATCH, DELETE); answers (PUT);
                                duplicate (POST)
  catalog/brand*.yaml           GET, POST .../catalog/brands; brand.yaml {brand_id} (PATCH, DELETE)
  catalog/oversight.yaml        GET /v1/platform/catalogs (Mission Control catalogue oversight)
  catalog/synonym*.yaml         GET, POST /v1/platform/search/synonyms; synonym.yaml DELETE .../{group_id}
  catalog/store*.yaml           GET /v1/storefront/stores/{location_id} (store page), menu, menu/categories/{category_id},
                                items/{item_id}, search, search/suggestions (tags Store pages and Search)
  catalog/search*.yaml          GET /v1/storefront/search, /v1/storefront/search/suggestions (tag Search)
  orders/orders.yaml            /v1/orders            (collection, planned)
  orders/order.yaml             /v1/orders/{order_id} (single resource, planned)
```

Rules:

- Folder names are the lowercase domain, matching the tag in `openapi.yaml`
  (`platform`, `auth`, `partners`, `locations`, `memberships`,
  `invitations`, `services`, `access`, `oversight`, `audit`, `catalog`,
  `orders`, `deliveries`, `fleet`, `live`, `events`, `subscriptions`,
  `webhooks`). Sub-resources of a
  partner live in the folder of their own tag, not under `partners/`.
- The file name is the resource: plural for collections (`orders.yaml`),
  singular for a single resource addressed by id (`order.yaml`), the action
  for an operation that is neither (`sign-out.yaml`, `accept.yaml`).
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
