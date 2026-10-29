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
| `fleet.membership.invited` | 1 | A Partner invited a person into one of its delivery services by mobile number or email; the person is told by message how to join. Dispatch ignores it. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `previous_status`, `by`, `at`, `channel`, `expires_at`. |
| `fleet.membership.joined` | 1 | The person accepted an invitation in the Agent app, or an individual Partner's owner joined their own delivery service: the membership is pending its documents. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `previous_status`, `by`, `at`, `how`. |
| `fleet.membership.activated` | 1 | The Partner (or Mission Control for the platform fleet) activated the membership once its documents were approved: the Agent may go on duty and receive work. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `previous_status`, `by`, `at`. |
| `fleet.membership.suspended` | 1 | The membership was suspended with a reason the Agent reads, at once: its duty stretch closed, its offers vanish and every task under way was returned, each announced by `fleet.task.returned`. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `previous_status`, `by`, `at`, `reason`, `tasks_returned`. |
| `fleet.membership.reinstated` | 1 | A suspension was lifted: the membership is active again, or pending when its documents no longer stand. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `previous_status`, `by`, `at`, `note`. |
| `fleet.membership.offboarded` | 1 | The membership ended for good, or an invitation was withdrawn or declined, with a reason; what suspension does, and the person keeps their account. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `previous_status`, `by`, `at`, `reason`, `tasks_returned`. |
| `fleet.document.submitted` | 1 | An Agent filed a document with its files; it waits for review by the Partner, or by platform staff for the platform fleet. Payload: `document_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `by`, `at`, `expires_on`. |
| `fleet.document.approved` | 1 | A reviewer approved a document; the Agent is told. Payload: `document_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `by`, `at`. |
| `fleet.document.rejected` | 1 | A reviewer rejected a document with a reason the Agent reads; the Agent is told and may file it again. Payload: `document_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `kind`, `status`, `by`, `at`, `reason`. |
| `fleet.duty.started` | 1 | An Agent switched on duty in a zone: a duty stretch opened, and dispatch may offer them work there. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `stretch_id`, `zone_id`, `started_at`, `at`. |
| `fleet.duty.ended` | 1 | A duty stretch closed: switched off, closed at the last report after 30 minutes with nothing heard, or ended by a suspension or an offboarding. Payload: `agent_id`, `partner_id`, `service_id`, `user_id`, `stretch_id`, `zone_id`, `started_at`, `at`, `ended_at`, `reason`. |
| `fleet.task.assigned` | 1 | A task of a trip was given to an Agent, as an accepted offer or directly, idempotently by the delivery and its attempt: one event per task (a pickup and a drop). The courier is named on the order only once the app received it. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `sequence`, `planned_at`, `pay_rule_version`. |
| `fleet.task.received` | 1 | The Agent app has the task: the courier is named on the order from now. A direct assignment may be handed back within 60 seconds from now. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `received_at`. |
| `fleet.task.started` | 1 | The Agent started towards the stop. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `recorded_at`, `position`. |
| `fleet.task.arrived` | 1 | The Agent arrived at the stop, within its geofence or with an override and its reason. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `recorded_at`, `position`, `distance_m`, `within_geofence`, `override_reason`. |
| `fleet.task.completed` | 1 | The stop is complete at the step's recorded time: a pickup collected (the order goes on its way), a drop delivered with its proof (the order is delivered). Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `recorded_at`, `position`, `measured_distance_m`, `proof`, `cash_collected`, `earned`. |
| `fleet.task.failed` | 1 | The Agent failed the stop with a reason from the template's list; a drop failed leaves the order undelivered for dispatch to handle. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `recorded_at`, `reason`, `arrived`. |
| `fleet.task.handed_back` | 1 | The Agent handed a direct assignment back with a reason within its minute: the delivery waits for somebody else. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `reason`. |
| `fleet.task.returned` | 1 | A task under way went back to the dispatcher because the membership was suspended or offboarded or the duty closed. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `cause`, `reason`. |
| `fleet.task.called_off` | 1 | Dispatch called the delivery's tasks off with a reason; the Agent was told with a sound. A task called off after the Agent started towards it pays the rule's amount. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `reason`, `started`. |
| `fleet.task.help_requested` | 1 | The Agent asked for help on a task in their own words; dispatch puts it on the delivery for the Partner's dispatcher and Mission Control. Payload: `task_id`, `trip_id`, `agent_id`, `partner_id`, `service_id`, `user_id`, `delivery_id`, `attempt`, `order_id`, `order_number`, `location_id`, `kind`, `assignment`, `status`, `previous_status`, `version`, `at`, `help_id`, `message`. |
| `identity.user.registered` | 1 | A user was created, by a first one-time code or by accepting an invitation. Not scoped to a partner. Payload: `user_id`, `channel`. |
| `identity.session.created` | 1 | A user signed in and a session was created. Not scoped to a partner. Payload: `user_id`, `session_id`, and the optional `audience`, `client`, `method`. |
| `identity.sign_in.failed` | 1 | A sign-in or a proof of the signed-in person failed, with its true reason, for detecting credential stuffing. Not scoped to a partner. Payload: `identifier_hash`, `audience`, `reason`, `source`. |
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
| `access.grant.granted` | 1 | A role was granted to a member at a scope. Payload: `grant_id`, `membership_id`, `user_id`, `role_id`, `scope`. |
| `access.grant.revoked` | 1 | A grant was revoked. Payload: `grant_id`, `membership_id`, `user_id`, `role_id`, `scope`. |
| `access.membership.status_changed` | 1 | A membership was disabled or enabled. Payload: `membership_id`, `user_id`, `status`. |
| `access.membership.removed` | 1 | A membership was removed and its grants revoked. Payload: `membership_id`, `user_id`. |
| `access.role.changed` | 1 | A role was defined, changed or deleted. Payload: `role_id`, `change`. |
| `access.envelope.changed` | 1 | What the platform withholds from a partner's entitlements changed. Payload: `partner_id`, `withheld`. |
| `catalog.item.changed` | 1 | An item of a store's catalogue changed. Payload: `location_id`, `item_id`, `change`, `revision`. |
| `catalog.category.changed` | 1 | A category of a store's catalogue changed. Payload: `location_id`, `category_id`, `change`, `revision`. |
| `catalog.modifier.changed` | 1 | A question of a store's catalogue changed. Payload: `location_id`, `modifier_id`, `change`, `revision`. |
| `catalog.brand.changed` | 1 | A brand of a store's own list changed. Payload: `location_id`, `brand_id`, `change`, `revision`. |
| `catalog.menu.published` | 1 | A store's menu was rebuilt into a new published document. Payload: `location_id`, `version`, `revision`, `published_at`, `items`. |
| `catalog.search.missed` | 1 | A search found nothing, recorded without the customer's identity. Not scoped to a partner. Payload: `words`, `service_area_id`, `vertical_id`, `location_id`, `searched_at`. |
| `payments.payment.authorized` | 1 | A payment is confirmed: a card held, a UPI payment made, the Wallet's hold or the cash to collect secures what checkout needs, so the order may be placed. Payload: `payment_id`, `purpose`, `order_id`, `customer_id`, `method`, `status`, `amount`, `wallet_held`, `provider_authorized`, `provider_captured`, `cash_to_collect`, `capture_mode`, `version`. |
| `payments.payment.captured` | 1 | Money was taken, by part: UPI paid, a card charged, the Wallet spent, cash collected, a top-up paid. Payload: `payment_id`, `cause`, `provider`, `wallet_promotional`, `wallet_paid`, `cash`, `released`, `captured_total`. |
| `payments.payment.failed` | 1 | A try at the provider failed or expired, or the charge at acceptance was refused. Payload: `payment_id`, `attempt_id`, `reason`, `message`, `final`. |
| `payments.payment.released` | 1 | Holds were given back without taking money. Payload: `payment_id`, `cause`, `provider`, `wallet`, `cash`. |
| `payments.refund.issued` | 1 | A refund was made, to the source and to the Wallet by balance. Payload: `refund_id`, `payment_id`, `order_id`, `amount`, `to_source`, `to_wallet_paid`, `to_wallet_promotional`, `stage`, `payer`, `reason`, `source_status`. |
| `payments.refund.settled` | 1 | A source refund reached its end: completed, or moved to the Wallet. Payload: `refund_id`, `payment_id`, `outcome`, `to_source`, `to_wallet`. |
| `wallet.entry.recorded` | 1 | A customer's Wallet changed by one entry of one balance. Not scoped to a partner unless a Partner pays for a credit. Payload: `entry_id`, `customer_id`, `kind`, `balance`, `amount`, `held`, `balance_after`, `held_after`, `order_id`, `refund_id`, `payer`. |
| `ledger.entry.posted` | 1 | A journal entry was posted, its debits equal to its credits. Payload: `entry_id`, `kind`, `currency`, `order_id`, `payment_id`, `source_event_id`, `postings`. |
| `payments.alert.raised` | 1 | A nightly check found a difference. Not scoped to a partner. Payload: `alert_id`, `kind`, `order_id`, `payment_id`, `customer_id`, `difference`. |
| `ordering.order.placed` | 1 | An order was placed: paid, held, or with nothing to take now (cash); the store hears it. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `placed_at`, `accept_by`, `subtotal`, `delivery_fee`, `small_order_fee`, `cutlery_fee`, `tip`, `total`, `tax_included`, `payment_method`, `payment_state`, `wallet_amount`, `method_amount`, `carrier`. |
| `ordering.order.accepted` | 1 | The store, or Mission Control, accepted an order with a preparation time: it is promised ready at acceptance plus that time. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `accepted_at`, `preparation_minutes`, `ready_by`, `due_by`, `total`, `removed_amount`, `charged`. |
| `ordering.order.lines_removed` | 1 | Lines were left out as the store accepted: never charged. A payment taken at checkout has what they cost refunded the way it was paid (an `ordering.order.refunded` follows); a held card is charged less. Published with `ordering.order.accepted`. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `line_ids`, `removed_amount`, `refunded_amount`. |
| `ordering.order.declined` | 1 | A placed order was declined: by the store with a reason, by Mission Control, or by the platform when nobody answered in time (`not_answered`) or the card could not be charged (`payment_failed`). Every hold is released and a payment taken at checkout refunded. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `reason`, `released_amount`, `refunded_amount`, `sold_out_line_ids`. |
| `ordering.order.cancelled` | 1 | An order was cancelled: by the customer before acceptance (while still paying too, when they gave up paying: `previous_status` `paying`, nothing taken and the store never told), by the store after it, or by Mission Control at any point. Everything held is released and everything paid goes back, each part where it came from; `payer` bears a refund after acceptance. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `reason`, `released_amount`, `refunded_amount`, `payer`. |
| `ordering.order.expired` | 1 | An order was not paid within the platform's window (`ordering.unpaid_expiry_minutes`) and expired: every hold released, anything taken refunded; the customer's basket still holds what they chose and the order is not listed. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `released_amount`, `refunded_amount`. |
| `ordering.order.preparation_extended` | 1 | An accepted order was given more preparation time; its promise moved and the customer is told. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `minutes`, `ready_by`, `due_by`. |
| `ordering.order.ready` | 1 | An accepted order was marked ready: a pickup waits to be collected, a delivery for its agent. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `ready_at`. |
| `ordering.order.handed_over` | 1 | A ready delivery was handed to the agent and is on its way. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `handed_over_at`. |
| `ordering.order.collected` | 1 | A ready pickup was collected at the counter: the order is complete. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `completed_at`, `charged`. |
| `ordering.order.delivered` | 1 | A delivery on its way was delivered: the order is complete. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `completed_at`, `charged`, and when an Agent delivered it `delivery_id`, `agent_id`, `distance_metres`, `proof_kinds`. |
| `ordering.order.refunded` | 1 | Money went back on an order: lines left out at acceptance, a decline or a cancellation of a paid order, Mission Control's refund of lines and fees with a reason, or a payment confirmed after its order ended. The payments module made the refund (to the source first, up to what it was charged less what was refunded to it, the rest to the Wallet) and `refund_id` is its id; the ledger posts it from `payments.refund.issued`. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `payment_method`, `refund_id`, `amount`, `to_source`, `to_wallet`, `reason`, `payer`, `lines`, `fees`, `refunded_total`. |
| `ordering.order.help_requested` | 1 | A customer asked for help with an order; Mission Control sees it at once as needing somebody. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `help_id`, `kind`. |
| `ordering.order.help_resolved` | 1 | Support resolved a help request with a sentence saying what was done; the customer is told. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `help_id`, `kind`. |
| `ordering.order.on_its_way` | 1 | Dispatch moved a delivery order on its way when its Agent completed the pickup, naming the courier. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `delivery_id`, `on_its_way_at`, `expected_at`, `courier`, `to_collect`. |
| `ordering.order.undelivered` | 1 | Dispatch left an order on its way undelivered when its Agent failed the drop. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `delivery_id`, `agent_id`, `reason`, `undelivered_at`. |
| `ordering.order.running_late` | 1 | An order is expected more than 5 minutes past its promise; the customer is told once, with the new time. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `status`, `previous_status`, `version`, `fulfilment`, `currency`, `at`, `by`, `due_by`, `expected_at`, `minutes_late`. |
| `orchestration.delivery.created` | 1 | A store accepted a delivery order and its delivery was written down, before any Provider is asked; one per order however often the acceptance is heard. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `pickup_at`, `drop_at`, `release_at`, `chain`, `drop_code_required`. |
| `orchestration.delivery.released` | 1 | A delivery waiting for release was released: its offers go out. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `released_at`. |
| `orchestration.delivery.offered` | 1 | A delivery was offered to one or more Agents. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `offer_ids`, `agent_ids`, `agent_user_ids`, `round`, `strategy`, `expires_at`, `pay_total`, `currency`. |
| `orchestration.delivery.assigned` | 1 | An Agent has the delivery: an offer accepted, a direct assignment or a choice by hand. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `agent_user_id`, `by`, `strategy`, `mode`, `considered`, `eta_seconds`, `pay_total`, `pay_rule_version`, `by_user_id`. |
| `orchestration.delivery.collected` | 1 | The Agent completed the pickup. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `collected_at`. |
| `orchestration.delivery.delivered` | 1 | The Agent completed the drop with its proof. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `delivered_at`, `distance_metres`, `proof_kinds`. |
| `orchestration.delivery.undelivered` | 1 | The drop failed with the Agent's reason. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `reason`, `failed_at`. |
| `orchestration.delivery.called_off` | 1 | The delivery was called off: its order ended first, or it was sent again. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `reason`, `by`. |
| `orchestration.delivery.waiting_for_agent` | 1 | A released delivery has waited 3 minutes with no Agent: raised to the dispatcher and Mission Control. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `since`, `minutes`. |
| `orchestration.delivery.needs_somebody` | 1 | A delivery needs somebody, with why. Payload: `delivery_id`, `order_id`, `number`, `location_id`, `partner_id`, `attempt`, `state`, `previous_state`, `version`, `at`, `provider_kind`, `provider_partner_id`, `service_id`, `agent_id`, `reason`, `detail`. |
| `reviews.review.written` | 1 | A customer reviewed a completed order, once and for good: a thumb, the tags chosen, whether a note and how many photos came with it, and the Agent who carried a delivery. It counts in the store's rating at once and, when it says the delivery was late and the delivery has no rating of its own, in the Agent's. Carries no note text. Payload: `review_id`, `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `thumb`, `tags`, `has_note`, `photos`, `fulfilment`, `agent_id`, `at`. |
| `reviews.review.hidden` | 1 | Mission Control hid a review's note and photos from the Partner and from customers, with a reason kept for the platform alone; its thumb and tags still count. Payload: `review_id`, `order_id`, `location_id`, `partner_id`, `by`, `at`. |
| `reviews.review.shown` | 1 | Mission Control showed a hidden review's note and photos again. Payload: `review_id`, `order_id`, `location_id`, `partner_id`, `by`, `at`. |
| `reviews.review.asked` | 1 | The platform asks a customer how their order was, once, between five and thirty minutes after it completed, at a store that takes reviews, unless it was reviewed already or the customer said "Not now": notifications pushes "How was your experience?" to the customer's devices. Payload: `order_id`, `number`, `location_id`, `partner_id`, `customer_id`, `completed_at`, `at`. |
| `reviews.reply.published` | 1 | Mission Control approved a Partner's reply to a review: it shows under the review on the store's page as the store's, by name, with its date, and the reviewer is told once. Payload: `reply_id`, `review_id`, `order_id`, `location_id`, `partner_id`, `customer_id`, `by`, `at`. |
| `reviews.reply.rejected` | 1 | Mission Control rejected a Partner's reply to a review with a reason the Partner reads (a reply naming the customer beyond their first name, carrying contact details, an offer or a code, or abusing the customer); the store's devices are told, and the Partner may write one more. Payload: `reply_id`, `review_id`, `order_id`, `location_id`, `partner_id`, `written_by`, `by`, `reason`, `at`. |
| `reviews.task_rating.written` | 1 | A customer rated a delivery once, apart from the food, for the Agent who carried it: a thumb and tags. It counts in the Agent's rating in place of the order's review. Payload: `rating_id`, `order_id`, `number`, `delivery_id`, `agent_id`, `partner_id` (the Agent's), `location_id`, `customer_id`, `thumb`, `tags`, `at`. |
| `reviews.flag.decided` | 1 | An Agent's flag on a rating they found unfair was decided: `excluded` stops the rating counting for the Agent with the reason kept, the order's review unchanged; `kept` leaves it. Payload: `flag_id`, `rating_id`, `source`, `agent_id`, `partner_id` (the Agent's), `outcome`, `by`, `at`. |
| `customers.customer.blocked` | 1 | Support blocked a customer's account with a reason: every session ended at once, refreshes and sign-in answer `account_blocked`, and placing an order is refused, while orders already placed run to their end. On the customer's timeline. Payload: `customer_id`, `by`, `reason`, `sessions_ended`, `at`. |
| `customers.customer.unblocked` | 1 | Support unblocked a customer's account with a reason: they can sign in again with nothing else changed. On the customer's timeline. Payload: `customer_id`, `by`, `reason`, `at`. |
| `customers.note.written` | 1 | Support kept a note on a customer's account, signed with the operator and the moment, never edited or removed, never shown to the customer. On the customer's timeline. Carries no note text. Payload: `note_id`, `customer_id`, `by`, `at`. |
| `operations.alert.opened` | 1 | An alert opened: an objective burning its error budget (a page at 14.4 times over an hour confirmed over five minutes, a ticket at 6 times over six hours confirmed over thirty minutes), a job overdue by twice its interval, an outbox row failed for five minutes, a statement unpaid or an account check failed. Locally and in `dev` it is recorded and shown, never sent. Payload: `alert_id`, `key`, `source`, `severity`, `title`, `subject`, `runbook`, `at`. |
| `operations.alert.acknowledged` | 1 | A platform member acknowledged an alert by name: it stops repeating while it stays open, and closes by itself once what fired it clears. Payload: `alert_id`, `key`, `by`, `at`. |
| `operations.alert.closed` | 1 | An alert closed because what fired it cleared: the burn fell, the job ran, the row published, the statement was paid or the account checked. Payload: `alert_id`, `key`, `reason`, `at`. |
| `payouts.statement.locked` | 1 | A week was locked into its statement, by the clock or by platform staff; the ledger settles the week from it. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `statement_id`, `reference`, `week`, `state`, `previous_state`, `version`, `currency`, `at`, `locked_by`, `starts_on`, `ends_on`, `time_zone`, `figures`, `invoice`, `credit_note_numbers`, `gst_difference`. |
| `payouts.statement.sent` | 1 | A due statement was sent through the payout provider. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `statement_id`, `reference`, `week`, `state`, `previous_state`, `version`, `currency`, `at`, `transfer_id`, `amount`, `destination_kind`, `destination_last4`. |
| `payouts.statement.paid` | 1 | A statement was paid, by the payout provider or by hand; the ledger posts the payout and the payee is told "Payout sent". Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `statement_id`, `reference`, `week`, `state`, `previous_state`, `version`, `currency`, `at`, `amount`, `paid_on`, `transfer_reference`, `how`, `destination_kind`, `destination_last4`. |
| `payouts.statement.unpaid` | 1 | A statement could not be paid, or a paid one came back; the ledger reverses a payout that was paid, and Mission Control is alerted. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `statement_id`, `reference`, `week`, `state`, `previous_state`, `version`, `currency`, `at`, `reason`, `provider_code`, `by`, `had_been_paid`, `amount`. |
| `payouts.statement.archived` | 1 | A statement was archived, locked with nothing to pay or by platform staff. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `statement_id`, `reference`, `week`, `state`, `previous_state`, `version`, `currency`, `at`, `reason`. |
| `payouts.statement.reopened` | 1 | A statement was put back to due by platform staff. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `statement_id`, `reference`, `week`, `state`, `previous_state`, `version`, `currency`, `at`, `had_been_paid`, `amount`. |
| `payouts.adjustment.added` | 1 | Money was added to a payee's payout or taken off it, landing in the first week not locked yet. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `adjustment_id`, `week`, `amount`, `fee_correction`, `reason`, `at`. |
| `payouts.adjustment.removed` | 1 | An adjustment was taken back before its week was locked. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `adjustment_id`, `week`, `amount`, `at`. |
| `payouts.question.asked` | 1 | A Location or an Agent asked about a locked week. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `question_id`, `statement_id`, `reference`, `week`, `at`. |
| `payouts.question.answered` | 1 | Mission Control answered a question about a week; the payee is told. Payload: `payee_kind`, `partner_id`, `location_id`, `agent_id`, `question_id`, `statement_id`, `reference`, `week`, `at`. |
| `payouts.account_check.passed` | 1 | A payout destination passed its one-rupee check, or staff checked it by hand. Payload: `holder_kind`, `partner_id`, `agent_id`, `destination_kind`, `destination_last4`, `reference`, `by`, `at`. |
| `payouts.account_check.failed` | 1 | A payout destination failed its one-rupee check; statements stay held and the holder is told. Payload: `holder_kind`, `partner_id`, `agent_id`, `destination_kind`, `destination_last4`, `reference`, `by`, `at`, `reason`. |
| `engagement.campaign.created` | 1 | A reward campaign was made, kept as a draft, in Mission Control or by a Partner on its own Locations. Payload: `campaign_id`, `name`, `kind`, `owner`, `partner_id`, `state`, `previous_state`, `rules_version`, `funder`, `partner_share_percent`, `budget`, `by`, `by_user_id`, `at`, `audience`. |
| `engagement.campaign.published` | 1 | A reward campaign was published: live at once, or scheduled until its start. A Partner's carries its word that its business pays. Payload: `campaign_id`, `name`, `kind`, `owner`, `partner_id`, `state`, `previous_state`, `rules_version`, `funder`, `partner_share_percent`, `budget`, `by`, `by_user_id`, `at`, `starts_at`, `ends_at`, `confirmed`. |
| `engagement.campaign.started` | 1 | A reward campaign went live, when published or when its start came on the clock. Payload: `campaign_id`, `name`, `kind`, `owner`, `partner_id`, `state`, `previous_state`, `rules_version`, `funder`, `partner_share_percent`, `budget`, `by`, `by_user_id`, `at`, `started_at`. |
| `engagement.campaign.paused` | 1 | A reward campaign was paused by its owner or by the platform; it grants nothing while paused, and progress made stays. Payload: `campaign_id`, `name`, `kind`, `owner`, `partner_id`, `state`, `previous_state`, `rules_version`, `funder`, `partner_share_percent`, `budget`, `by`, `by_user_id`, `at`, `reason`, `paused_by_platform`. |
| `engagement.campaign.resumed` | 1 | A paused reward campaign was resumed. Payload: `campaign_id`, `name`, `kind`, `owner`, `partner_id`, `state`, `previous_state`, `rules_version`, `funder`, `partner_share_percent`, `budget`, `by`, `by_user_id`, `at`. |
| `engagement.campaign.ended` | 1 | A reward campaign ended: stopped, cancelled before it started, past its end, or out of budget. Rewards granted stay. Payload: `campaign_id`, `name`, `kind`, `owner`, `partner_id`, `state`, `previous_state`, `rules_version`, `funder`, `partner_share_percent`, `budget`, `by`, `by_user_id`, `at`, `why`. |
| `engagement.reward.granted` | 1 | A reward was granted once for what the customer did, from its campaign's budget: promotional Wallet credit with its funder as payer, or an offer held for the customer that the basket prices. Payouts charges a Partner's share of credit to the Location whose order earned it, under "Rewards you paid for"; the customer is told once by push where they consented. Payload: `grant_id`, `source`, `campaign_id`, `campaign_name`, `kind`, `rules_version`, `customer_id`, `reward_kind`, `paid_as`, `amount`, `funder`, `platform_share`, `partner_share`, `partner_id`, `location_id`, `order_id`, `explanation`, `at`, `expires_at`, `deferred_by`. |
| `engagement.reward.held` | 1 | A reward was held for review instead of granted: a signal on the customer raised it. Mission Control releases or refuses it, and the customer sees it as being checked. Payload: `grant_id`, `source`, `campaign_id`, `campaign_name`, `kind`, `rules_version`, `customer_id`, `reward_kind`, `paid_as`, `amount`, `funder`, `platform_share`, `partner_share`, `partner_id`, `location_id`, `order_id`, `explanation`, `at`, `signals`. |
| `engagement.reward.released` | 1 | A reward held for review was released by Mission Control and granted; `engagement.reward.granted` follows. Payload: `grant_id`, `source`, `campaign_id`, `campaign_name`, `kind`, `rules_version`, `customer_id`, `reward_kind`, `paid_as`, `amount`, `funder`, `platform_share`, `partner_share`, `partner_id`, `location_id`, `order_id`, `explanation`, `at`, `by_user_id`, `reason`. |
| `engagement.reward.refused` | 1 | A reward held for review was refused by Mission Control: the customer receives nothing from it, and its budget is freed. Payload: `grant_id`, `source`, `campaign_id`, `campaign_name`, `kind`, `rules_version`, `customer_id`, `reward_kind`, `paid_as`, `amount`, `funder`, `platform_share`, `partner_share`, `partner_id`, `location_id`, `order_id`, `explanation`, `at`, `by_user_id`, `reason`. |
| `engagement.reward.clawed_back` | 1 | A reward was taken back after the order that earned it was refunded in full or cancelled: credit taken back where it was not spent and marked clawed back where it was, a held offer withdrawn. Payouts gives a Partner back its share of what was taken back. Payload: `grant_id`, `source`, `campaign_id`, `campaign_name`, `kind`, `rules_version`, `customer_id`, `reward_kind`, `paid_as`, `amount`, `funder`, `platform_share`, `partner_share`, `partner_id`, `location_id`, `order_id`, `explanation`, `at`, `reason`, `taken_back`, `unrecovered`. |
| `engagement.streak.advanced` | 1 | A customer's weekly streak counted a week with a completed order. Payload: `campaign_id`, `customer_id`, `week`, `weeks`, `at`, `previous_weeks`, `milestone`. |
| `engagement.streak.frozen` | 1 | A week passed without an order and the month's freeze kept the streak; the customer is told their freeze kept it. Payload: `campaign_id`, `customer_id`, `week`, `weeks`, `at`. |
| `engagement.streak.broken` | 1 | A week passed without an order and no freeze was left: the streak is broken and shown as 0. Payload: `campaign_id`, `customer_id`, `week`, `weeks`, `at`, `previous_weeks`. |
| `engagement.quest.started` | 1 | A customer pressed Start on a quest: from now its steps count, until its days run out. Payload: `campaign_id`, `customer_id`, `progress_id`, `rules_version`, `at`, `started_at`, `ends_at`, `started_from`. |
| `engagement.quest.completed` | 1 | A customer completed a quest's last step; its reward is granted once. Payload: `campaign_id`, `customer_id`, `progress_id`, `rules_version`, `at`, `completed_at`, `order_id`. |
| `engagement.quest.expired` | 1 | A quest's days ran out before its steps were done. Payload: `campaign_id`, `customer_id`, `progress_id`, `rules_version`, `at`, `done`, `needed`. |
| `engagement.tier.changed` | 1 | A customer's tier changed: at once on crossing a threshold, or at the month's look, dropping one tier at a time. The customer is told once. Payload: `campaign_id`, `customer_id`, `tier`, `previous_tier`, `orders_in_window`, `why`, `next_look_on`, `at`. |
| `engagement.referral.recorded` | 1 | A friend added a customer's referral code and the referral was recorded; the referrer earns once the friend's first order completes. Payload: `referral_id`, `referrer_id`, `referred_id`, `code_id`, `service_area_id`, `at`. |
| `engagement.referral.rewarded` | 1 | A referred friend's first order completed and the referrer was credited, "Your friend's first order with ZippyGo". Payload: `referral_id`, `referrer_id`, `referred_id`, `order_id`, `grant_id`, `amount`, `at`. |
| `engagement.incentive.published` | 1 | An incentive for a delivery service's Agents was published: they see it in the Agent app and join it before anything counts. Payload: `incentive_id`, `name`, `kind`, `partner_id`, `service_id`, `paid_by`, `at`, `recurrence`, `starts_on`, `ends_on`, `tiers`, `amount_per_drop_off`, `window`, `budget`. |
| `engagement.incentive.joined` | 1 | An Agent joined an incentive for its current period; drop-offs completed from now count. Payload: `incentive_id`, `name`, `kind`, `partner_id`, `service_id`, `paid_by`, `at`, `agent_id`, `user_id`, `period`. |
| `engagement.incentive.earned` | 1 | An Agent earned from an incentive: reached a quest's tier, or completed a drop-off in a bonus's window. Payouts adds it to the platform fleet Agent's week under "Bonuses and quests", beside the pay for each task, or to a Partner's own Agent's week on the weekly report, for the Partner to pay. Payload: `incentive_id`, `name`, `kind`, `partner_id`, `service_id`, `paid_by`, `at`, `agent_id`, `user_id`, `period`, `drop_offs`, `amount`, `tier`, `task_id`, `earning_id`. |

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
