# Live streams

Three endpoints push changes to the client as they happen, instead of being
polled. They use
[server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html):
a long-lived HTTP response with the media type `text/event-stream` in which
the server writes one frame per change. All are tagged *Live* in the
[API reference](/reference) and accept the same credentials as the rest of
the API; the public channels of `GET /v1/live/stream` need none.

| Endpoint              | What it streams                                                              |
| --------------------- | ---------------------------------------------------------------------------- |
| `GET /v1/live/stream` | The channels an app names: signals that something changed, agent positions and statuses, and the frames that open and close the stream |
| `GET /v1/live/agents` | Agent positions and statuses, for every partner or for one (`partner_id`)    |
| `GET /v1/live/events` | Every event the platform publishes, as it is published                       |

`GET /v1/live/config` says whether live updates are available in an
environment and how a client should behave (heartbeat, stale threshold,
backoff, connections per session); a client reads it before opening a
stream and re-reads its boards instead when `live_updates` is `false`.

## Frames

A frame is an `event:` line naming the event type, a `data:` line carrying
JSON (empty for heartbeats) and a blank line:

```
event: position
data: {"agent_id":"0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a10","position":{"lat":12.972,"lng":77.595,"heading_deg":270.5,"speed_mps":4.2,"recorded_at":"2026-10-14T08:00:05Z"},"status":"online"}

event: heartbeat
data:

```

Frames carry no `id` field. The shapes of the data are schemas in the
reference (`AgentSnapshot`, `AgentPositionUpdate`, `AgentStatusUpdate` and
`Event`), so the generated SDKs have types for them. Clients must ignore
event types and fields they do not know; adding them is not a breaking
change.

## The stream: `GET /v1/live/stream`

One connection per app, naming every channel its screens listen to:
`?channels=broadcast,private-location-<id>-orders`. Channels are a closed
vocabulary; a name no channel produces is `400` (`channel_unknown`) with
`errors` pointing at its position. Private channels are authorised when the
stream opens, against the caller's own facts: an open naming a channel the
caller may not hear is refused as a whole (`401`, `403` or `404`, `errors`
by position), so the client drops it and opens again. Anonymous clients
hear the public channels (`broadcast`, `store-<location_id>-menu`).

| Channel                                   | Who hears it                                   |
| ----------------------------------------- | ---------------------------------------------- |
| `broadcast`                               | Anyone                                         |
| `store-{location_id}-menu`                | Anyone                                         |
| `private-broadcast`                       | Any signed-in person                           |
| `private-customer-{customer_id}-orders`   | That customer                                  |
| `private-order-{order_id}`                | The customer who placed it                     |
| `private-location-{location_id}-orders`, `-notices`, `-catalog`, `-kitchen`, `-tables` | Members of the location's partner |
| `private-partner-{partner_id}-agents`     | Members of the partner                         |
| `private-agents`, `private-orders`        | Platform staff (the network)                   |
| `private-agent-{agent_id}-tasks`          | That agent                                     |

| Event            | Data                                                        | When                                              |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `snapshot`       | `AgentsSnapshot`: `{ "channel", "agents": [Agent, ...] }`    | On open, per agent channel                        |
| `resync`         | `Resync`: `{ "channel" }`                                    | On open, per other channel; after a fan-out outage |
| `signal`         | `Signal`: `{ "channel", "kind", "subject", "status", "version" }` | Something changed; refetch it                |
| `agent.position` | `AgentPositionFrame`                                        | An agent moved                                    |
| `agent.status`   | `AgentStatusFrame`                                          | An agent went online or offline                   |
| `heartbeat`      | empty                                                       | Every 15 seconds                                  |
| `close`          | `Close`: `{ "reason": "token_expired" \| "revoked" \| "replaced" }` | The platform ends the stream; reconnect or sign in |

