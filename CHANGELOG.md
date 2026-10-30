# Changelog

All notable changes to the ZippyGo API contract are recorded here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the version numbers follow the versioning policy.

## [Unreleased]

## [0.30.0] - 2026-10-30

Step 9, field work: qualifications the Partner approves per Agent, shifts
published, picked and given, the shift a service may require to go on duty,
the on-site job's steps on the task, and a laundry pickup's count of items.
Written as the next minor after 0.27.0, beside step 8's other slices and
step 9's bookings slice; renumbered by merge order. Additive only.

### Added

- Shifts (`Agents` tag): a service's shifts listed, published once or for up
  to 14 days in a row, read, changed, cancelled, given to an Agent and taken
  back (`GET`, `POST /v1/partners/{partner_id}/services/{service_id}/shifts`,
  `GET`, `PATCH`, `DELETE .../shifts/{shift_id}`,
  `POST .../shifts/{shift_id}/assignments`,
  `DELETE .../assignments/{agent_id}`; `Shift`, `ShiftState`, `ShiftAgent`,
  `ShiftAgentHow`, `ShiftCreate`, `ShiftUpdate`, `ShiftList`, `ShiftPage`,
  `ShiftAssignmentInput`), with `dispatch:read` and `dispatch:manage`.
- The Agent app's shifts: listed, picked first come first served and given up
  (`GET /v1/agent/memberships/{agent_id}/shifts`,
  `POST`, `DELETE .../shifts/{shift_id}/pick`; `AgentShift`,
  `AgentShiftPage`).
- An Agent's qualifications, read and set in full with `agent:manage`
  (`GET`, `PUT /v1/partners/{partner_id}/agents/{agent_id}/qualifications`;
  `AgentQualification`, `AgentQualifications`, `AgentQualificationsInput`),
  and `qualifications` on `PartnerAgent` and `AgentMembership`.
- `shifts_required` on `AgentServiceSettings` and its update; going on duty
  refused with the blocker `no_shift`; `shift_id` on `AgentDuty`.
- The on-site job on the task: `appointment` and `on_site_job` in
  `TaskKind`; `started` and `disputed` in `TaskStatus`; `start`, `count`,
  `not_available` and `dispute` in `TaskStepKind`; `count` and `calls` on
  `TaskStepRecord`; `window` (`TaskWindow`), `job` (`TaskJob`) and
  `item_count` on `AgentTask`.
- Problem codes `shift_full`, `shift_overlaps`, `shift_closed`,
  `shift_refused`, `estimate_not_approved`, `wait_not_over` and
  `qualification_missing`.
- Events `fleet.shift.published`, `.changed`, `.picked`, `.assigned` and
  `.removed`; `fleet.qualification.approved` and `.withdrawn`;
  `fleet.task.working` and `fleet.task.disputed`. Every `fleet.task.*`
  payload gains `booking_id`, the laundry `leg` and the new kinds and
  statuses, and
  `fleet.task.completed` the pickup's `item_count`.

## [0.29.0] - 2026-10-30

Step 8, tabs: dine-in at a Location's tables. Tables with their codes and
sheets, the Location's dine-in settings and the floor; tabs, each an order bound
to a table that diners open by scanning its code and join with a join code,
sending rounds to the kitchen, asking for the bill and paying it whole or split
from their phones, with tips the restaurant's own; staff keying rounds in,
moving, merging, voiding, declining, discounting, reopening, recording payments
at the counter and closing tabs unpaid; Mission Control's list; a reservation's
party bound to its tab. After the kitchen's 0.27.0 and reservations' 0.28.0,
step 8's last platform slice. Additive only.

### Added

- Tables (`Dine-in` tag): a Location's tables with their codes
  (`GET`, `POST /v1/partners/{partner_id}/locations/{location_id}/tables`,
  `PATCH`, `DELETE .../tables/{table_id}`, `DiningTable`, `DiningTableInput`,
  `DiningTableUpdate`, `DiningTableList`, `DineInService`), a code regenerated
  (`POST .../tables/{table_id}/code`), the sheets as a PDF
  (`GET .../tables/sheets`); the dine-in settings (`GET`, `PUT .../dine-in`,
  `DineInSettings`, `DineInSettingsUpdate`); the floor (`GET .../floor`,
  `Floor`, `FloorTable`, `FloorTableState`).
- Tabs for diners, signed in or guests with `X-Visitor-Token`: a table's code
  scanned (`GET /v1/storefront/tables/{code}`, `TableScan`, `TableScanTab`),
  a tab opened with its first round (`POST /v1/tabs`, `TabOpen`,
  `TabLineInput`) and joined (`POST /v1/tabs/join`, `TabJoin`), read
  (`GET /v1/tabs/{tab_id}`, `Tab`, `TabMember`, `TabRound`, `TabLine`,
  `TabLineState`, `TabState`, `TabTable`, `TabTotals`, `TabServiceCharge`,
  `TabHold`, `TabPaymentSummary`), rounds sent and recalled
  (`POST .../rounds`, `POST .../rounds/{round_id}/recall`, `TabRoundInput`),
  joining opened or closed (`PUT .../joining`, `TabJoining`), a card hold
  (`POST .../hold`, `TabHoldInput`), the bill asked for and read
  (`POST`, `GET .../bill`, `TabBill`, `TabBillLine`), the service charge kept
  or removed (`PUT .../bill/service-charge`, `TabServiceChargeChoice`), a share
  paid (`POST .../payments`, `TabPaymentInput`, `TabSplit`, `TabSplitKind`,
  `TabPaymentStarted`), a receipt (`GET /v1/receipts/{token}`, `TabReceipt`)
  and a guest's tabs kept at sign-in (`POST /v1/tabs/claim`, `TabClaim`,
  `TabClaimed`).
- The floor's acts at `/v1/partners/{partner_id}/locations/{location_id}`: a
  tab read (`GET .../tabs/{tab_id}`, `StoreTab`, `TabHistoryEntry`) and opened
  on a table (`POST .../tables/{table_id}/tabs`, `TabStaffOpen`); a round keyed
  in, a move, a merge, reopening, the bill presented, sent by SMS and as a
  dynamic UPI code, a line voided or declined, a discount, a payment at the
  counter and closing unpaid (`.../tabs/{tab_id}/rounds`, `/move`, `/merge`,
  `/reopen`, `/bill`, `/bill/send`, `/bill/upi-code`,
  `/lines/{line_id}/void`, `/lines/{line_id}/decline`, `/discounts`,
  `/counter-payments`, `/close-unpaid`; `TabMove`, `TabMerge`, `TabReason`,
  `TabDiscountInput`, `TabCounterPayment`, `TabCloseUnpaid`, `TabBillSend`,
  `TabBillSent`, `TabUpiCode`).
- Mission Control's tabs (`GET /v1/platform/tabs`, `PlatformTabPage`,
  `PlatformTabRow`) and a tab's page (`GET /v1/platform/tabs/{tab_id}`).
- A signed-in customer's tabs beside their orders (`GET /v1/me/tabs`,
  `CustomerTabPage`, `CustomerTab`).
- Paying a tab through payments, several payments to its order: each share
  taken at once with its own receipt, the card hold before the first round
  reaches the kitchen (let go when the tab is paid, charged up to what is owed
  when it is closed unpaid, a card that cannot be held turning the tab to
  paying each round first by UPI), the dynamic UPI code (`qr_svg` on
  `TabUpiCode`) and the bill link by SMS. A tab's payments read as the order's
  payments in Mission Control.
- `tab.changed` on `tab-{tab_id}`, heard by anybody holding the tab's id and
  saying only that it changed and its version.
- A round's lines take the answers to their items' questions (`answers` on
  `TabLineInput`, as `BasketLineInput` takes them), priced as a basket prices
  them at the dine-in price, shown as sold on `TabLine` and `TabBillLine` in
  the `OrderAnswer` shape and carried on `ordering.tab.round_sent`.
- Joining a tab (`TabJoin`) takes, instead of the join code, the table's code
  alone while the table is pay-only, or the bill's key (`bill_key`) that the
  bill's link sent by SMS carries as `?key=`, which stops working once the tab
  is settled or closed; either way the caller becomes a member who reads the
  bill and pays.
- `dine_in_price` on `CatalogVariant`, `CatalogVariantInput` and
  `MenuVariant`; `mode` on `GET /v1/storefront/stores/{location_id}/menu` for
  the dine-in menu, every variant priced as tabs charge it. A tab's bill is
  priced with the promotions engine's offers for dine-in, in `discounts`.
- A reservation's party seated at a table (`reservations.reservation.seated`)
  binds the table's open tab, or else the next tab opened there within the
  hour, to the reservation; the tab takes the party's name and keeps it:
  `party_name` and `reservation_id` on `StoreTab`, `party_name` on
  `FloorTable`, and `reservation_id` on `ordering.tab.opened`.
- The permission `tab:adjust` for voids, discounts and closing unpaid; edition
  12 of the default roles, after reservations' 11, gives Manager `tab:adjust`.
- Problem codes `table_code_inactive`, `dine_in_off`, `table_pay_only`,
  `table_occupied`, `table_name_taken`, `tab_not_open`,
  `tab_bill_not_presented`, `tab_has_payments`, `join_code_wrong`,
  `joining_locked`, `joining_closed`, `round_fired`, `line_fired`,
  `tab_payment_over` and `card_hold_off`.
- Events `ordering.tab.opened`, `.joined`, `.round_sent`, `.round_recalled`,
  `.line_declined`, `.line_voided`, `.discounted`, `.bill_presented`,
  `.reopened`, `.moved`, `.merged`, `.settled`, `.closed_unpaid` and
  `.cancelled`; `dining.table.created`, `.changed`, `.code_regenerated` and
  `.removed`. None carries a name of a person, a phone number or an email.

## [0.28.0] - 2026-10-30

Step 8, reservations and the tab's companions: table reservations at a store's slots, the day's
list, seating and no-shows, and a settled tab's review. Written by the platform's
`step8/reservations` slice as the next minor after api main (0.27.0, kitchen), beside the step 8
tabs slice; renumbered by merge order among step 8's 0.27.0 to
0.29.0. Additive only.

### Added

- Reservations (`Reservations` tag): a store's slots on a day for a party, every 30 minutes over
  its own hours (`GET /v1/storefront/stores/{location_id}/reservation-slots`,
  `ReservationSlotList`, `ReservationSlot`); reserving under the account's name and mobile number
  with a six-character code, the account's Bookings, one reservation and cancelling until two
  hours before (`POST`, `GET /v1/customer/reservations`, `GET .../reservations/{reservation_id}`,
  `POST .../cancel`, `ReservationInput`, `CustomerReservation`, `CustomerReservationPage`,
  `ReservationStore`, `ReservationState`); a Location's day of reservations, seating a party at a
  table and marking a no-show 15 minutes after its time
  (`GET /v1/partners/{partner_id}/locations/{location_id}/reservations`,
  `POST .../reservations/{reservation_id}/seat`, `.../no-show`, `LocationReservationList`,
  `LocationReservation`, `ReservationSeatInput`); a Location's reservation settings
  (`GET`, `PUT .../reservation-settings`, `ReservationSettings`, `ReservationSettingsInput`).
