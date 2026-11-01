# Limits

Each key, token and address has its own limit of requests a minute. Every answer says where the
caller stands:

| Header | Meaning |
| --- | --- |
| `RateLimit-Limit` | The requests allowed in the window. |
| `RateLimit-Remaining` | The requests left in it. |
| `RateLimit-Reset` | Seconds until the window starts again. |

A request over the limit answers `429` with `Retry-After`, in seconds; wait that long and try
again.

| Caller | Requests a minute |
| --- | --- |
| A production key | 300 (1,200 on the Pro plan) |
| A sandbox key | 120 |
| Search, for any caller | 60 |
| A signed-in person | per token |
| A background job | per service token |

The limits are provisional and may be raised for a Partner on request. Other limits that hold
everywhere: at most 20 keys per environment and 10 webhook endpoints per environment for each
Partner; lists page with `limit` (at most 100) and `cursor`.