A signal says what changed and at which version, never the state: refetch
on a signal, unless you already hold that version or a newer one. Send
`client_id` so a connection reopened with a new channel set replaces the
old one at once; a session holds at most four connections, the oldest
closing with `replaced`. The stream lives no longer than the access token:
at expiry it closes with `token_expired`, and the client reconnects with
its refreshed token. A revoked session or a removed membership closes the
stream with `revoked` within a minute.

## Agents: `GET /v1/live/agents`

| Event       | Data                                                            | When                            |
| ----------- | --------------------------------------------------------------- | ------------------------------- |
| `snapshot`  | `AgentSnapshot`: `{ "agents": [Agent, ...] }`                    | Once, when the stream opens     |
| `position`  | `AgentPositionUpdate`: `{ "agent_id", "position", "status" }`   | An agent's position changed     |
| `status`    | `AgentStatusUpdate`: `{ "agent_id", "status", "last_seen_at" }` | An agent went online or offline |
| `heartbeat` | empty                                                           | Every 15 seconds                |

The `snapshot` holds every agent that matches the filters at the moment the
stream opens, with the same shape as `GET /v1/fleet/agents`; apply the
`position` and `status` frames that follow to it.

## Events: `GET /v1/live/events`

| Event       | Data                       | When                   |
| ----------- | -------------------------- | ---------------------- |
| `event`     | `Event`: an event envelope | An event was published |
| `heartbeat` | empty                      | Every 15 seconds       |

The `Event` data is the envelope described under [Events](/events), the
same shape as the items of `GET /v1/events`.

## Heartbeats and reconnecting

- A `heartbeat` frame arrives every 15 seconds. Treat 45 seconds without
  any frame (three missed heartbeats) as a lost connection and reconnect.
- Missed frames are not replayed: frames carry no `id` and the
  `Last-Event-ID` request header is ignored. After a reconnect, the agent
  stream sends a fresh `snapshot` to start from; for the event stream,
  fetch what was missed with `GET /v1/events?after=<id>`, where `<id>` is
  the newest event id received before the connection was lost.
- Reconnect with exponential backoff and jitter, as for any other request
  that failed, and stop after a `4xx` response other than `429`: the
  request itself is wrong.
- The response never ends on its own, so use a client that streams:
  `curl -N`, `fetch` with a readable stream, or the SDK.

## Examples

With curl, `-N` disables output buffering so frames appear as they arrive:

```sh
curl -N -H "X-Api-Key: $ZIPPYGO_API_KEY" \
  "https://sandbox.api.zippygo.example/v1/live/agents?partner_id=0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a02"
```

With the TypeScript SDK, `streamAgents` and `streamEvents` resolve to
`{ stream }`, an async generator that reconnects with backoff on its own. A
frame's event name is only visible in the `onSseEvent` callback, so handle
frames there. The contract models the stream body as a string, so `data` is
typed as `string` although the client has already parsed the JSON: cast it
through `unknown` to the frame's schema.

```ts
import {
  client,
  streamAgents,
  type AgentPositionUpdate,
  type AgentSnapshot,
  type AgentStatusUpdate,
} from '@zippy-go/api';

client.setConfig({
  baseUrl: 'https://sandbox.api.zippygo.example',
  headers: { 'X-Api-Key': process.env.ZIPPYGO_API_KEY },
});

const { stream } = await streamAgents({
  query: { partner_id: '0192b6f4-9b0a-7cde-8f3a-6d2c1e4b9a02' },
  onSseEvent: ({ event, data }) => {
    switch (event) {
      case 'snapshot': {
        const { agents } = data as unknown as AgentSnapshot;
        // replace the local state with `agents`
        break;
      }
      case 'position': {
        const update = data as unknown as AgentPositionUpdate;
        // move agent `update.agent_id` to `update.position`
        break;
      }
      case 'status': {
        const update = data as unknown as AgentStatusUpdate;
        // mark agent `update.agent_id` as `update.status`
        break;
      }
    }
  },
});
for await (const _frame of stream) {
  // keeps the connection open; `onSseEvent` above sees every frame with its event name
}
```

After a reconnect the server sends a fresh `snapshot`, which the same
`snapshot` case applies.
