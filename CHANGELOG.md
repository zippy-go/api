# Changelog

All notable changes to the ZippyGo API contract are recorded here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the version numbers follow the versioning policy.

## [Unreleased]

## [0.14.0] - 2026-10-16

Step 3, notifications and live channels: every message leaves through one
outbox and one sender, by push, SMS under DLT, WhatsApp to a customer who
opted in, or email, each with a local stand-in; what each order event tells
the customer and the Partner's staff; the delivery log in Mission Control;
notices to Locations with a Location's inbox; and the live channels a
customer and a Location's staff listen on, resumable with `Last-Event-ID`.
Numbered after 0.13.0; the step 3 orders and money slices take the next
minors as they merge. Additive only.

### Added

- Push registration for the calling session's device, on every surface
  (`GET`, `PUT`, `DELETE /v1/me/push`, `PushRegistration`,
  `PushRegistrationInput`, `PushPlatform`), with `location_id` for a Partner
  device set to one Location, and `POST /v1/me/push/opened`
  (`PushOpened`) to record that a push was read. A push goes to every live
  device of its recipient; signing a device out stops its pushes.
- How a customer is reached, per channel
  (`GET`, `PUT /v1/customer/notification-preferences`,
  `CustomerNotificationPreferences`,
  `CustomerNotificationPreferencesUpdate`): the opt-in to order updates on
  WhatsApp, the SMS do-not-disturb flag, whether an email is on file, the
  devices registered for pushes and the marketing consent (still written
  with `PUT /v1/customer/consent`). Transactional messages send whatever
  the marketing consent says.
- The delivery log for Mission Control with `notification:read`:
  `GET /v1/platform/messages` (`DeliveryLogPage`, `DeliveryLogEntry`,
  `NotificationChannel`, `MessageStatus`, `MessageRecipient`,
  `RecipientKind`, `MessageDevice`, `MessageText`) searchable by person,
  order, Location, partner, Agent, channel, outcome, event and template,
  `GET /v1/platform/messages/filters`, `GET /v1/platform/messages/{message_id}`,
  and `POST /v1/platform/messages/{message_id}/resend` with
  `notification:manage`, audited.
- Notices to Locations (tag `Notices`): templates kept by name and
  withdrawn rather than deleted (`GET`, `POST /v1/platform/notice-templates`,
  `GET`, `PATCH /v1/platform/notice-templates/{template_id}`,
  `NoticeTemplate`, `NoticeTemplateInput`, `NoticeTemplateUpdate`,
  `NoticeTemplateList`), sending with `notice:send`
  (`POST /v1/platform/notices`, `NoticeSend`, `NoticeSent`, `NoticeSkip`)
  and the send log with who saw each notice (`GET /v1/platform/notices`,
  `GET /v1/platform/notices/{notice_id}`, `Notice`, `NoticeList`,
  `NoticeDetail`, `NoticeDelivery`); a Location's inbox with `notice:read`
  at the Location (`GET .../locations/{location_id}/notices`,
  `POST .../notices/seen`, `POST .../notices/clear`,
  `DELETE .../notices/{notice_id}`, `InboxNotice`, `NoticeInbox`,
  `NoticeSelection`, `NoticeClear`, `NoticesMarked`, `NoticesCleared`);
  and how the Location's screen presents a notice, set by Mission Control
  with `location:write` (`GET`, `PUT .../notice-presentation`,
  `NoticePresentation`, `NoticePresentationInput`, `NoticePlacement`).
- The permissions `notice:read` (partner pool), `notice:send` and
  `notification:read` (platform pool), served by `GET /v1/permissions`.
- The problem code `notice_template_name_taken` (409) and the field codes
  `blank_text` and `selection_required`.
- The events `notifications.notice.sent` and `notifications.message.failed`.
- `GET /v1/live/stream` resumes: signals carry an `id` and the opening
  frames the position the stream opened at; a reconnect with
  `Last-Event-ID` (or `last_event_id`) receives the missed signals of its
  channels instead of a `resync`, while the platform still holds them.

### Changed

