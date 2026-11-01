# The sandbox

Every Partner has a sandbox, where its developers build against the API with sandbox keys
before going live. It serves the same API version as production, on the platform's simulator:
orders are accepted on a pace you set, a sandbox Agent carries each delivery to the door, payments
go through a simulated provider that answers your test instruments, and nothing ever reaches a
real person, a carrier or a bank.

## Your sandbox

A Partner's owner creates a sandbox key in the Partner console, under **Developer › Keys**. A
sandbox key starts `zg_test_`; it is shown once, so copy it while it is shown. The first sandbox
key makes the Partner's **twin**: a copy of the Partner with its Locations, services and
published menus, which every sandbox key acts on with its scopes.

- The twin is a Partner of its own, with Locations of its own. **Developer › Sandbox** in the
  Partner console, or `GET /v1/partners/{partner_id}/sandbox`, lists the twin's Locations and the
  Locations each was made from: a sandbox key places orders at the twin's Location ids.
- The twin is never listed on the storefront or in search, never paid out, and never messages
  anyone: every SMS, WhatsApp message, email or push it would send lands in the **sandbox
  inbox** instead (`GET /v1/sandbox/inbox`, a sandbox key only).
- Its menus are the Partner's published menus as they were when the twin was made, at the same
  prices and with the same item ids. To take a change to the menu, reset the sandbox.
- A **reset** (`POST /v1/partners/{partner_id}/sandbox/reset`, or **Reset** in the Partner
  console) makes the twin again from the Partner as it is now: the twin's orders, deliveries and
  inbox are let go and its Locations get new ids. Each key keeps its pace.
- A sandbox no sandbox key has touched for **90 days** is purged; the next sandbox key makes it
  again.

## The pace

An order placed in the sandbox moves by itself, as a store and an Agent would move it:

| Move | After | |
| --- | --- | --- |
| Accepted | 20 seconds from placing | unless you accept or decline it first |
| Assigned to the sandbox Agent | 30 seconds from acceptance | |
| Collected | 2 minutes from assignment | |
| Delivered | 5 minutes from collection | with a stock photo as its proof |

Each sandbox key sets its own pace (`GET`, `PUT /v1/sandbox/pace`): each move 1 to 3,600
seconds after the one before, or `by_hand`, when nothing moves by itself. A move already on its
way keeps the moment it was given; the next one takes the new pace.

```bash
curl -X PUT https://sandbox.api.zippygo.example/v1/sandbox/pace \
  -H "X-Api-Key: $ZIPPYGO_SANDBOX_KEY" -H "Content-Type: application/json" \
  -d '{"accept_after_seconds": 5, "assign_after_seconds": 5,
       "collect_after_seconds": 10, "deliver_after_seconds": 10, "by_hand": false}'
```

To move a delivery at once, step it (`POST /v1/sandbox/deliveries/{delivery_id}/step`) to
`assigned`, `collected` or `delivered`, or leave `to` out for its next state. The states between
are passed in order, each with its event and its webhook. Stepping to a state the delivery is
at or past answers `409 delivery_step_passed`.

## Test instruments

The sandbox pays only through the simulated provider. These instruments answer the same way
every time, with the same codes and words the real gateway's adapter gives:

| Instrument | What it does |
| --- | --- |
| UPI ID `success@zgsandbox` | Paid within two seconds. |
| UPI ID `failure@zgsandbox` | Fails at once: `failed`, “The payment could not be completed; nothing was taken.” |
| UPI ID `timeout@zgsandbox` | Never answered; expires at the end of the payment's window: `expired`. |
| Card `4242 4242 4242 4242` | Succeeds, and can be held. |
| Card `4000 0000 0000 0002` | Declined by the bank: `declined`, “Your bank declined the payment.” |
| Card `4000 0000 0000 0077` | Charged at once; cannot be held. |

Any future expiry and any CVV will do for a card. The sandbox's customers sign in with the fixed
one-time code **123456**.

## Webhooks

Register an endpoint for the sandbox under **Developer › Webhooks**. On your own machine, the
receiver in this repository prints each delivery and checks its signature:

```bash
pnpm webhook:receive whsec_your_endpoints_secret
# Listening for ZippyGo webhooks on http://localhost:4400/
```

Register `http://localhost:4400/` as the endpoint (`localhost` is the one address allowed
without HTTPS), place an order with a sandbox key, and watch each change arrive, signed.

## Trying it in the reference

The [API reference](/reference) sends requests to the sandbox with your own sandbox key. Paste
the key under **Authentication** (`ApiKey`): it is kept in this browser's storage and sent to
the sandbox only, never to this site. On a developer's machine the sandbox is the local stack
(`http://localhost:8080`), whose `ALLOWED_ORIGINS` must name the portal's address.
