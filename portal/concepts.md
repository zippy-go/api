# Concepts

The vocabulary used throughout the API. Each term maps to a resource (or a
family of resources) and to a tag in the reference.

## Partner

A partner is an organisation or an individual that sells products, sells
services or provides fleet capacity on the platform. The partner is the
supply-side tenant: it owns locations, catalog, orders, subscriptions, API
keys and webhook endpoints, and every piece of data in the API belongs to
exactly one partner. A partner has a kind, `organisation` or `individual`,
and a user can be a member of several partners with different roles.

## Location

A location is a physical place that belongs to a partner, such as a store,
a restaurant, a dark store or a warehouse. Locations have an address,
opening hours and a catalog assignment, and are where pickups happen.

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
(`delivery` for now), a display name, a working status (`online` or
`offline`) and the last known position. The same person is a separate agent
in every service they are attached to, and signing in is a matter for the
identity module rather than for the agent record. Agents are assigned
trips, and everything the API reports about progress, location and proof of
delivery comes from the agent executing the task.

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