- A settled tab's review on `GET`, `POST /v1/customer/orders/{order_id}/review` with the tab's
  id: `dine_in` in `ReviewFulfilment`, and the tab's tags (`great_food`, `friendly_service`,
  `quick_service`, `good_value`; `slow_service`, `wrong_order`, `billing_issue`, `cleanliness`).
  The account's Bookings section is built.
- Permissions `reservation:read` and `reservation:manage`; the next edition of the default roles
  (11 as written, after subscriptions' 10) gives Manager and Staff both.
- Problem codes `reservation_unavailable`, `reservation_not_cancellable` and
  `no_show_too_early`; field code `party_too_large`.
- Events `reservations.reservation.made`, `.cancelled`, `.reminded`, `.seated` and `.no_show`;
  `reviews.review.written` gains the fulfilment `dine_in`.
- A settled tab is a dine-in visit: `dine_in` in `QuestStepKind`, tabs settled that the customer
  opened (a first dine-in tab at a count of one); a punch card counts visits, pickups collected
  and tabs settled, and holds its reward for a pickup or a dine-in tab (`PunchCardRules`,
  `PunchCardProgress` and `RewardCampaignKind` say visit where they said pickup).

## [0.27.0] - 2026-10-30

Step 8, the kitchen: the kitchen display a Location runs, with courses from the
catalogue, its stations, marks made on the display or from the floor and kept
while offline, and the changes a display reads after a cursor. Step 8's first
platform slice to merge, so 0.27.0 after step 7's 0.26.0; no edition of the
default roles. Additive only.

### Added

- A Location's kitchen (`Kitchen` tag): whether it runs the display, and its
  stations in order (`GET`, `PUT /v1/partners/{partner_id}/locations/{location_id}/kitchen`,
  `KitchenSettings`, `KitchenSettingsUpdate`, `KitchenStation`,
  `KitchenStationInput`); `order:read` or `location:read` to read,
  `location:write` and `If-Match` to set.
- The display's tickets: an accepted delivery or pickup with every course
  fired, a dine-in round with its first course fired and the later ones held,
  each with its courses, its lines at their stations and the history of its
  marks (`GET .../kitchen/tickets` by station, `GET .../kitchen/tickets/{ticket_id}`,
  `KitchenTicket`, `KitchenTicketLine`, `KitchenTicketCourse`,
  `KitchenTicketMark`, `KitchenTicketList`, `KitchenTicketSource`,
  `KitchenTicketState`, `KitchenLineState`, `KitchenCourseState`); and what
  changed after a cursor, closed tickets included, for a display that keeps
  them on the device (`GET .../kitchen/changes`, `KitchenChanges`). A
  `display_id` counts a display as seen; a ticket made while every display of
  the Location was away lands `late_to_arrive`. `order:read`.
- Marks: fire, ready, serve, decline and bump, sent alone or as the queue a
  display kept offline, each with its own id and the moment it was made,
  applied by that moment so the later of two marks stands while the history
  keeps both (`POST .../kitchen/marks`, `KitchenMark`, `KitchenMarkBatch`,
  `KitchenMarkResult`, `KitchenMarkResults`, `KitchenMarkKind`,
  `KitchenMarkOutcome`). `order:manage`.
- A catalogue item's `course` (`ItemCourse`: starters, mains, desserts,
  drinks or none) and `station_ids` on `CatalogItem` and `CatalogItemRow`, set
  through `CatalogItemCreate` and `CatalogItemUpdate` with `catalog:write`.
- Field codes `station_unknown` and `station_name_repeated` under
  `validation_failed`.
- Seven events: `kitchen.ticket.created`, `.ready` and `.bumped`;
  `kitchen.course.fired`, `.ready` and `.flagged` (a held course waiting more
  than 20 minutes after the course before it was ready); and
  `kitchen.line.declined`. `ticket.changed` on
  `private-location-{location_id}-kitchen` tells a display to read the
  changes.

## [0.26.0] - 2026-10-30

Step 7, mandates and the subscription's companions: UPI AutoPay mandates with
the simulated provider, a subscription reviewed once a month, the subscriptions
report with churn, offers that say which ways of ordering they apply to, and
streaks of a subscription's deliveries. Written as 0.24.0 beside the step 7
subscriptions and routes slices and renumbered 0.26.0 after both merged first.
Additive only.

### Added

- A customer's UPI AutoPay mandates (`Payments` tag): the list and one
  mandate with its debits (`GET /v1/customer/mandates`,
  `GET /v1/customer/mandates/{mandate_id}`, `Mandate`, `MandatePage`,
  `MandateState`, `MandateEndReason`, `MandateDebit`,
  `MandateDebitState`), and a subscription's mandate to approve on the
  provider's page or set up again after one was declined, expired or revoked
  (`POST /v1/customer/mandates`, `MandateCreate`, `MandateApproval`).
  Mission Control reads a customer's with `customer:read`
  (`GET /v1/platform/customers/{customer_id}/mandates`).
- A subscription's review for a month (`Reviews` tag): whether it is due,
  with the deliveries completed and the tags offered, and the review written
  once a month (`GET`, `POST /v1/customer/subscriptions/{subscription_id}/review`,
  `SubscriptionReview`, `SubscriptionReviewState`,
  `SubscriptionReviewInput`); `subscription` on `PartnerReview`,
  `StoreReview` and `PlatformReview` (`ReviewSubscription`).
- The subscriptions report by month, store and plan, with churn and the
  reasons customers gave, also as a spreadsheet
  (`GET /v1/platform/reports/subscriptions`, `SubscriptionsReport`,
  `SubscriptionsReportRow`, `SubscriptionsReportReason`), `report:read`.
- `ways` on `OfferInput` and `Offer` (`OfferWay`): `on_demand`,
  `scheduled` and `subscription`; no offer applies to subscription
  occurrences unless it names them.
- A subscription's streaks and quest step (`Engagement` tag): `counts` on
  `StreakRules`, `StreakRulesInput` and `StreakProgress` (`StreakCounts`:
  `weeks` or a subscription's `deliveries` in a row), and the quest step
  `subscription_started` in `QuestStepKind`.
- Nine events: `payments.mandate.created`, `.confirmed`, `.paused`,
  `.resumed`, `.cancelled`, `.revoked`, `.notified`, `.debited` and
  `.debit_failed`; `reviews.review.written` gains `source`,
  `subscription_id` and `month`, and `reviews.review.asked` the
  `subscription_id` and `month` a subscription's monthly ask names. The
  streak events `engagement.streak.advanced`, `.frozen` and `.broken` gain
  `counts`, `subscription_id` and `date` for a streak of deliveries.
- Problem codes `subscription_not_mandated`, `mandate_over_cap`,
  `review_month_taken` and `review_not_due`.

## [0.25.0] - 2026-10-30

Step 7, the routes: the morning's scheduled and subscription deliveries built into planned
routes, trips of several stops, nearby drops and two Partners' orders for one customer on one
trip, and bundles across Partners. Written by the platform's `step7/routes` slice as 0.24.0
beside the subscriptions slice, and renumbered 0.25.0 since subscriptions merged first. Additive
only.

### Added

- Planned routes (`Deliveries` tag): built at 22:00 on the stores' clock from the morning's
  orders placed into a slot, one zone and window each, pickups first, at most 20 drops inside the
  window, re-optimised until offered 45 minutes before the window, or given by a dispatcher. A
  Partner reads the routes carrying its stops with only its own stops
  (`GET /v1/partners/{partner_id}/dispatch/routes`, `GET .../routes/{route_id}`) and gives its own
  Agents' routes (`POST .../routes/{route_id}/assignment`, `dispatch:manage`); Mission Control
  reads every route whole and gives any (`GET /v1/platform/dispatch/routes`,
  `GET .../routes/{route_id}`, `POST .../routes/{route_id}/assignment`). `Route`, `RouteSummary`,
  `RoutePage`, `RouteStop`, `RouteState`, `RouteStopKind`, `RouteStopState`,
  `RouteAssignmentInput`.
- Trips of several stops: the Agent's trip whole (`GET /v1/agent/trips/{trip_id}`, `AgentTrip`,
  `AgentTripStop`); `trip` and `ready` on `AgentTask` (`AgentTaskTrip`); `trip` on `AgentOffer`
  for a route offered whole (`OfferTrip`); `trip` on the boards' `DeliverySummary` and
  `DeliveryDetail` (`DeliveryTrip`, `TripReason`: `route`, `nearby`, `co_delivery`).
- Sharing a trip at checkout: `shared_trip` on `DeliveryFee` (`SharedTrip`): the customer's
  order from another Partner placed within 15 minutes to the same address from a store within
  1 km, and the fee waived on this one, paid by ZippyGo. `ordering.order.placed` gains
  `shared_trip`, beside 0.24.0's `slot` and `occurrence`.
