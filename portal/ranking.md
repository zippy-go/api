# How stores are ranked

ZippyGo publishes the rules that place a store where it appears on the storefront, so every
Partner can read why its store is where it is. A Partner reads each of its stores' placements,
with the figures the rule read, at
`GET /v1/partners/{partner_id}/locations/{location_id}/listing-position`.

## open_now_then_nearest

A Vertical's stores in a zone, on the storefront's listing and in the Customer app:

1. Open stores first, then those opening later today, then those temporarily offline.
2. Within each, the nearest to the customer's pin first. A Partner's listing position reads the
   distance from the zone's centre, where no customer stands.
3. Then by name, A to Z.

A store's rating and its offers are shown on its card and do not move it: a new store and a
long-standing one stand alike. Offers place a store on a Vertical's offer shelves, which are
listings of their own, each saying the offer that put the store there.

## Sponsored placements

A placement that was paid for says "Sponsored" wherever it shows, on the storefront, in the
Customer app and in the Partner's listing position, and never moves a store within the organic
listing above.

## A Partner's own storefront

A Partner's own storefront at `/p/{path}` lists only that Partner's stores, in the same order,
with its own offers and no platform campaign; other Partners' recommendations show there only
when the Partner switches cross-sell on.

## When the rules change

A change to these rules is announced in the changelog before it takes effect, and this page
says the date it did.