- The live channels answer from the token's surface and what its holder
  holds now, checked when the stream opens and every 30 seconds: a
  customer's own orders channel and the channel of an order they placed; a
  Location's notices with `notice:read`, its orders, kitchen and tables with
  `order:read` and its catalogue with `catalog:read` at the Location; a
  partner's agents with `dispatch:read`; the network's orders and agents
  with `order:read` and `agent:read` for Mission Control. A permission no
  longer held closes the stream with `revoked`. Descriptions only; the
  shapes are unchanged.

## [0.13.0] - 2026-10-15

Step 2, customer fixes: a Partner's own storefront, and the refresh grace
under concurrency. Follows the catalogue's 0.12.0.

### Added

- `GET /v1/storefront/partners/{partner_id}` (specification
  `storefront-discovery`, "A Partner's own storefront is the same storefront
  narrowed to one Partner"; tag `Storefront`, public): the Partner's public
  face (`StorefrontPartner`: its name, kind, description, logo and banner
  renditions), where the visitor is placed, and every live store of the
  Partner as the `StoreCard`s a Vertical's listing gives, open first and
  nearest first, with `opens_on` naming the nearest (`PartnerStorefront`). A
  pending, suspended, archived or unknown Partner answers the same `404`.

### Fixed

- The refresh grace of `POST /v1/auth/refresh` holds under concurrency: two
  refreshes with the same token at the same moment both answer the one
  successor, on every surface and with either delivery, where the second
  could read as a replay and end the family. A token older than the latest
  rotation still ends it. No shape changes.

## [0.12.0] - 2026-10-15

Step 2, catalogue: a store's catalogue kept in the Partner console and
published within about a second as one versioned menu the storefront
reads, a store's page and item sheet, and search across the stores of a
city and inside one store. It merges after the customer slice (0.11.0).
Additive only.

### Added

- The `Catalog` operations under
  `/v1/partners/{partner_id}/locations/{location_id}/catalog`: the
  catalogue at a glance with the profile its catalogue type allows
  (`CatalogSummary`, `CatalogueProfile`), the catalogue as a tree
  (`CatalogTree`), categories (list, create, reorder, read, change,
  delete, set and page their items, duplicate), items sold as variants
  (list with the filter grammar, create, read, change, delete, duplicate,
  the questions they ask, their stock, a variant's stock, a quick price
  change and the price history, and bulk acts on up to 500 items),
  questions whose answers are items (`modifiers`: list, create, read,
  change, delete, set their answers, duplicate) and the store's own
  brands. Wording is `LocalizedText`, prices in requests are minor units
  of the store's currency and in responses `Money`, tax included.
  Reading needs `catalog:read` at the Location, changing `catalog:write`,
  marking stock `catalog:stock` or `catalog:write`.
- Mission Control's catalogue oversight, `GET /v1/platform/catalogs`
  (`CatalogOverviewPage`), with the new permission `catalog:oversee`;
  platform staff read any catalogue through the partner routes with it,
  and change none in this version.
- The `Store pages` operations, public: a store's page
  (`GET /v1/storefront/stores/{location_id}`, `StorePage`), its published
  menu (`GET .../menu`, `MenuDocument`) with its version as the `ETag`,
  `If-None-Match` and a `version` the client was told of, a large
  category's further pages (`GET .../menu/categories/{category_id}`) and
  an item sheet (`GET .../items/{item_id}`, `ItemSheet`).
- The `Search` operations, public: search across the stores of the
  customer's city (`GET /v1/storefront/search`, `SearchResult`), names
  suggested as the customer types (`GET /v1/storefront/search/suggestions`),
  and search and suggestions inside one store
  (`GET /v1/storefront/stores/{location_id}/search`, `/search/suggestions`);
  and the synonym groups search treats as one word
  (`GET`, `POST /v1/platform/search/synonyms`,
  `DELETE /v1/platform/search/synonyms/{group_id}`) with `setting:read`
  and `setting:write`.
- The problem codes `category_too_deep`, `category_has_items`,
  `category_has_subcategories`, `modifier_cycle`, `modifier_too_deep` and
  `prescriptions_not_accepted` (409) and `menu_not_published` (404), and
  the field codes `capability_not_allowed`, `food_mark_required`,
  `tag_not_in_set`, `offer_not_below_price`, `price_above_mrp`,
  `english_required`, `language_unsupported`, `axis_values_too_few`,
  `variant_selection_invalid`, `variant_selection_repeated`,
  `variant_combination_missing`, `no_enabled_variant`,
  `default_variant_required`, `answer_not_offered`, `answer_repeated`,
  `modifier_rule_unsatisfiable`, `order_incomplete`, `item_unlisted` and
  `pre_order_notice_invalid` under `validation_failed`.
- The events `catalog.item.changed`, `catalog.category.changed`,
  `catalog.modifier.changed`, `catalog.brand.changed`,
  `catalog.menu.published` and `catalog.search.missed`.
- The live stream's catalogue signals: `menu.published` with the version
  only on a store's public channel `store-{location_id}-menu`, and
  `catalog.changed` with the kind and id of what changed and the
  catalogue revision on `private-location-{location_id}-catalog`.
- Refined after the slice was first pushed, additively: `MenuItem.tags`,
  an item's search tags, on every menu item the store pages and search
  answer with; `StorePage.partner` (`StorePagePartner`), the store's
  Partner with its name and logo, so the store page links to the
  Partner's own storefront.

### Changed

- The asset purposes `product_image` and `catalogue_category_image` are
  available: grants are issued at
  `POST /v1/partners/{partner_id}/assets/grants` with the Location, to
  holders of `catalog:write` there.

## [0.11.0] - 2026-10-15

Step 2, customer: customers sign in with a code to their number and keep an
account, and the storefront places a visitor, composes the opening screen and
lists a Vertical's stores by distance. Step 2 is built on two branches; this
one merges first, and the catalogue follows as 0.12.0.

### Added

- Customer sign-in (specification `customer-authentication`, tag `Auth`):
  `POST /v1/auth/customer/codes` (`CustomerCodeRequest`, `202`
  `CustomerCodeChallenge`), `POST /v1/auth/customer/verify`
  (`CustomerCodeVerifyRequest`, `CustomerVerification` with a
  `CustomerSession` or a `CustomerRegistration`) and
  `POST /v1/auth/customer/register` (`CustomerRegisterRequest`,
  `CustomerSession`); the schemas `DeviceIdentity`, `CustomerCodeChannel`,
  `CodeVia`, `RegistrationEntry`, `RegistrationStep` and
  `CustomerVerificationOutcome`. A customer session is audience
  `customer`, its cookie `zg_refresh_customer`, sixty days idle and a year
  absolute; refresh and sign-out are the existing operations.
- The customer account (specification `customer-account`, tag
  `Customer account`): `GET`, `PATCH /v1/customer/profile`
  (`CustomerProfile`, `CustomerProfileUpdate`, with `ETag` and `If-Match`),
  `PUT /v1/customer/consent` (`MarketingConsent`,
  `MarketingConsentUpdate`), `GET`, `POST /v1/customer/addresses`,
  `PATCH`, `DELETE /v1/customer/addresses/{address_id}`,
  `PUT /v1/customer/addresses/{address_id}/selected` (`CustomerAddress`,
  `CustomerAddressInput`, `CustomerAddressUpdate`, `CustomerAddressList`,
  `AddressLabel`, `BuildingType`), `GET /v1/customer/location`
  (`CustomerLocation`), `GET /v1/customer/sessions`,
  `DELETE /v1/customer/sessions/{session_id}`,
  `DELETE /v1/customer/devices/{device_id}` (`CustomerSessionList`,
  `CustomerSessionSummary`, `SessionClient`) and
  `GET /v1/customer/sections` (`AccountSectionList`, `AccountSection`,
  `AccountSectionKey`, `AccountSummary`).
- The storefront (specification `storefront-discovery`, tag `Storefront`):
  `GET /v1/storefront/resolve` (`StorefrontPlace`, `PlaceResolution`,
  `StorefrontZone`, `GeoPoint`), `GET /v1/storefront/serviceability`
  (`Serviceability`), `GET /v1/storefront/zones` (`StorefrontZoneList`),
  `GET /v1/storefront/home` (`StorefrontHome`, `HomeRow`, `HomeRowKind`,
  `HomeCell`, `HomeCellKind`, `CampaignBanner`, `StorefrontVertical`,
  `StorefrontCategory`) and `GET /v1/storefront/verticals/{vertical}/stores`
  (`StoreCardList`, `StoreCard`, `StoreState`, `FulfilmentMethod`,
  `StorefrontVerticalRef`, `StoreCatalogueSummary`, the last filled once the
  catalogue's published menu is wired). Every one is public.
- Geocoding (tag `Geocoding`): `GET /v1/geocoding/reverse`
  (`ReverseGeocode`) and `GET /v1/geocoding/suggestions`
  (`AddressSuggestionList`, `AddressSuggestion`), never stored.
- Error codes `otp_invalid` (401), `otp_too_soon` (429), `otp_daily_limit`
  (429), `registration_expired` (401), `account_blocked` (403) and
  `addresses_full` (409); field codes `invalid_mobile`, `not_a_mobile`,
  `date_of_birth_future`, `too_young`, `terms_not_accepted`,
  `consent_channel_missing`, `postal_code_invalid` and
  `pin_far_from_address` under `validation_failed`.
- The event `customers.customer.registered` (v1); `identity.sign_in.failed`
  may carry the reasons `wrong_surface`, `wrong_purpose`, `used_code`,
  `expired_code` and `sign_in_closed` for a customer's code.

### Changed

- `POST /v1/auth/refresh` may answer `409` `sign_in_closed` for a customer
  session whose market closed to sign-in; the session is kept for when the
  market opens again.
- `POST /v1/auth/sign-out` with `everywhere` from a customer session ends
  every customer session of the customer, not the sessions of the
  person's memberships.
- `Audience`, `Delivery`, `RefreshRequest` and `SignOutRequest` describe the
  customer surface and its cookie.

## [0.10.0] - 2026-10-15

A breaking minor: it retires the step 1 sign-in that 0.9.0 announced and
the web consoles no longer use. oasdiff reports the removals as breaking;
the coordinator accepted them under the founder's delegation instead of a
new major, since no client outside this repository's consoles signs in yet.

### Removed

- The sign-in without a surface. `audience` is required on
  `POST /v1/auth/otp/request` (`OtpRequest`); `audience` and `delivery` on
  `POST /v1/auth/otp/verify` and `POST /v1/auth/password/sign-in`;
  `delivery` on `POST /v1/invitations/{token}/accept`, whose body is now
  required (the surface is the invitation's). A missing one answers `400`
  `validation_failed` with `audience_required` (a new field code) or
  `delivery_required` on its pointer. A refresh read from a cookie names
  its surface in `audience` (`audience_required` otherwise).
- The `zg_refresh` cookie, the `X-Client-Type` header (`ClientTypeHeader`)
  and the password sign-in that opened Mission Control unasked for a
  holder of platform access. Refresh cookies are always the surface's own
  (`zg_refresh_partner`, `zg_refresh_platform`, `zg_refresh_agent`), and
  sign-out and a password change clear that one only.

### Added

- `Me.impersonation` (`MeImpersonation`): under a view-as token, who views,
  which one Partner, whether changes are allowed and until when.
- The field code `audience_required`; a `400` on `POST /v1/auth/refresh`
  for a request with neither a refresh token nor a surface; a `403` on
  `POST /v1/auth/sign-out` for a view-as token.

### Changed

- A view-as (consented impersonation) token reaches the consented Partner
  and nothing else of the owner's: any other Partner answers `404` as if it
  did not exist, `GET /v1/me` lists that membership alone and shows no
  address change in progress, a viewing-only consent refuses every change
  (`impersonation_read_only`), and a consent allowing changes still refuses
  anything outside that Partner (`forbidden`): another Partner, a new one,
  the owner's password, two-step and sign-out, which no longer signs the
  owner out everywhere. Before, such a token read every Partner of the
  owner's and `GET /v1/me` listed all of them.
- Accepting an invitation into the platform opens Mission Control
  (audience `platform`, the `zg_refresh_platform` cookie) even while the
  person's first role waits for a second administrator's approval; it
  answered with a Partner console session before. Until the role is
  granted the session reaches `GET /v1/me` (no roles), the two-step set-up
  and sign-out, every other Mission Control operation answers `403`
  `access_denied` naming `platform:access`, and the session lives on at
  its refresh.

## [0.9.0] - 2026-10-15

### Added

- Sessions bound to one surface (specification `partner-and-staff-access`,
  tag `Auth`): the sign-in operations take `audience` (`partner`,
  `platform`, `agent`) and `delivery` (`cookie` or `body`, required with an
  audience, `delivery_required` otherwise) in `OtpRequest`,
  `OtpVerifyRequest`, `PasswordSignInRequest`, `RefreshRequest` and
  `InvitationAcceptRequest`; the refresh cookie is named per surface
  (`zg_refresh_partner`, `zg_refresh_platform`, `zg_refresh_agent`);
  `TokenResponse.audience` and `TokenResponse.two_step_setup_required`;
  the schemas `Audience` and `Delivery`. Mission Control is never offered
  a one-time code (`audience_not_allowed`).
- Two-step sign-in with an authenticator app: `POST /v1/auth/two-step/setup`
  (`TwoStepSetup`), `/confirm` (`RecoveryCodes`), `/recovery-codes`,
  `/disable` (`PasswordProof`) and `/verify` (`TwoStepVerifyRequest`). The
  sign-in operations and `POST /v1/invitations/{token}/accept` answer `202`
  with a `TwoStepChallenge` (`InvitationSecondStep` for an invitation) when
  it is on. Platform staff without a second factor reach only the set-up
  (`two_step_setup_required`).
- Password links: `POST /v1/auth/password/reset-request` (always `202`) and
  `POST /v1/auth/password/reset` (`link_invalid`).
- Step-up before sensitive acts: `POST /v1/auth/step-up` and
  `POST /v1/auth/step-up/code` (`step_up_required`).
- Changing the sign-in address: `POST`, `DELETE /v1/auth/identifier-change`
  and `POST /v1/auth/identifier-change/confirm` (`identifier_taken`).
- Service tokens for background jobs: `POST /v1/auth/service-tokens`
  (`ServiceTokenRequest`, `ServiceToken`), audience `service`, refused by
  every operation for people.
- `SignOutRequest`: `everywhere` ends every session of the user; the
  surface or the refresh token ends a session whose access token expired.
- `GET /v1/me` names the surface (`audience`) and the account (`MeAccount`),
  and lists what the user holds there: partner memberships with their
  grants per scope (`MeMembership`), the platform membership (`MePlatform`)
  and agent memberships (`MeAgentMembership`).
- Who may do what (specification `operator-administration`, tag `Access`):
  the permission catalogue (`GET /v1/permissions`,
  `GET /v1/partners/{partner_id}/permissions`), a partner's entitlements
  (`GET`, `PUT /v1/partners/{partner_id}/entitlements`), roles of a partner
  and of the platform (`/v1/partners/{partner_id}/roles`,
  `/v1/platform/roles`, with `ETag` and `If-Match`), team members with
  their grants per scope (`/v1/partners/{partner_id}/members`: get, rename,
  remove, disable, enable, grant, revoke, set access in one act, turn
  two-step off), platform staff (`/v1/platform/staff`) and their
  invitations (`/v1/platform/invitations`), and the access history of a
  partner and of every realm.
- Oversight (tag `Oversight`): four-eyes proposals for granting or revoking
  a platform role, turning a platform member's two-step off and disabling a
  platform member (`/v1/platform/approvals`, approve, reject); viewing a
  partner's console with an owner's consent
  (`/v1/platform/impersonation/consents` and `/sessions`, with end and
  token; the owners decide under
  `/v1/partners/{partner_id}/impersonation/consents` and read
  `/v1/partners/{partner_id}/impersonation/sessions`).
- `PartnerCreate.withheld_permissions`, for platform staff onboarding a
  partner; `InvitationCreate.role_id`, `location_ids`, `service_ids` and
  `display_name`, with the same members on `Invitation`;
  `AuditActor.on_behalf_of_user_id`; the `MembershipRole` value `custom`.
- Problem codes: `authentication_failed`, `unknown_permission`,
  `invalid_scope`, `access_denied`, `not_enabled_for_partner`,
  `permission_escalation`, `no_location_assigned`,
  `permission_not_grantable`, `partner_cannot_sign_in`,
  `outside_entitlements`, `cross_tenant_role`, `cross_tenant_scope`,
  `role_maintained`, `role_name_reserved`, `role_in_use`, `last_owner`,
  `cannot_disable_self`, `link_invalid`, `step_up_required`,
  `two_step_setup_required`, `two_step_self`, `identifier_taken`,
  `approval_required`, `self_approval`, `approval_voided`,
  `approval_expired`, `approval_decided`, `consent_required`,
  `impersonation_read_only`, `two_step_unavailable`; field codes
  `delivery_required`, `code_invalid` and `audience_not_allowed`.
- Events: `identity.sign_in.failed` v1, `access.grant.granted` v1,
  `access.grant.revoked` v1, `access.membership.status_changed` v1,
  `access.membership.removed` v1, `access.role.changed` v1,
  `access.envelope.changed` v1; the optional `audience`, `client` and
  `method` in `identity.session.created`; the role label `custom` in
  `tenancy.membership.created` and `identity.invitation.sent`.
- The permission `plan:write` in the partner pool, which the default role
  `OWNER` holds: choosing the plan a partner's trial ends into.
- `403` responses on reads that now check a permission: the reference data
  (countries, currencies, service areas, campaign slots, Verticals, store
  and service types, settings) for a Mission Control token without the read
  permission, and a partner's activation, documents, payout account,
  standing, plan, policy and schedule layers, Services, pricing and
  Location activation and holidays for a caller without the permission
  the read needs.

### Changed

- Access tokens are typed `at+jwt` and their `aud` claim is the surface
  they were issued for (`partner`, `platform`, `agent`, `service`) instead
  of `zippygo`; `memberships` is filled on Partner tokens only and
  `platform` on Mission Control tokens only. A verifier that pinned `aud`
  to `zippygo` accepts the surface it serves instead.
- Authorisation follows permissions, not role names: operations that
  answered `403` (`forbidden`) to a member who was neither owner nor
  manager now answer `403` (`access_denied`) naming the permission, or
  `not_enabled_for_partner`. Listing members and invitations needs
  `staff:read`; a member holding `location:read` at chosen Locations lists
  and reads those Locations only. The same holds for the routes of 0.8.0:
  Locations need `location:read` and `location:write` at the Location
  (the bin lists the Locations the reader reaches), the registry of
  Services `service:read` and `service:write`, the profile, documents,
  payout account, logo and banner `partner:profile:write`, the plan after
  the trial `plan:write`, and platform staff `partner:read`,
  `partner:write` and, to review a document or verify a payout account,
  `partner:approve`. The default role `MANAGER` holds `staff:read` and
  `partner:profile:write`.
- Reference data is written with the permission of its entity:
  `city:write` for countries, `zone:write` for service areas with their
  fences, policy, schedules, Verticals offered and display grid,
  `currency:write`, `vertical:write`, `promo-slot:write` for campaign
  slots, `location-type:write` for store and service types, and
  `setting:write`. Mission Control reads it with the matching read
  permission; every other surface reads it as before.
- Asset grants and writes need the permission that writes the file: the
  owning capability's for a platform purpose (`vertical:write`,
  `promo-slot:write`), `partner:profile:write` for a partner's own,
  `location:write` at the Location for a Location's, and `partner:write`
  for platform staff on a partner's.
- `PartnerCreate.owner` names a user who already exists: they become the
  owner at once and are told by email; a new person is still invited.
  Platform staff onboarding a partner need `partner:write` and
  `staff:write`.
- The Agent app admits agents only, people who hold an agent membership in
  a Service: anybody else signing in to it gets `401`
  (`authentication_failed`), and a one-time code for it creates nobody.
- Every failed sign-in answers `401` (`authentication_failed`) whatever the
  reason (a wrong password answered `unauthenticated`); five failures in
  fifteen minutes for one identifier on one surface, or from one client,
  answer `429` (`too_many_requests`) with `Retry-After`.
- One-time codes work for five minutes (ten before), and a second code for
  the same identifier within a minute answers `429` with `Retry-After`.
- `POST /v1/auth/sign-out` takes the bearer token, the cookie or the body,
  and answers `204` whether or not a session was left to end (it answered
  `401` without a token).
- `POST /v1/auth/password`: a first password needs a fresh proof
  (`POST /v1/auth/step-up`), which a sign-in made in the last ten minutes
  is; a change ends every session of the user, this one included;
  passwords may be up to 200 characters.
- `POST /v1/auth/refresh` forgives the token spent by the latest rotation
  for fifteen seconds (two tabs refreshing at once stay signed in);
  sessions end at the surface's idle and absolute limits.
- `POST /v1/fleet/location-pings` takes the simulator's service token
  (`Bearer`, job `simulator`) as its only credential.
- `InvitationCreate.role` is optional when `role_id` names the role.
- Clients that name no audience keep the step 1 behaviour: the `zg_refresh`
  cookie, or the body with `X-Client-Type: native`, and a password sign-in
  that opens Mission Control for platform staff. A later minor retires it,
  once the web consoles send their surface.

### Removed

- The `DevApiKey` security scheme (`X-Dev-Api-Key` header), the temporary
  development credential of `POST /v1/fleet/location-pings`; the
  simulator's service token replaces it, as announced in 0.3.0.

## [0.8.0] - 2026-10-15

### Added

- The partner as a legal entity (specification
  `partner-and-location-management`): `Partner` gains `country`,
  `registration_number`, `gstin` (checked, embedding the PAN), `pan`,
  `gst_unregistered`, `registered_address`, `description`, `contacts` with
  per-channel consent, `logo_asset_id`, `banner_asset_id`, `launched_at`,
  `status_reason`, `status_changed_at`, `status_changed_by`, `plan` and,
  on reads, `standing`; `PartnerCreate` and `PartnerUpdate` take them, the
  field codes `gstin_invalid` and `pan_invalid` name a failed check.
  Mission Control onboards a partner on its behalf by naming its
  administrator in `owner` (`PartnerOwner`), invited by email.
- The lifecycle with archive: `PartnerStatus` gains `archived`; activation
  is refused with `409` (`activation_blocked`, one field-level code per
  blocker: `document_missing`, `document_pending`, `document_rejected`,
  `document_expired`, `no_administrator`, `partner_not_active`,
  `no_fulfilment`, `closed_all_week`, `no_vertical`, `field_required`),
  readable before any attempt at `GET /v1/partners/{partner_id}/activation`
  (`PartnerActivation`); suspending needs a reason; archiving is refused
  while locations are open (`locations_open`); nothing new refers to an
  archived partner (`partner_archived`).
- Compliance documents (tag `Partner documents`):
  `GET, POST /v1/partners/{partner_id}/documents`, `GET, DELETE
  .../documents/{document_id}`, the review `POST .../review` and Mission
  Control's queue `GET /v1/partner-documents`, with what a partner must
  have on file and what each requirement does to trading
  (`DocumentRequirement`).
- The payout account (tag `Payout accounts`): `GET, PUT
  /v1/partners/{partner_id}/payout-account` and `POST .../verify`, the IFSC
  checked (`ifsc_invalid`), the number masked on reads.
- The partner's logo and banner (`PUT /v1/partners/{partner_id}/logo`,
  `.../banner`) and its standing (`GET /v1/partners/{partner_id}/standing`).
- Locations as stores and branches: `Location` gains `pin_in_zone`,
  `currency`, `description`, `contacts`, `vertical_ids`, `category_ids`,
  `fulfilment`, `order_settings`, `listing`, `pause`, `fields`,
  `logo_asset_id`, `banner_asset_id`, `deleted_at`, `went_live_at`,
  `go_live_requested_at`, the status reason, when and by whom, and on reads
  `reads_as`, `services`, `live`, `blockers` and `warnings`;
  `LocationStatus` gains `pending`, `suspended` and `archived` (`inactive`
  stays accepted as the name of `suspended`). Opening is refused in a zone
  that does not serve (`zone_not_serving`) or for a vertical it does not
  offer (`vertical_not_offered`). New operations: `DELETE` into the bin,
  `GET .../locations/bin`, `POST .../restore`, `GET .../activation`, `PUT
  .../fulfilment`, `.../order-settings`, `.../listing`, `.../logo`,
  `.../banner`, `POST` and `DELETE .../pause`, `GET .../holidays` and
  `POST .../holidays/{date}/closure`; `service_required` refuses a setting
  that needs a service the partner does not run there.
- The registry of services (specification `services-and-capabilities`):
  several services of one kind; `POST /v1/partners/{partner_id}/services`
  (`ServiceCreate`), `GET` and `PATCH .../services/{kind}` naming a service
  by id or kind (`ServiceUpdate`); `Service` gains `name`, `status_reason`,
  `everywhere`, `location_ids`, `awaiting`, `trading`, `blockers`, `agents`,
  `pricing_version`, `version`, `created_by` and `updated_by`;
  `ServiceStatus` gains `awaiting_documents`; `ServiceList` gains `kinds`
  (`KindAvailability`) and `plan`; the configurations by kind
  (`ProductSalesConfig`, `FieldServiceConfig`, `DeliveryConfig`); a
  service at a location with a field service's settings (`GET, PUT, DELETE
  .../services/{service_id}/locations/{location_id}`); a delivery
  service's versioned pricing as a provider and its quote (`GET, PUT
  .../services/{service_id}/pricing`, `GET .../pricing/quote`).
- Plans (tag `Plans`): `GET, PUT /v1/partners/{partner_id}/plan`
  (`PartnerPlan`, `PartnerPlanUpdate`) and `GET .../plan/impact`
  (`PlanImpact`); a kind the plan lacks is refused with `403`
  (`not_in_plan`).
- Events: `tenancy.partner.updated`, `tenancy.location.updated`,
  `tenancy.location.status_changed`, `tenancy.location.deleted`,
  `tenancy.location.restored`, `tenancy.location.paused`,
  `tenancy.location.resumed`, `tenancy.document.filed`,
  `tenancy.document.reviewed`, `tenancy.document.removed`,
  `tenancy.document.notice_sent`, `tenancy.payout_account.changed`,
  `tenancy.payout_account.verified` and `tenancy.plan.changed`;
  `tenancy.partner.status_changed` gains `previous_status` and `archived`;
  `tenancy.service.updated` gains `service_id`, `name`, `changed`,
  `previous_status`, `pricing_version` and `awaiting_documents`.

## [0.7.0] - 2026-10-15

### Added

- Digital assets (specification `digital-assets`, tag `Assets`): the
  catalogue of purposes (`GET /v1/assets/purposes`), each deciding the
  destination, folder, ceiling, exact types, restriction and who may
  upload; grants as five-minute presigned forms to post a file straight to
  object storage (`POST /v1/assets/grants` for platform purposes,
  `POST /v1/partners/{partner_id}/assets/grants` for a Partner's and its
  Locations'), refused with `unsupported_file_type` or `file_too_large`
  before any byte is sent; confirmation reading every fact back from the
  destination (`POST /v1/assets/{asset_id}/confirm`), `409` until the file
  lands and `asset_not_usable` once discarded; the asset with its state and
  address (`GET`, `DELETE /v1/assets/{asset_id}`); lossless crops as
  recipes (`POST /v1/assets/{asset_id}/crops`, `crop_outside`); ten-minute
  signed links to restricted files (`GET /v1/assets/{asset_id}/link`);
  renditions `thumb`, `card` and `hero` by redirect
  (`GET /v1/assets/{asset_id}/renditions/{name}`, public).
- `HealthChecks.object_storage`: the object store in the detailed health.
- A Vertical image, a category icon or a campaign slot's artwork that is
  not a stored asset of the purpose is refused with `409`
  (`asset_not_usable`).

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