- Bundles across Partners (`Bundles` tag): a live store's bundles
  (`GET /v1/storefront/stores/{location_id}/bundles`, `StoreBundleList`, `StoreBundle`,
  `StoreBundleSide`), taking one (`POST /v1/customer/bundles/{bundle_id}/take`, `BundleTaken`);
  a Partner's bundles and its stores' answers (`GET /v1/partners/{partner_id}/bundles`,
  `POST .../locations/{location_id}/bundles/{bundle_id}/accept`, `.../decline`,
  `PartnerBundle`, `PartnerBundlePage`); Mission Control's bundles (`GET`, `POST
  /v1/platform/bundles`, `GET`, `PATCH .../bundles/{bundle_id}`, `POST .../publish`,
  `.../stop`, `Bundle`, `BundlePage`, `BundleInput`, `BundleUpdate`, `BundleSide`,
  `BundleSideInput`, `BundleState`, `BundleFunding`, `BundleAnswer`).
- Problem codes `route_not_assignable` and `bundle_not_live`; field codes `bundle_too_far` and
  `bundle_same_partner`.
- Events `orchestration.route.built`, `.changed`, `.offered`, `.assigned`, `.started` and
  `.completed`; `orchestration.delivery.batched`; `crosssell.codelivery.formed`;
  `crosssell.bundle.published`, `.accepted`, `.declined` and `.taken`.

## [0.24.0] - 2026-10-30

Step 7, subscriptions: scheduled orders into a store's slots, the catalogue's
plans, and subscriptions with their calendar, the cutoff the evening before,
the deliveries generated then and held from the Wallet, failed deliveries
credited back, price changes announced a week ahead, the monthly statement,
the store's calendar and forecast, and the schedule date. Written as 0.24.0,
after the three platform slices of step 6 (0.21.0 to 0.23.0); the first
platform slice of step 7 to merge takes 0.24.0 and the others are renumbered.

### Added

- Scheduled orders: checkout's `slots` over the store's window of days, each
  with its places left and why it cannot be chosen (`CheckoutSlot`,
  `CheckoutSlotCode`), the pre-order-only items in the basket with the
  earliest slot they allow (`pre_order`, `CheckoutPreOrder`,
  `CheckoutPreOrderItem`), `scheduled` now true where the store takes them and
  `now` on `CheckoutFulfilment`; `slot` on `PATCH /v1/baskets/{location_id}`
  (`OrderSlotInput`) and on the basket's choices (`OrderSlot`); placing
  refused with `slot_full`, `slot_past` and `item_pre_order_only`, each naming
  the next open slot or the earliest one; the order's `slot` and the
  subscription it was generated for (`subscription`, `OrderOccurrence`) on
  `CustomerOrder`, `CustomerOrderSummary`, `StoreOrder` (with `scheduled` and
  `released_at`) and `PlatformOrderRow`. The store's Scheduled tab
  (`GET /v1/partners/{partner_id}/locations/{location_id}/orders/scheduled`,
  `ScheduledOrderPage`, `ScheduledSlotCount`), several orders marked packed
  and ready together for a route (`POST .../orders/ready`, `OrdersReadyInput`,
  `OrdersReadyResult`, `OrderReadyOutcome`) and Mission Control's Scheduled
  panel (`GET /v1/platform/orders/scheduled`, `PlatformScheduledOrderPage`).
- The catalogue's plans: a store's subscription products with their items at
  the plan's own prices, frequencies, window, minimum term, substitutions and
  fee (`GET`, `POST /v1/partners/{partner_id}/locations/{location_id}/catalog/plans`,
  `GET`, `PATCH`, `DELETE .../catalog/plans/{plan_id}`, `POST .../withdraw`,
  `SubscriptionPlan`, `SubscriptionPlanItem`, `SubscriptionPlanCreate`,
  `SubscriptionPlanUpdate`, `SubscriptionPlanItemInput`,
  `SubscriptionPlanList`, `SubscriptionPlanWithdrawal`,
  `SubscriptionPlanState`, `DeliveryWindow`, `SubscriptionFrequency`); the
  Subscribe section of a store's page with the reach of the customer's
  address (`GET /v1/storefront/stores/{location_id}/plans`, `.../plans/{plan_id}`,
  `StorefrontPlan`, `StorefrontPlanList`, `PlanReach`), and `plans` on
  `StoreCard` (`StorePlanCard`). `subscription_cutoff` on a store's order
  settings, 18:00 to 21:00.
- Subscriptions (`Subscriptions` tag): subscribing with `Idempotency-Key`,
  pending until the Wallet covers the first delivery or the mandate is
  confirmed (`POST /v1/customer/subscriptions`, `SubscriptionInput`,
  `SubscriptionItemInput`, `Subscription`, `SubscriptionItem`,
  `SubscriptionPrice`, `SubscriptionNextDelivery`, `SubscriptionAddress`,
  `SubscriptionMandateSummary`, `SubscriptionPaymentDue`,
  `SubscriptionActions`, `SubscriptionState`, `SubscriptionPayBy`,
  `SubstitutionPolicy`); the account's list and one subscription
  (`GET /v1/customer/subscriptions`, `SubscriptionPage`, `GET`, `PATCH .../{subscription_id}`,
  `SubscriptionUpdate`, `SubscriptionChange`); the calendar by month
  (`GET .../calendar`, `SubscriptionCalendar`, `SubscriptionDay`,
  `SubscriptionDayItem`, `SubscriptionDayState`); a day skipped or its
  quantities (`PUT .../days/{date}`, `SubscriptionDayInput`), quantities from
  a day (`PUT .../quantities`, `SubscriptionQuantitiesInput`), pause and
  resume (`POST .../pause`, `.../resume`, `SubscriptionPauseInput`,
  `SubscriptionResumeInput`, `SubscriptionPause`, `SubscriptionPauseReason`),
  days away (`POST .../vacations`, `DELETE .../vacations/{vacation_id}`,
  `SubscriptionVacationInput`, `SubscriptionVacation`), cancelling with a
  reason (`POST .../cancel`, `SubscriptionCancelInput`,
  `SubscriptionCancelReason`) and the month's statement
  (`GET .../statements/{month}`, `SubscriptionStatement`,
  `SubscriptionStatementDay`, `SubscriptionStatementMove`). Every change
  signals `subscription.changed` on the customer's channel.
- A store's subscriptions (`GET /v1/partners/{partner_id}/locations/{location_id}/subscriptions`,
  `LocationSubscriptionPage`, `LocationSubscriptionRow`), a day of its
  calendar with the occurrences by slot and route, what to pack, the day's
  progress and the latest changes (`GET .../subscriptions/calendar`,
  `PartnerSubscriptionDay`, `PartnerOccurrence`, `SubscriptionDaySlot`,
  `SubscriptionItemTotal`, `SubscriptionProgress`, `SubscriptionChangeNote`),
  and the demand forecast for 14 days beside the last 28 days, also as CSV
  (`GET .../subscriptions/forecast`, `SubscriptionForecast`, `ForecastDay`).
  `subscription:read` at the Location.
- Mission Control's subscriptions (`GET /v1/platform/subscriptions`,
  `PlatformSubscriptionPage`, `PlatformSubscriptionRow`,
  `GET .../{subscription_id}`, `PlatformSubscription`), `subscription:read`;
  and the schedule date the cutoffs, the route building and the release of
  scheduled orders read, moved forward on a developer's machine or in the
  sandbox only (`GET`, `PUT /v1/platform/schedule/date`, `ScheduleDate`,
  `ScheduleDateMove`, `ScheduleDateMoveRecord`), `operations:manage` to move.
- Permissions `subscription:read` and `subscription:manage`; edition 10 of the
  default roles gives Manager both, Staff and Kitchen
  `subscription:read`, Mission Control's `support` both and `operations`
  `subscription:read`.
- Problem codes `slot_full`, `slot_past`, `item_pre_order_only`,
  `plan_withdrawn`, `plan_has_subscriptions`, `scheduled_delivery_off`,
  `subscription_ended`, `subscription_not_active`, `subscription_not_paused`,
  `subscription_day_invalid` and `schedule_date_fixed`; under
  `validation_failed` the field codes `quantity_out_of_range`,
  `frequency_not_offered`, `start_before_earliest`, `end_out_of_range`,
  `vacation_invalid`, `subscription_cutoff_invalid` and
  `schedule_date_backwards`.
- Events `subscriptions.subscription.started`, `.changed`, `.paused`,
  `.resumed`, `.cancelled` and `.ended`; `subscriptions.day.changed`;
  `subscriptions.occurrence.generated`, `.skipped`, `.failed` and
  `.completed`; `subscriptions.price.announced`;
  `subscriptions.statement.ready`; `subscriptions.balance.low`;
  `catalog.plan.published` and `.withdrawn`; `ordering.order.released`, with
  the order's `total` for the store's new-order alert; `ordering.order.placed`
  gains the `slot` and the subscription's `occurrence`. None carries a name, a
  phone number, an email or an address.

## [0.23.0] - 2026-10-30

Step 6, engagement: reward campaigns and the rewards engine, the customer's
Rewards, referrals, and the Agents' incentives. Written on branch
`step6/engagement` beside the taxonomy and promotions slices of step 6; it
takes 0.23.0 and the default roles' edition 9 after the taxonomy's 0.21.0 and
promotions' 0.22.0. Promotions holds a reward offer for engagement
(`source: reward` among the customer's offers) and asks it whether a referral
code may count. Additive only.

### Added

- Reward campaigns (`Rewards` tag) of kind streak, quest, tier and punch
  card, each with versioned rules, a funder or a split in percent, a budget,
  a schedule, an audience, a daily cap and a control group, moved as an
  offer is: a Partner's on its own Locations, paid by the Partner, published
  with its word that its business pays
  (`GET`, `POST /v1/partners/{partner_id}/reward-campaigns`, `GET`, `PATCH`,
  `DELETE .../{campaign_id}`, `POST .../publish`, `.../pause`, `.../resume`,
  `.../stop`, `.../cancel`, `GET .../results`), and Mission Control's across
  Partners, with the rule versions, the grants with the budget, the results
  against the control group, the held grants released or refused, and a
  customer's exclusion (`GET`, `POST /v1/platform/reward-campaigns`, `GET`,
  `PATCH`, `DELETE .../{campaign_id}`, the moves, `GET`, `POST .../versions`,
  `GET .../grants`, `GET .../results`, `GET /v1/platform/reward-grants`,
  `POST .../{grant_id}/release`, `.../refuse`,
  `GET /v1/platform/customers/{customer_id}/rewards`, `PUT`,
  `DELETE .../reward-exclusion`). Schemas `RewardCampaign`,
  `RewardCampaignSummary`, `RewardCampaignPage`, `RewardCampaignCounts`,
  `RewardCampaignInput`, `RewardCampaignUpdate`, `RewardCampaignMove`,
  `RewardCampaignActions`, `RewardCampaignVersion`,
  `RewardCampaignVersionList`, `RewardCampaignVersionInput`,
  `RewardCampaignResults`, `RewardResultsGroup`, `RewardRules`,
  `RewardRulesInput`, `StreakRules`, `StreakMilestone`, `QuestRules`,
  `QuestStep`, `TierRules`, `PunchCardRules` with their inputs,
  `RewardSpec`, `RewardSpecInput`, `RewardAudience`, `RewardAudienceInput`,
  `RewardBudget`, `RewardSchedule`, `RewardGrant`, `RewardGrantPage`,
  `RewardGrantDecision`, `RewardSignal`, `RewardClawBack`,
  `RewardExclusion`, `RewardExclusionInput`, `PlatformCustomerRewards`,
  `PlatformCustomerRewardActions` and the enumerations
  `RewardCampaignKind`, `RewardCampaignState`, `RewardCampaignOwner`,
  `RewardFunder`, `RewardKind`, `RewardPaidAs`, `RewardSource`,
  `RewardGrantStatus`, `RewardSignalCode`, `ClawBackReason`.
- The customer's Rewards: weekly streaks, quests offered until Start is
  pressed, the tier and punch cards with their progress, and every grant
  with its funder and claw-back (`GET /v1/customer/rewards`,
  `GET /v1/customer/rewards/grants`,
  `POST /v1/customer/rewards/quests/{campaign_id}/start`, `CustomerRewards`,
  `StreakProgress`, `QuestProgress`, `QuestStepProgress`, `TierStanding`,
  `PunchCardProgress`, `QuestStartInput`, `QuestState`, `QuestStepKind`,
  `QuestStartedFrom`, `StreakState`, `TierLevel`); the account section
  `rewards` after Offers and Wallet.
- Referrals: the customer's referral code with what a friend gets and what
  the customer earns (`GET /v1/customer/referral`,
  `POST /v1/customer/referral/code`, `CustomerReferral`), a city's
  programme (`GET`, `PUT /v1/service-areas/{service_area_id}/referrals`,
  `ReferralSettings`, `ReferralSettingsInput`) and every referral
  (`GET /v1/platform/referrals`, `Referral`, `ReferralPage`,
  `ReferralState`).
- The Agents' incentives (`Incentives` tag): quests of drop-off tiers and
  bonuses a drop-off on a delivery service, with a budget, run by Mission
  Control for the platform fleet and by a Partner for its own
  (`GET`, `POST /v1/partners/{partner_id}/services/{service_id}/incentives`,
  `GET`, `PATCH`, `DELETE .../{incentive_id}`, `POST .../publish`,
  `.../stop`, `GET .../progress`), joined in the Agent app
  (`GET /v1/agent/memberships/{agent_id}/incentives`,
  `POST .../incentives/{incentive_id}/join`). Schemas `AgentIncentive`,
  `AgentIncentivePage`, `AgentIncentiveInput`, `AgentIncentiveUpdate`,
  `AgentIncentiveProgress`, `AgentIncentiveProgressRow`,
  `AgentIncentiveOffer`, `AgentIncentiveOfferList`, `IncentiveTier`,
  `IncentiveWindow`, `IncentiveBudget`, `IncentiveNext`, `IncentiveKind`,
  `IncentiveState`, `IncentiveRecurrence`.
- Statements: "Rewards you paid for" on a Location's statement and its
  working (`Statement.rewards`, `PayoutWorking.rewards`,
  `StatementFigures.rewards`, `StatementRewardRow`); "Bonuses and quests" on
  a platform fleet Agent's statement and week (`AgentStatement.bonuses`,
  `AgentWeek.bonuses`, `AgentWeek.bonus_lines`, `AgentWeekSummary.bonuses`,
  `AgentBonusLine`), filling `AgentStatementFigures.bonuses`; the bonuses
  column of a Partner's own Agents' weekly report (`AgentWeeksRow.bonuses`,
  `AgentWeeksTotals.bonuses`).
- Twenty-four events: `engagement.campaign.created`, `.published`,
  `.started`, `.paused`, `.resumed`, `.ended`; `engagement.reward.granted`,
  `.held`, `.released`, `.refused`, `.clawed_back`;
  `engagement.streak.advanced`, `.frozen`, `.broken`, `.at_risk`;
  `engagement.quest.started`, `.completed`, `.expired`;
  `engagement.tier.changed`; `engagement.referral.recorded`, `.rewarded`;
  `engagement.incentive.published`, `.joined`, `.earned`. None carries a
  phone number, an email, an address or a device.
- Problem codes `reward_campaign_move_refused` (with `campaign_state` and
  `paused_by_platform`), `reward_campaign_change_refused`,
  `quest_not_startable` (with `quest_running`, `quest_completed`,
  `quest_waiting` and `quest_closed`), `referral_code_recent`,
  `reward_grant_decided`, `incentive_move_refused` (with
  `incentive_state`), `incentive_change_refused` and
  `incentive_not_joinable` (with `already_joined`, `incentive_closed`,
  `budget_spent` and `not_in_service`); field codes
  `kind_not_for_partners`, `reward_not_fixed`, `funding_not_confirmed` and
  `effective_from_past`.

### Changed

- `wallet.entry.recorded` gains the optional `payer_partner_share`: a
  reward's credit the platform and a Partner pay in shares carries the
  Partner's share, and a reward taken back is the same credit turned the
  other way.
- New permissions `engagement:read`, `engagement:write` and
  `engagement:manage`; edition 9 of the default roles gives
  Manager `engagement:read` and `engagement:write`, Staff
  `engagement:read`, `operations` all three, and `support` and `finance`
  `engagement:read`.

## [0.22.0] - 2026-10-30

Step 6, promotions: the offers Partners run from playbooks, the platform's
campaigns across Partners with their share and opt-in, one code registry, and
the one engine that prices a store's page, the basket and the placed order.
Written as 0.21.0 beside the taxonomy and engagement slices and renumbered
0.22.0 when it merged after taxonomy; edition 8 of the default roles gives
Mission Control's operations promotion:read and promotion:write, support and
finance promotion:read. Additive only.

### Added

- A Partner's offers (`Promotions` tag): the list with counts by group
  (`GET /v1/partners/{partner_id}/offers`, `OfferPage`, `OfferSummary`,
  `OfferCounts`), a draft made and changed (`POST`, `PATCH .../offers/{offer_id}`,
  `OfferInput`, `Offer`, `OfferTerms`, `OfferTier`, `OfferItemSet`, `OfferOn`,
  `OfferNamed`, `OfferAim`, `OfferWhen`, `OfferWindow`, `OfferOverlap`,
  `OfferUses`), read and deleted (`GET`, `DELETE`), published with the
  Partner's word (`POST .../publish`, `OfferPublish`, `OfferConfirmation`),
  the moves start, pause, resume, stop, cancel, archive, restore and run again
  (`OfferPauseInput`, `OfferPause`), its history (`GET .../history`,
  `OfferHistoryPage`, `OfferHistoryEntry`, `OfferActor`, `OfferChange`) and its
  codes (`GET`, `POST .../codes`, `DELETE .../codes/{code_id}`, `OfferCode`,
  `OfferCodeInput`, `OfferCodePage`). `promotion:read` and `promotion:write` at
  the Location.
- The platform's campaigns on a Partner's Locations with each Location's
  answer (`GET /v1/partners/{partner_id}/campaigns`, `PartnerCampaign`,
  `PartnerCampaignPage`, `CampaignLocation`), accepted and declined at a
  Location (`POST /v1/partners/{partner_id}/locations/{location_id}/campaigns/{offer_id}/accept`,
  `.../decline`, `CampaignParticipation`).
- The goals, playbooks and types served by the platform
  (`GET /v1/offer-playbooks`, `OfferPlaybooks`, `OfferPlaybookGoal`,
  `OfferPlaybook`).
- Mission Control's offers: every offer by owner, group, kind, mechanic and
  words (`GET /v1/platform/offers`), campaigns and store promotions made,
  changed, published and moved (`POST /v1/platform/offers`, `GET`, `PATCH`,
  `DELETE .../{offer_id}` and the moves), a pause with a reason on a Partner's
  offer, the history, the Locations an offer reaches (`GET .../reach`,
  `OfferReachPage`, `OfferReachLocation`), its uses with the budget
  (`GET .../redemptions`, `OfferRedemptionPage`, `OfferRedemption`,
  `OfferBudget`), codes and batches of single-use codes with their
  spreadsheet (`GET`, `POST .../code-batches`, `CodeBatch`, `CodeBatchInput`,
  `CodeBatchPage`, `GET /v1/platform/code-batches/{batch_id}/codes` with
  `Accept: text/csv`), By store (`GET /v1/platform/offers/locations`,
  `OfferLocationPage`, `OfferLocation`, `GET /v1/platform/locations/{location_id}/offers`),
  and a customer's offers with a personal code given from their page
  (`GET /v1/platform/customers/{customer_id}/offers`,
  `POST .../personal-codes`, `PersonalCodeInput`).
- The customer's offers: what they hold, the city's first-order offer and the
  offers for new customers (`GET /v1/customer/offers`, `CustomerOffers`,
  `CustomerOffer`, `OfferPlace`), and a code added in words
  (`POST /v1/customer/offers/codes`, `CodeEntry`, `CodeAdded`).
- A store's offers on its page with the spend bar and, with a customer's
  token, their stamp cards and held offers
  (`GET /v1/storefront/stores/{location_id}/offers`, `StoreOffers`,
  `StoreOffer`, `SpendStep`, `StampCard`); `offer` on `StoreCard`,
  `SearchStore` and `StorePage` (`StoreOfferBadge`); the Vertical's offer
  shelves on `StoreCardList` (`OfferShelf`, `OfferShelfStore`) and the
  `offer` filter of `GET /v1/storefront/verticals/{vertical}/stores`; each
  menu item's `promotion` (`MenuItemPromotion`, `OfferDeal`).
- The basket priced by the engine: `offers`, `alternatives`, `reasons`,
  `nudges` and `free_item` on `Basket` (`BasketOffer`, `BasketAlternative`,
  `OfferReason`, `OfferNudge`, `BasketFreeItem`, `FreeItemChoice`), each line's
  `promotion` (`BasketLinePromotion`), `discounts`, `delivery_discount` and
  `items_after_offers` on `BasketPricing`, the chosen basket offer and free
  item (`basket_offer_id`, `free_item_variant_id` on `BasketChoices` and
  `BasketChoicesUpdate`), and a code typed in the basket
  (`POST /v1/baskets/{location_id}/codes`, `BasketCodeResult`).
- The order's offers as placed: `offers` on `CustomerOrder` (`OrderOffer`) and
  with their split on `PlatformOrder` (`OrderOfferSplit`), each line's
  `promotion` on `OrderLine`, `discounts` and `delivery_discount` on
  `Receipt`; placing's `price_changed` names an offer that ended or was used
  up as the order was placed (`offer_ended`, `offer_used_up`).
- "Promotions you paid for" on a Location's statement (`promotions` on
  `Statement`, `StatementPromotion`).
- Twenty `promotions.*` events: an offer's `created`, `changed`,
  `published`, `started`, `paused`, `resumed`, `ended`, `cancelled`,
  `archived`, `restored` and `deleted`; a code's `created`, `retired` and
  `claimed`; a campaign's `participation.invited`, `.accepted` and
  `.declined`; a use's `redemption.reserved`, `.confirmed` and `.released`.
  An offer's and a campaign's events carry its `name` and `line`, the words
  the Location's notices use. `ordering.order.placed` gains `offers` with
  their split, `discounts` and `delivery_discount`.
- Problem codes `offer_transition`, `offer_running_terms`,
  `confirmation_required`, `offer_purpose_taken`, `code_in_use`,
  `campaign_not_open`, `code_not_recognised`, `code_ended`,
  `code_for_new_customers`, `code_already_used`, `code_already_added`,
  `code_not_for_account` and `code_guesses`; twenty-three field codes of
  `validation_failed` naming the term an offer's terms contradict, a name too
  long, terms missing, a date not written as a wall-clock date and a limit
  below one.

## [0.21.0] - 2026-10-29

Step 6, the taxonomy: one tree of categories per Vertical that every store's
catalogue maps to, and the recommendations built on it. Written by the
platform's `step6/taxonomy` slice beside the promotions and engagement slices;
the first of the three to merge keeps 0.21.0 and the default roles' edition 7.
Additive only.

### Added

- The shared taxonomy (`Taxonomy` tag): a Vertical's tree, public, depth first
  with each term's rules and how much maps to it
  (`GET /v1/verticals/{vertical_id}/taxonomy`, `TaxonomyTree`, `TaxonomyTerm`,
  `TaxonomyAttribute`, `TaxonomyAttributeRule`, `TaxonomyTermStatus`); Mission
  Control's terms, created, read, renamed or moved, deprecated with a
  replacement, merged and deleted while nothing maps to them
  (`POST /v1/platform/taxonomy/terms`, `GET`, `PATCH`, `DELETE .../terms/{term_id}`,
  `POST .../terms/{term_id}/deprecate`, `.../merge`, `TaxonomyTermCreate`,
  `TaxonomyTermUpdate`, `TaxonomyTermDeprecation`, `TaxonomyTermMerge`), and
  every change kept (`GET /v1/platform/taxonomy/changes`, `TaxonomyChange`,
  `TaxonomyChangeKind`, `TaxonomyChangePage`). `taxonomy:write` to change,
  `catalog:oversee` to read Mission Control's views. A term requires only an
  attribute items carry today: the dietary mark, the brand, and the age and
  prescription flags; the others may be allowed.
- A store's catalogue mapped to it: each category with its term or the terms
  suggested from its name, the items mapped more narrowly, unmapped or missing
  an attribute, the tasks and the counts
  (`GET /v1/partners/{partner_id}/locations/{location_id}/catalog/mapping`,
  `CatalogMapping`, `CategoryMapping`, `ItemMapping`, `TaxonomyTermRef`,
  `TaxonomySuggestion`, `MappingActor`, `MappingTask`, `MappingTaskKind`,
  `MappingCounts`); mapping a category, or an item more narrowly
  (`PUT .../catalog/categories/{category_id}/taxonomy`,
  `PUT .../catalog/items/{item_id}/taxonomy`, `TaxonomyMappingInput`), with
  `catalog:write`, or by Mission Control on the Partner's behalf with
  `taxonomy:write`, recorded as such; and how far every store is mapped
  (`GET /v1/platform/taxonomy/mapping`, `LocationMappingSummary`,
  `LocationMappingSummaryPage`). An item without a term is sold on its store's
  page and left out of search across stores.
- Recommendations (`Recommendations` tag), each with its reason: often ordered
  with, for an item sheet or a basket
  (`GET /v1/storefront/stores/{location_id}/recommendations`); nearby
  complements for an order, and the home screen's complements and reorder
  prompts (`GET /v1/customer/recommendations`); a recommendation taken, once
  (`POST /v1/recommendations/{recommendation_id}/accepted`); "Not for this"
  (`DELETE /v1/customer/reorder-prompts/{term_id}`); `Recommendation`,
  `RecommendationKind`, `RecommendationItem`, `RecommendationStore`,
  `RecommendationList`.
- A city's cross-sell configuration, versioned
  (`GET`, `PUT /v1/service-areas/{service_area_id}/cross-sell`,
  `CrossSellSettings`, `CrossSellSettingsInput`, `CrossSellPair`,
  `TaxonomyScope`); `taxonomy:write` to change it.
- `recommendations` on the customer's notification preferences, on by default;
  `PUT /v1/customer/notification-preferences` takes either member alone.
- Problem codes `taxonomy_term_in_use` and `taxonomy_term_has_children`; field
  codes `taxonomy_term_retired`, `taxonomy_term_elsewhere`, `taxonomy_too_deep`,
  `taxonomy_cycle` and `taxonomy_slug_taken`.
- Events `catalog.taxonomy.changed`, `catalog.mapping.changed`,
  `crosssell.recommendation.shown`, `crosssell.recommendation.accepted` and
  `crosssell.reorder.prompted`, none naming a customer beyond the id, and none
  readable by a Partner but the mapping's.
- The permission `taxonomy:write`; edition 7 of the default roles gives Mission
  Control's Catalog role `taxonomy:write`.

### Changed

- `PUT /v1/customer/notification-preferences` no longer requires
  `whatsapp_updates`: a member left out stays as it is.

## [0.20.0] - 2026-10-23

Step 5, settlement: what ZippyGo pays each Location every week for what it
sold and each platform fleet Agent for the work they did, and the reports
Mission Control and the Partner console draw from the event warehouse.
Written as 0.19.0 beside the trust slice of step 5 and renumbered 0.20.0 when
it merged second; an Agent's rating in the numbers is the one reviews counts
(0.19.0). Additive only.

### Added

- A Location's payouts (`Payouts` tag): what it will be paid and why, the
  next payment, the week so far, six months of statements, where it is paid
  and what holds a payout (`GET /v1/partners/{partner_id}/locations/{location_id}/payouts`,
  `LocationPayouts`, `PayoutWeekSummary`, `PayoutWorking`, `PayoutDestination`,
  `PayoutHold`); a statement worked out order by order with its GST invoice,
  credit notes, refunds, adjustments, days, questions, history and documents
  (`GET .../statements/{statement_id}`, `Statement`, `StatementFigures`,
  `StatementOrderRow`, `StatementRefund`, `StatementDay`, `StatementInvoice`,
  `StatementInvoiceLine`, `InvoiceParty`, `StatementCreditNote`,
  `StatementMove`, `StatementActor`, `StatementStanding`, `StatementDocument`);
  its documents drawn when asked for, the statement and the invoice as PDF and
  the order list as CSV (`GET .../statements/{statement_id}/documents/{document}`);
  and "Something look wrong?" (`POST .../statements/{statement_id}/questions`,
  `PayoutQuestionInput`, `PayoutQuestion`). `payout:read` at the Location.
- Mission Control's settlements and payouts: every Location's statements
  (`GET /v1/platform/statements`, `StatementPage`, `StatementSummary`), one
  statement and its documents, the moves paid, unpaid, archive, back to due
  and send (`POST /v1/platform/statements/{statement_id}/paid`, `.../unpaid`,
  `.../archive`, `.../due`, `.../send`, `StatementPaidInput`,
  `StatementUnpaidInput`, `StatementArchiveInput`), locking a Location's week
  (`POST /v1/platform/locations/{location_id}/weeks/{week}/lock`), a
  Location's payouts with any range of its days worked out
  (`GET /v1/platform/locations/{location_id}/payouts`), adjustments
  (`GET`, `POST /v1/platform/locations/{location_id}/payout-adjustments`,
  `DELETE .../{adjustment_id}`, `PayoutAdjustment`, `PayoutAdjustmentInput`,
  `PayoutAdjustmentPage`), questions and their answers
  (`GET /v1/platform/payout-questions`, `POST .../{question_id}/answer`,
  `PayoutAnswerInput`, `PayoutQuestionPage`) and the payouts date, moved
  forward on a developer's machine or in the sandbox only
  (`GET`, `PUT /v1/platform/payouts/date`, `PayoutsDate`, `PayoutsDateMove`,
  `PayoutsDateMoveRecord`).
- A platform fleet Agent's statements: in the Agent app the week so far, the
  next payment, past statements with their PDFs, one statement, its PDF, a
  question, any week, and where the Agent is paid with its check
  (`GET /v1/agent/memberships/{agent_id}/statements`, `AgentStatementList`,
  `GET .../statements/{statement_id}`, `AgentStatement`,
  `AgentStatementFigures`, `AgentStatementTask`, `AgentPayPart`,
  `GET .../statements/{statement_id}/document`,
  `POST .../statements/{statement_id}/questions`, `GET .../weeks/{week}`,
  `AgentWeek`, `AgentWeekSummary`, `GET`, `PUT .../payout-account`,
  `AgentPayoutAccount`, `AgentPayoutAccountUpdate`); a Partner's own Agent
  reads its weeks reported to the Partner (`AgentPaidBy`, `paid_by_partner`);
  in Mission Control every Agent's statements with the same moves, locking an
  Agent's week, an Agent's week, adjustments and where the Agent is paid,
  checked by hand with a reason (`GET /v1/platform/agent-statements`,
  `AgentStatementPage`, `AgentStatementSummary`, `GET .../{statement_id}`,
  `.../document`, `POST .../paid`, `.../unpaid`, `.../archive`, `.../due`,
  `.../send`, `POST /v1/platform/agents/{agent_id}/weeks/{week}/lock`,
  `GET /v1/platform/agents/{agent_id}/weeks/{week}`,
  `GET`, `POST /v1/platform/agents/{agent_id}/payout-adjustments`,
  `DELETE .../{adjustment_id}`, `GET .../payout-account`,
  `POST .../payout-account/verify`, `PayoutAccountVerification`).
- Reports (`Reports` tag) from the event warehouse: the orders report with
  its spreadsheet (`GET /v1/platform/reports/orders`, `OrdersReport`,
  `OrdersReportFigures`, `OrdersReportGroup`, `OrdersReportMoney`,
  `OrdersReportWays`, `OrdersReportCustomers`, `OrdersReportGrouping`,
  `OrdersReportComparison`), the metrics board (`GET /v1/platform/reports/metrics`,
  `MetricsBoard`, `MetricFigure`, `MetricsNow`, `MetricsByLocation`,
  `MetricsByProvider`, `MetricsWindow`, `MetricStanding`), the Agents numbers
  for Mission Control and a Partner (`GET /v1/platform/agent-numbers`,
  `GET /v1/platform/agents/{agent_id}/numbers`,
  `GET /v1/partners/{partner_id}/agent-numbers`,
  `GET /v1/partners/{partner_id}/agents/{agent_id}/numbers`,
  `AgentNumbersPage`, `AgentNumbers`, `AgentNumbersTotals`,
  `AgentNumbersRating`, `AgentNumbersDetail`, `AgentNumbersDelivery`,
  `AgentNumbersDay`, `AgentDutyStretch`, `AgentActivityDay`,
  `AgentActivityItem`, `AgentActivityKind`) and the weekly report of a
  Partner's own Agents with its spreadsheet
  (`GET /v1/partners/{partner_id}/services/{service_id}/agent-weeks`,
  `AgentWeeksReport`, `AgentWeeksRow`, `AgentWeeksTotals`).
- The payout account's one-rupee check: `PayoutAccount.check`
  (`PayoutAccountCheck`, `PayoutAccountCheckState`, `PayoutAccountCheckBy`);
  `POST /v1/partners/{partner_id}/payout-account/verify` takes an optional
  reason.
- `OrderMoneySplit.carrier`; the ledger's account kinds `agent_payable`,
  `agent_pay_expense`, `payout_adjustments` and `payouts_clearing`, and its
  entry kinds `statement_settled`, `payout_paid` and `payout_reversed`.
- Twelve events, which a Location's and an Agent's statements share:
  `payouts.statement.locked`, `.sent`, `.paid`, `.unpaid`, `.archived`,
  `.reopened`, `payouts.adjustment.added`, `.removed`,
  `payouts.question.asked`, `.answered`, `payouts.account_check.passed` and
  `.failed`; none carries an account number, a UPI ID, a phone number, an
  email or the words of a question.
- Problem codes `week_not_over`, `week_locked`, `week_carried_on`,
  `week_empty`, `statement_move_refused` (with `statement_state`,
  `nothing_to_pay`, `destination_not_checked`, `destination_held` and
  `payee_gone`),
  `adjustment_settled`, `question_answered`, `payouts_date_fixed` and
  `paid_by_partner`; field codes `adjustment_out_of_range`, `range_too_long`,
  `payouts_date_backwards`, `paid_on_in_future` and `week_invalid`.

### Changed

- Mission Control's `operations` and `support` roles read the reports
  (`report:read`), in the platform's default roles' edition 6.
- `PUT /v1/partners/{partner_id}/payout-account` and the verification say
  the account is checked by the payout provider's one-rupee transfer, whose
  pass verifies it. A change of an existing account holds payouts for at
  least 48 hours whatever verifies it, shown on statements as the hold
  `account_changed` and refused to a send as `destination_held`; a first
  account is not a change and waits for its check alone.

## [0.19.0] - 2026-10-22

Step 5, trust: reviews and ratings, Mission Control's customers, and
operations. Written as 0.19.0 on its own branch beside the settlement slice
of step 5; renumbered if settlement merges first. Additive only.

### Added

- Rating an order and its delivery (`Reviews` tag): "How was your order?"
  (`GET /v1/customer/orders/{order_id}/review`, `OrderReviewState` with
  `ReviewStatus`, `CustomerReview`, `ReviewTagOffer` and `ReviewTagOption`),
  a review written once with a thumb (`ReviewThumb`), tags from that thumb's
  list, a note of at most 500 characters and at most three photos
  (`POST .../review`, `OrderReviewInput`; `409` `order_not_completed`,
  `reviews_off`, `tag_not_offered`, `already_reviewed`, `asset_not_usable`),
  a photo's upload grant for the order's review
  (`POST .../review/photo-uploads`, `ReviewPhotoUpload`, purpose
  `review_photo`, ten grants an order), "Not now" to the ask
  (`POST .../review/not-now`), and "How was your delivery?" rated apart from
  the food for the Agent who carried it
  (`POST /v1/customer/orders/{order_id}/delivery-rating`,
  `DeliveryRatingInput`, `DeliveryRating`, `DeliveryRatingState`; `409`
  `delivery_not_rateable`, `already_rated`).
- A store's rating and reviews on the storefront: `rating`
  (`LocationRating`, "72% (18)", `null` rather than 0%) on `StoreCard`,
  `SearchStore` and `StorePage`, and the reviews newest first, signed in or
  not, never the order or the photos
  (`GET /v1/storefront/stores/{location_id}/reviews`, `StoreReviewPage`,
  `StoreReview`, `PublishedReply`).
- The Partner's reviews: a store's reviews with the order each was about
  (`GET /v1/partners/{partner_id}/locations/{location_id}/reviews`,
  `PartnerReviewPage`, `PartnerReview`, `PartnerReviewOrder`, `ReviewAgent`),
  the period's figures with the share of orders rated
  (`GET .../reviews/summary`, `ReviewSummary`, `ReviewPeriod`), and one
  reply per review, moderated (`POST`, `DELETE .../reviews/{review_id}/reply`,
  `ReviewReplyInput`, `ReviewReply`, `ReviewReplyStatus`; `409`
  `reply_not_allowed`), with `review:reply`, a new permission managers hold
  by default.
- Agents' ratings: one per delivery over 90 days in the Agent app with the
  flag of an unfair rating within 14 days
  (`GET /v1/agent/memberships/{agent_id}/ratings`, `AgentRatings`,
  `AgentRating`, `AgentRatingFigure`, `RatingFlag`;
  `POST .../ratings/{rating_id}/flag`, `AgentRatingFlagInput`; `409`
  `flag_window_closed`, `already_flagged`), a Partner's own Agents' ratings
  and flags (`GET /v1/partners/{partner_id}/agents/{agent_id}/ratings`,
  `StaffAgentRatings`, `StaffAgentRating`, `RatingShare`;
  `GET /v1/partners/{partner_id}/rating-flags`, `RatingFlagPage`,
  `RatingFlagDetail`; `POST .../rating-flags/{flag_id}/decision`,
  `RatingFlagDecision`; `409` `flag_decided`).
- Mission Control's reviews: every review with filters
  (`GET /v1/platform/reviews`, `PlatformReviewPage`, `PlatformReview`), every
  store's rating, also as a spreadsheet
  (`GET /v1/platform/reviews/locations`, `RatedLocationPage`,
  `RatedLocation`), a store's rating over a range a year at most
  (`GET /v1/platform/locations/{location_id}/rating`,
  `LocationRatingReport`, `LocationRatingDay`; `range_too_long`), hiding a
  note and photos and showing them again (`POST .../reviews/{review_id}/hide`,
  `ReviewHide`, `ReviewHiding`, `.../show`; `409` `nothing_to_hide`), the
  replies to moderate (`GET /v1/platform/review-replies`,
  `ModeratedReplyPage`, `ModeratedReply`, `ModeratedReplyReview`;
  `POST .../{reply_id}/approve`, `.../reject`, `ReplyRejection`; `409`
  `reply_decided`), an Agent's ratings and the flags
  (`GET /v1/platform/agents/{agent_id}/ratings`,
  `GET /v1/platform/rating-flags`,
  `POST /v1/platform/rating-flags/{flag_id}/decision`), and the order's
  review on `PlatformOrder` (`review`, `OrderReviewSummary`;
  `delivery_rating`).
- Mission Control's customers (`Customers` tag): finding a customer by what
  a caller can say (`GET /v1/platform/customers`, `PlatformCustomerPage`,
  `PlatformCustomerRow`, `CustomerStatus`), how many joined
  (`GET /v1/platform/customers/summary`, `PlatformCustomerSummary`), the
  customer's page, read only (`GET /v1/platform/customers/{customer_id}`,
  `PlatformCustomer`, `PlatformCustomerActions`, `CustomerBlock`), the
  timeline drawn from the events (`GET .../timeline`,
  `CustomerTimelinePage`, `CustomerTimelineEntry`, `CustomerTimelineKind`,
  `CustomerTimelineActor`), support's notes (`GET`, `POST .../notes`,
  `CustomerNoteList`, `CustomerNote`, `CustomerNoteAuthor`,
  `CustomerNoteInput`; `note_too_long`), blocking and unblocking with a
  reason (`POST .../block`, `.../unblock`, `CustomerBlockInput`; `409`
  `illegal_transition`), and the `customer_id` filter on
  `GET /v1/platform/orders`.
- Operations (`Operations` tag): the service level objectives
  (`GET /v1/platform/operations/objectives`, `ObjectiveList`, `Objective`,
  `ObjectiveWindow`), the alerts and their acknowledgement
  (`GET /v1/platform/operations/alerts`, `AlertList`, `Alert`,
  `AlertSource`, `AlertSeverity`, `AlertStatus`;
  `POST .../alerts/{alert_id}/acknowledge`), the jobs registry with runs
  and run now (`GET /v1/platform/operations/jobs`, `JobList`, `Job`,
  `JobKind`; `GET .../jobs/{job}/runs`, `JobRunPage`, `JobRun`,
  `JobRunOutcome`; `POST .../jobs/{job}/run`; `409` `job_running`,
  `job_not_runnable`), and the outbox's pending and failed rows with replay
  (`GET /v1/platform/operations/outbox`, `OutboxPage`, `OutboxEntry`,
  `OutboxCounts`, `OutboxTypeCount`, `OutboxRowStatus`, narrowed by type,
  Partner, correlation id or aggregate (`aggregate_type` with
  `aggregate_id`); `POST .../outbox/replay`, `OutboxReplayInput`,
  `OutboxReplay`), with `operations:manage`, a new platform permission.
- `POST /v1/auth/refresh` lists the `403` `account_blocked` a blocked
  customer's refresh answers.
- Events: `reviews.review.written`, `.hidden`, `.shown` and `.asked`,
  `reviews.reply.published` and `.rejected`, `reviews.task_rating.written`,
  `reviews.flag.decided`, `customers.customer.blocked` and `.unblocked`,
  `customers.note.written`, `operations.alert.opened`, `.acknowledged` and
  `.closed`.

### Changed

- `account_blocked` says "Your account is blocked. If you think this is a
  mistake, contact ZippyGo support." rather than naming a Help page.

## [0.18.0] - 2026-10-16

Step 4, dispatch: an accepted delivery order becomes one delivery, asked of
the store's Provider, offered or given to an Agent by the delivery
service's strategy with an explanation, given by hand from a dispatch
board, moved forward by what the Agent does with the order following, the
customer watching the courier approach and the promise kept up to date.
Written as 0.17.0 on its own branch beside the workforce slice and renumbered
after the workforce (0.17.0) merged first. Additive only.

### Added

- The Agent app's offers (`Deliveries` tag): the calling Agent's offers
  with the stops by area, the planned times, the distance, the pay with its
  breakdown and rule, cash to collect and what is carried
  (`GET /v1/agent/offers`, `AgentOfferList`, `AgentOffer`), one offer
  (`GET /v1/agent/offers/{offer_id}`), accepting it (`POST .../accept`;
  `409` `offer_taken` when another Agent accepted first, `offer_closed`
  once it expired, was withdrawn or answered) and declining it with an
  optional reason (`POST .../decline`, `OfferDecline`). Locally and in the
  sandbox the simulator's service token acts for Agents without a user,
  naming the Agent in `agent_id`.
- The Partner's dispatch board (`GET /v1/partners/{partner_id}/dispatch/board`,
  `DispatchBoard` with `DispatchBoardCounts` and `DeliverySummary` rows in
  `DeliveryBoardGroup`s: waiting for release, waiting for an Agent,
  assigned, collected, late, undelivered and needing somebody), a
  delivery's page with its Provider, state, courier, times, distances,
  team, `DeliveryExplanation` and log (`DeliveryLogLine`)
  (`GET .../deliveries/{delivery_id}`, `DeliveryDetail`), who it may be given to (`GET .../candidates`,
  `DeliveryCandidateList`), giving it to a team or an Agent
  (`POST .../assignment`, `DeliveryAssignmentInput`; `409`
  `assignment_refused` with `agent_over_limit`, `agent_kind_not_allowed`,
  `agent_suspended`, `agent_not_active`, `agent_cash_ceiling`,
  `agent_not_in_service`, `delivery_not_with_provider`,
  `delivery_collected`, `delivery_ended`), asking again
  (`POST .../ask`; `nothing_to_ask`, `no_provider`), sending an
  undelivered order again (`POST .../send-again`, `201` with the new
  delivery; `delivery_not_failed`), an order's deliveries and asking for
  one when it has none (`GET`, `POST /v1/partners/{partner_id}/orders/{order_id}/deliveries`,
  `OrderDeliveries`; `not_for_delivery`, `delivery_open`), and each
  delivery service's dispatch settings
  (`GET`, `PUT /v1/partners/{partner_id}/services/{service_id}/dispatch-settings`,
  `DispatchSettings`, `DispatchSettingsUpdate`, with `ETag` and
  `If-Match`): the strategy (`DispatchStrategy`: nearest available,
  broadcast, round robin, ETA-based), offers or direct assignment
  (`DispatchMode`), auto-assign, the offer's time, the limit per Agent, the
  minutes before the next Provider, the cash ceiling and the customer's
  code at the drop.
- Mission Control's board across Partners and the same acts
  (`GET /v1/platform/dispatch/board`, `GET /v1/platform/deliveries/{delivery_id}`,
  `.../candidates`, `.../assignment`, `.../ask`, `.../send-again`,
  `GET`, `POST /v1/platform/orders/{order_id}/deliveries`).
- The customer's order gains its courier's first name (`courier`,
  `OrderCourier`), the time it is expected at the door (`expected_at`, also
  on `OrderPromise`), the code for the door when the delivery asks for one
  (`drop_code`) and the proof once delivered (`proof`, `OrderProof`). A
  store's order gains its courier with a way to call them (`courier`,
  `StoreCourier`), `expected_at`, the delivery (`delivery_id`), whether a
  Provider carries it (`carried_by_provider`: the store then neither hands
  over nor delivers by hand) and the proof. My orders' rows
  (`CustomerOrderSummary`) carry the courier too, and the store an order is
  from (`OrderStore`) its point (`lat`, `lng`) for the order's map.
- Live: the dispatch board channels `private-partner-{partner_id}-deliveries`
  (members with `dispatch:read`) and `private-deliveries` (platform
  `dispatch:read`) carrying `delivery.changed`; `offer.changed` on an
  Agent's task channel; the `courier.position` frame
  (`CourierPositionFrame`) on an order's channel from collection until
  delivery, never replayed.
- Events: `orchestration.delivery.created`, `released`, `offered`,
  `assigned`, `collected`, `delivered`, `undelivered`, `called_off`,
  `waiting_for_agent` and `needs_somebody`, each with the delivery, the
  order, the store, its Partner and, where named, the Agent; and
  `ordering.order.on_its_way` (with the courier), `undelivered` and
  `running_late` (told once). `ordering.order.delivered` gains the optional
  `delivery_id`, `agent_id`, `distance_metres` and `proof_kinds`.
- Error codes: `offer_taken`, `offer_closed`, `delivery_not_with_provider`,
  `delivery_collected`, `delivery_ended`, `nothing_to_ask`,
  `delivery_not_failed`, `delivery_open`, `not_for_delivery`,
  `no_provider` and `assignment_refused` with its field codes.
- Notifications: an offer is pushed to the devices of the person holding
  the Agent membership (`RecipientKind` `agent`, template `agent.offer`);
  the customer is told of `on_its_way` with the courier's first name,
  `running_late` and `undelivered`.
- The boards list the deliveries under way and the failed ones waiting to
  be sent again or cancelled; a delivery that ended otherwise is off them
  (`DeliveryBoardGroup`).
- Who carries a Location's deliveries, in the order they are asked
  (`GET /v1/partners/{partner_id}/locations/{location_id}/delivery-chain`,
  `DeliveryChain`): its own delivery service, then the platform fleet, each
  naming its Partner.

### Changed

- `DispatchSettings` and `DispatchSettingsUpdate` no longer carry
  `max_tasks_per_agent`, `cash_ceiling` or `drop_code_required`, written
  earlier on this branch and never released: the limit per Agent, the cash
  ceiling and the customer's code at the door are the delivery service's
  agent settings, which the workforce keeps and dispatch weighs Agents
  against (the coordinator's decision). A client still sending them is
  answered `400`.

## [0.17.0] - 2026-10-16

Step 4, workforce: a Partner's Agents in its delivery services, from the
invitation to the day's pay. Written before the platform serves it so the
consoles and the Agent app build against it; the dispatch slice of step 4
takes the next free minor when it merges after this one. Additive only.

### Added

- The `Agent app` operations, for Agent app tokens (audience `agent`): the
  person's memberships with the documents still needed, duty, cash in hand
  and the pay rule version (`GET /v1/agent/memberships`, `GET
  .../{agent_id}`, `AgentMembershipList`, `AgentMembership`), the one they
  work under (`PUT /v1/agent/working-membership`), invitations in progress
  for their verified number or email and accepting or declining one (`GET
  /v1/agent/invitations`, `POST .../{invitation_id}/accept`, `.../decline`),
  documents with upload grants (`GET`, `POST .../documents`, `POST
  .../document-uploads`, `GET .../documents/{document_id}/files/{asset_id}/link`),
  the duty switch with the zone (`GET`, `PUT .../duty`, `GET .../zones`,
  `AgentDuty`), position batches applied only on duty (`POST .../positions`,
  `AgentPositionBatch`), tasks with their workflow steps applied once by a
  client id and in order (`GET .../tasks`, `GET /v1/agent/tasks/{task_id}`,
  `POST .../receipt`, `POST .../steps` with `TaskStepRecord`, `POST
  .../hand-back`, `POST .../proof-uploads`, `POST .../help`, `GET
  .../proof`), the day's pay with each task's breakdown, tips and cash in
  hand (`GET .../earnings`, `AgentDay`), cash in hand (`GET .../cash`) and
  the pay rule in force (`GET .../pay-rule`). Where `APP_PROFILE` is local
  or sandbox the simulator's service token acts for an Agent without a user
  on the same routes.
- The `Agents` operations for a Partner's members (`agent:read`,
  `agent:manage` for the service) and for Mission Control with its platform
  permissions: the Agents with the counts of the selection (`GET
  /v1/partners/{partner_id}/agents`, `PartnerAgentPage`, `PartnerAgent`),
  an invitation by mobile number (+91 by default) or email with a kind
  (`POST`, `AgentInvite`), an individual Partner's owner joining their own
  delivery service (`POST .../agents/self`), one Agent with its status
  history (`GET`, `PATCH .../agents/{agent_id}` with `If-Match`), its
  statuses (`POST .../activate`, `.../suspend`, `.../reinstate`,
  `.../offboard`, `.../invitation` to send an invitation again), its
  documents and their review (`GET .../documents`, `POST
  .../documents/{document_id}/review`, the file links), the review queue
  (`GET /v1/partners/{partner_id}/agent-documents`), an Agent's tasks (`GET
  .../tasks`), an order's proof of delivery (`GET
  /v1/partners/{partner_id}/orders/{order_id}/proof-of-delivery`), a
  service's teams with the default team's area (`GET
  .../services/{service_id}/teams`), how a service runs its Agents' work
  (`GET`, `PATCH .../agent-settings`: geofence, the customer's code, a
  signature, police verification, the cash ceiling, the limit of
  deliveries under way and the workflow templates) and its pay rule
  versions (`GET`, `POST .../pay-rules`).
- Mission Control: every Agent across Partners (`GET /v1/platform/agents`,
  `GET .../{agent_id}`) and every document waiting for review (`GET
  /v1/platform/agent-documents`) with platform `agent:read`; any order's
  proof of delivery (`GET /v1/platform/orders/{order_id}/proof-of-delivery`,
  `order:read`). The customer reads their own order's (`GET
  /v1/customer/orders/{order_id}/proof-of-delivery`).
- `Agent` (the live agent read of `GET /v1/fleet/agents` and the agent
  streams) carries `kind`, `on_duty`, `zone_id`, `current_task` (the task
  under way in short: the delivery, the order with its id and number, and
  the stop it is heading to) and the service it works in (`service_id`,
  `service_name`, so a live map filters by service); `AgentStatus` gains
  `busy` (online with a task under way); the `status` frames
  (`AgentStatusUpdate`, `AgentStatusFrame`) carry `current_task`, and the
  `position` and `status` frames carry `service_id` and `service_name`;
  `LocationPingsAccepted` counts the pings `dropped` off duty.
- Problem codes `service_not_agent_based`, `kind_not_allowed`,
  `agent_already_member`, `duty_refused` (field codes `duty_not_active`,
  `duty_document_expired`, `duty_elsewhere`), `tasks_under_way`,
  `task_closed`, `step_required`, `outside_geofence`, `scan_mismatch`,
  `code_wrong`, `code_locked` and `hand_back_closed`, all 409.
- Events `fleet.membership.invited`, `.joined`, `.activated`,
  `.suspended`, `.reinstated`, `.offboarded`; `fleet.document.submitted`,
  `.approved`, `.rejected`; `fleet.duty.started`, `.ended`;
  `fleet.task.assigned`, `.received`, `.started`, `.arrived`,
  `.completed`, `.failed`, `.handed_back`, `.returned`, `.called_off`,
  `.help_requested`, each with the Agent, the Partner and the service and,
  for tasks, the delivery and the order; never a phone number, an email
  address or a document number.
- An Agent's own channel (`private-agent-{agent_id}-tasks`) carries
  `task.changed`, `membership.changed`, `document.changed` and
  `duty.changed` signals (subjects `task`, `membership`, `document`,
  `duty`): the Agent app reads the record again. The Partner's agents
  channel and `private-agents` carry `agent.changed` (subject `agent`) when
  an Agent's membership, documents or duty change.
- `RecipientKind` gains `agent` (the person of an Agent membership, by their
  Agent app devices, number or email): the invitation by SMS or email, and
  the decisions about an Agent (documents, activation, suspension,
  reinstatement, offboarding) by push, else SMS, else email, appear in the
  delivery log.

### Changed

- `POST /v1/fleet/location-pings` applies a ping only while its agent is
  on duty; a ping off duty is dropped and never kept. The Agent app
  reports its own positions at `POST
  /v1/agent/memberships/{agent_id}/positions`.
- An invited mobile number or email may ask for a one-time code for the
  Agent app before it has an account: the account is made when the code
  is verified. A code for anybody else still never makes an account.

## [0.16.0] - 2026-10-16

Step 3, orders: server baskets priced by the platform, checkout, placing
with every check made again and paid through the payments module, the
order's one status and its live page, the customer's cancel and help, My
orders, the receipt and reorder, a store's handling of its orders, and
Mission Control on any order. Written as 0.14.0 on its own branch,
renumbered after the notifications (0.14.0) and money (0.15.0) slices
merged first. Additive only.

### Added

- The `Baskets` operations: a visitor token for baskets kept before
  sign-in (`POST /v1/visitor-tokens`, `VisitorToken`, sent back as
  `X-Visitor-Token`), every basket of the caller (`GET /v1/baskets`,
  `BasketList`), a visitor's baskets taken by the signed-in customer
  (`POST /v1/baskets/claim`), a basket at a store priced by the platform
  as it will be charged (`GET`, `PATCH` checkout's answers, `DELETE` at
  `/v1/baskets/{location_id}`, `Basket`, `BasketChoicesUpdate`), its lines
  (`POST .../lines`, `PATCH`, `DELETE .../lines/{line_id}`,
  `BasketLineInput` with answers three deep, `BasketLineUpdate`) and
  checkout (`GET .../checkout`, `Checkout`): delivery or pickup as the store
  offers, the customer's addresses with whether the store delivers there,
  the ways to pay as the payments module offers them (`PaymentOption` with
  why one may not be used as a `code` and a sentence, and the cards and UPI
  IDs the customer saved, `SavedMethodOption`) and the Wallet, the tip
  presets and cutlery. Every amount is `Money`, tax included; the delivery
  fee is the store's fee plus the band of the distance ladder
  (`DeliveryFee`).
- The `Orders` operations for customers: placing the basket at the price
  shown (`POST /v1/customer/orders` with `OrderPlacement`, `quote` and a
  required `Idempotency-Key`, answering `PlacedOrder` with the
  `PaymentStep`), My orders (`GET /v1/customer/orders`,
  `CustomerOrderPage`), the order's page with its receipt
  (`GET /v1/customer/orders/{order_id}`, `CustomerOrder`, `Receipt`, with
  its `ETag`), cancelling until the store accepts (`POST .../cancel`,
  `CustomerCancellation`), help (`POST .../help`, `HelpRequestInput`,
  `HelpRequest`) and reorder (`POST .../reorder`, `Reorder`).
- Paying through the payments module: placing starts the order's payment
  (the Wallet first, the rest by UPI, a card or cash) and, while something
  is to be taken, answers the order `paying` with `PaymentStep.next_action`
  (`NextAction`: `open_page` for the provider's page, or `approve_in_app`
  for a request waiting in the UPI app, with `expires_at` and a `message`);
  the provider's page sends the customer back to `OrderPlacement.return_url`
  (an address of the storefront or another of the platform's apps,
  `validation_failed` with `return_url_not_allowed` otherwise; the order's
  page on the storefront by default) and the order is `placed` once the
  provider confirms the payment. `OrderPlacement.saved_method_id` pays with
  a saved card or UPI ID. A customer who gives up paying cancels the order
  still `paying` (`paying` may now become `cancelled`): whatever was held is
  released and nothing is charged; the store is told nothing.
- An order's refund is the payment's refund of the same id
  (`OrderRefund.id`, `ordering.order.refunded`'s `refund_id`):
  `POST /v1/customer/refunds/{refund_id}/to-wallet` takes it, and the
  order's refund follows where its money went in the end. A payment
  confirmed after its order ended is given back at once and recorded on
  the order (`paid_after_end`).
- The `Order handling` operations for a store, under
  `/v1/partners/{partner_id}/locations/{location_id}/orders`: the live
  board (`GET .../live`, `LiveOrders`, with `next_new_order_id` for kitchen
  mode and deliveries on their way in a group of their own until delivered
  or cancelled), the history (`GET .../history`, `OrderHistory`), pausing
  new orders (`PUT`, `DELETE .../pause`, `OrderPause`, `OrderTaking`), one
  order (`GET .../{order_id}`, `StoreOrder`) and its moves: `accept`
  (`AcceptOrder`, with lines left out), `decline` (`DeclineOrder`, which may
  name the lines that sold out, their variants marked sold out for today
  with `catalog:stock` or `catalog:write`), `extend` (`ExtendPreparation`),
  `ready`, `collected`, `handed-over`, `delivered` and `cancel`
  (`StoreCancellation`). Members need `order:read` and `order:manage` at the
  Location; platform staff use the same routes.
- Mission Control's operations under `/v1/platform/orders`: every order
  with what needs attention (`GET`, `PlatformOrderPage`, `AttentionReason`,
  narrowed by zone), the orders at a glance (`GET .../summary`,
  `PlatformOrderSummary`, `OrderStatusCounts`, `AttentionCounts`), any
  order with its customer's id (`GET .../{order_id}`, `PlatformOrder`),
  cancelling at any point (`POST .../cancel`, `PlatformCancellation`),
  refunds of lines and fees bounded by what was paid, previewed
  (`POST .../refunds/preview`, `RefundPreview`) and made with a fresh
  step-up and `Idempotency-Key` (`POST .../refunds`, `RefundInput`,
  `OrderRefund`), and help resolved (`POST .../help/{help_id}/resolve`,
  `HelpResolution`).
- The problem codes `basket_empty`, `store_not_trading`,
  `method_not_offered`, `address_missing`, `address_outside_area`,
  `lines_refused` (with the field codes `item_unavailable`,
  `item_out_of_hours`, `item_pre_order_only`, `item_not_this_way`,
  `over_limit` and `choice_invalid`), `below_minimum`,
  `age_not_confirmed`, `age_under_18`, `payment_method_missing`,
  `tip_not_allowed`, `tip_too_high`, `price_changed`, `order_moved`,
  `order_not_cancellable`, `remove_everything`, `customer_wants_all`,
  `stock_short`, `payment_failed` and `help_not_offered`, all `409`;
  ordering also answers money's `payment_method_not_offered`,
  `cod_over_limit`, `refund_exceeds_paid` and `not_refundable`.
- The events `ordering.order.placed` (with `carrier`), `.accepted`,
  `.lines_removed`, `.declined` (with `sold_out_line_ids`), `.cancelled`,
  `.expired`, `.preparation_extended`, `.ready`, `.handed_over`,
  `.collected`, `.delivered`, `.refunded` (with `payment_method`),
  `.help_requested` and `.help_resolved`, each with the order, its store,
  Partner and customer, its status and version, and the amounts it
  changes; the payments module and the ledger read them.
- Every move of an order signals `order.changed` (subject `order`, its
  status and version) on the order's channel, the customer's orders
  channel, the store's orders and kitchen channels and `private-orders`.
- The `X-Visitor-Token` request header (`VisitorTokenHeader`), allowed by
  CORS.
- The platform serves every operation of the slice
  (`generated/platform-openapi.json` re-synced). `Idempotency-Key` (the
  header and the conventions) says that a first refused before it could act
  (`401`, `403` such as `step_up_required`, `429`) is processed afresh,
  like a `5xx`.

## [0.15.0] - 2026-10-16

Step 3, money: payments against a simulated provider with sandbox semantics,
the Wallet with its two balances, and the double-entry ledger with every
order's money split. Follows the notifications slice's 0.14.0; the orders
slice of step 3 takes the other free minor when it merges. Additive only.

### Added

- The `Payments` operations for customers: the ways to pay an amount at a
  Location (`GET /v1/customer/payment-options`, `PaymentOptions` with a
  `PaymentChoice` per method and the reason when one is not offered), the
  customer's payments (`GET /v1/customer/payments`, `GET .../{payment_id}`,
  `Payment` with its Wallet, provider and cash parts, every try and every
  refund; reading one still waiting also asks the provider, at most every 5
  seconds), a new try within the order's time
  (`POST .../{payment_id}/attempts`, `PaymentAttemptStarted` with the
  `PaymentNextAction`), taking a source refund in the Wallet before it is
  sent (`POST /v1/customer/refunds/{refund_id}/to-wallet`), and saved cards
  and UPI IDs kept as the provider's tokens (`GET`, `POST
  /v1/customer/payment-methods`, `DELETE .../{method_id}`, `PUT
  .../{method_id}/default`, `GET /v1/customer/payment-method-setups/{setup_id}`).
- The `Wallet` operations for customers: the Wallet with its paid and
  promotional balances (`GET /v1/customer/wallet`), its entries
  (`GET .../entries`), a month's statement (`GET .../statements/{month}`),
  a top-up by UPI or card (`POST .../top-ups`) and a withdrawal of paid money
  to its source behind a fresh step-up (`POST .../withdrawals`).
- The provider's notices, `POST /v1/payments/notices/{provider}`, accepted
  only with a valid signature, checked against the records and seen once.
- How a Location takes cash, `GET`, `PUT
  /v1/partners/{partner_id}/locations/{location_id}/payment-settings`
  (`location:read`, `location:write`).
- Mission Control: every payment (`GET /v1/platform/payments`,
  `GET .../{payment_id}`, `order:read`), a refund to the source first and
  the rest to the Wallet behind a fresh step-up
  (`POST .../{payment_id}/refunds`, `order:refund`); a customer's Wallet,
  its entries, credit given and corrections (`/v1/platform/customers/{customer_id}/wallet`,
  `.../entries`, `.../credits`, `.../corrections`, `wallet:read`,
  `wallet:write`); what the nightly checks found and running them now
  (`GET /v1/platform/finance/alerts`, `POST .../{alert_id}/resolve`,
  `POST /v1/platform/finance/reconciliations`); and the `Ledger`
  operations: accounts, entries, an order's money split and the trial
  balance (`/v1/platform/ledger/accounts`, `.../entries`,
  `.../orders/{order_id}`, `.../trial-balance`) with the new permissions
  `ledger:read` and `ledger:write`. The ledger's accounts include
  `fee_revenue` (the small-order fee, net of GST); an order's commission is
  the rate its Location's policy layers set when it was placed, the layer
  named in `OrderMoneySplit.plan`.
- The refusal `wallet_short` in `PaymentRefusal`: the Wallet pays part of
  the order and another way pays the rest.
- `generated/platform-openapi.json` synced from the platform's step 3 money
  branch, which serves every operation of this slice.
- The problem codes `payment_method_not_offered` (409, with the field codes
  `upi_over_limit`, `cod_withheld`, `cod_not_offered`, `cod_not_accepted`,
  `provider_unavailable` and `card_expired`), `cod_over_limit`,
  `payment_not_pending`, `refund_exceeds_paid`, `not_refundable`,
  `refund_already_sent`, `wallet_cap_exceeded`,
  `withdrawal_exceeds_available`, `withdrawal_source_unavailable` and
  `correction_exceeds_available` (409) and `notice_rejected` (400), and
  the field codes `top_up_out_of_range`, `upi_id_invalid` and
  `return_url_not_allowed` under `validation_failed`. The entries
  `payment_method_not_offered`, `cod_over_limit` and `refund_exceeds_paid`
  carry the same status, title and message as the orders slice's.
- The events `payments.payment.authorized`, `payments.payment.captured`,
  `payments.payment.failed`, `payments.payment.released`,
  `payments.refund.issued`, `payments.refund.settled`,
  `wallet.entry.recorded`, `ledger.entry.posted` and
  `payments.alert.raised`, version 1, with their payloads and examples.

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
