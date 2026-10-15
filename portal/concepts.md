# Concepts

The vocabulary used throughout the API. Each term maps to a resource (or a
family of resources) and to a tag in the reference.

## User

A user is a person who signs in: with a one-time code sent to an email
address or a phone number, or with a password once one is set. The user
record holds identity data only (`id`, `email`, `phone`, `display_name`).
What a user may do comes from their memberships in partners and, for the
operations side of ZippyGo, from their platform roles. `GET /v1/me` returns
the signed-in user with both; [Authentication](/authentication) describes
how to sign in.

## Partner

A partner is an organisation or an individual that sells products, sells
services or provides fleet capacity on the platform. The partner is the
supply-side tenant: it owns locations, services, members, catalog, orders,
subscriptions, API keys and webhook endpoints, and every piece of data in
the API belongs to exactly one partner. A partner has a `kind`,
`organisation` or `individual`, fixed at creation, and a `status`: it is
`pending` from creation until the platform realm activates it, `active`
while it operates and `suspended` when the platform has stopped it. Any
signed-in user can create a partner and becomes its first owner.

## Membership

A membership is a user's place in a partner, with a role that decides what
they may do there: `owner` (everything, including members and the partner
record), `manager` (locations, services, invitations), `dispatcher`
(deliveries and the fleet), `kitchen` (preparing orders) and `staff` (the
day-to-day at a location). A user has at most one membership per partner
and can belong to several partners with different roles. Members join by
accepting an invitation sent by an owner or a manager; the last owner of a
partner cannot be removed.

## Location

A location is a physical place that belongs to a partner, such as a store,
a restaurant, a dark store, a warehouse or a service base. A location has
a name, a postal address, coordinates, a time zone (`Asia/Kolkata` unless
set otherwise) and a status, `active` or `inactive`. Pickups happen at
locations; opening hours and catalog assignments are added with the
domains that need them.

## Service

A service is one kind of business a partner runs on the platform:
`product_sales` (selling products from a catalog, for delivery, pickup or
dine-in), `field_service` (services performed at the customer's place) or
`delivery` (moving goods with the partner's own agents). A partner has at
most one service per kind, `enabled` or `disabled`, with a configuration
object whose keys are documented as each kind's features are released.
Agents are attached to a service, not to the partner directly.

## Order

An order is the commercial purchase: what a customer bought, from which
location, at what price, with what payment and under which fulfilment
mode (delivery, pickup or dine-in). An order is the source of truth for
money; fulfilment is tracked separately as deliveries.

## Delivery

A delivery is the fulfilment intent for an order: the commitment to move
goods from a pickup point to a dropoff point within a time window. It is
what gets priced, offered to providers, tracked and proven. An order can
have more than one delivery and a delivery may be reassigned without
touching the order.

## Task

A task is one stop with a workflow: arrive, perform the steps that apply
(collect, hand over, verify, capture proof), and complete or fail. A
delivery produces at least a pickup task and a dropoff task; dine-in and
other flows use the same model with their own steps.

## Trip

A trip bundles tasks for one agent into an ordered route. Trips are how
capacity is planned and dispatched: tasks from several deliveries can share
a trip, and a trip's progress is what live tracking and ETAs are built on.

## Agent

An agent is a person or, later, a machine attached to one of a partner's
services that executes tasks for it. The agent record is a membership in
that service, not an identity: it carries the partner, the kind of service
(`delivery`, `product_sales` or `field_service`), a display name, a working
status (`online` or `offline`) and the last known position. The same person
is a separate agent in every service they are attached to; they sign in as
a user, through the identity operations, and the agent record is what the
fleet sees. Agents are assigned trips, and everything the API reports about
progress, location and proof of delivery comes from the agent executing the
task.

## Provider

A provider is anyone with capacity to execute tasks: a partner's own
fleet, the ZippyGo platform fleet, or a third-party carrier. Deliveries are
offered to providers according to the partner's routing rules, and a
provider can accept, reject or hand back work.

## Subscription

A subscription is a plan plus a schedule that generates orders. The plan
says what is purchased and at what price; the schedule says when. Each
occurrence becomes an ordinary order, so fulfilment, payment and reporting
work the same way as for one-off purchases.

## Platform realm

The platform realm is the operations side of ZippyGo: the people who
activate and suspend partners and look across all of them. A user is in
the realm when they hold platform roles, which `GET /v1/me` lists in
`platform_roles` and the access token carries in `platform`. Operations
that are open to the realm only, such as `GET /v1/partners`, say so in the
reference and answer `403` (`forbidden`) for everyone else. A platform
user also reads any partner's locations, members, invitations and
services, without being a member.

## Service area

A service area is a node of the geography tree of a country: a region, a
city, a town, a village or a zone. The kind is a label; what makes an area
serve customers is its fence, a polygon drawn at exactly one level of the
tree. A pin resolves to the smallest fenced area containing it, else to the
nearest serving area within the resolution cap, else to the country's
default area (`GET /v1/service-areas/resolve`, no token needed). Every
location sits in the fenced area its pin falls in. A fenced area can be
divided into fenced children, with a dry run first, and children can be
merged back.

## Vertical

A Vertical is a category of trade a customer browses: Food & Drinks,
Bakery & Sweets, Markets & Grocery, Health & Pharmacy, Retail & Shops,
Daily Essentials and Home Services at launch. A service area declares the
Verticals it offers; the areas beneath inherit them. Each area composes
its opening screen as a display grid of Vertical tiles and campaign slots.

## Service policy and schedule

Fees, minimum order values, tax and commission rates and delivery
estimates are a service policy, set in layers: the country, each service
area in the chain, the partner and the location. A layer leaves a field
`null` to defer upward; zero is a decision. Every save is a new version and
the effective policy of a location names, for every field, the layer and
the version that supplied it. Schedules (a weekly pattern with dated
exceptions) resolve through the same layers in the location's own time
zone.

## Store type and service type

A store type says what a location that sells is (Food, Bakery, Drinks,
Markets, Pharmacy, Retail): its typed fields from a closed catalogue and
what its items may carry. A service type says what a partner's field
service does (Salon, Repairs, Laundry, Cleaning): its workflow, durations,
radius and typed fields.
