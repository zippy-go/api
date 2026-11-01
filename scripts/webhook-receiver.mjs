#!/usr/bin/env node
// A webhook endpoint for trying ZippyGo's webhooks on your own machine: it listens on
// http://localhost:4400, checks each delivery's signature with the endpoint's secret and prints
// the delivery. Register `http://localhost:4400/` as an endpoint of your Partner's sandbox
// (HTTPS is required elsewhere; `localhost` is allowed on a developer's machine), then:
//
//   node scripts/webhook-receiver.mjs whsec_...        (or ZIPPYGO_WEBHOOK_SECRET=whsec_...)
//
// The signature is `ZippyGo-Signature: t=<unix seconds>,v1=<hex>`: the HMAC-SHA256, keyed with
// the secret, of `<t>.<raw body>`. While a secret is being rotated, a delivery carries a `v1`
// for each secret; one matching is enough. Deliveries older than five minutes are refused, as
// a replay. The receiver answers 204 to a good delivery and 400 to a bad one.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const secret = process.argv[2] ?? process.env.ZIPPYGO_WEBHOOK_SECRET;
const port = Number(process.env.PORT ?? 4400);
const tolerance = 5 * 60;

if (!secret) {
  console.error('Give the endpoint\'s secret: node scripts/webhook-receiver.mjs whsec_...');
  process.exit(1);
}

// Whether `header` signs `body` with the secret, within the tolerance.
export function verify(header, body, key = secret, now = Math.floor(Date.now() / 1000)) {
  const parts = String(header ?? '')
    .split(',')
    .map((part) => part.trim().split('='))
    .filter((pair) => pair.length === 2);
  const t = Number(parts.find(([name]) => name === 't')?.[1]);
  if (!Number.isFinite(t) || Math.abs(now - t) > tolerance) return false;
  const expected = createHmac('sha256', key).update(`${t}.${body}`).digest();
  return parts
    .filter(([name]) => name === 'v1')
    .some(([, hex]) => {
      const given = Buffer.from(hex, 'hex');
      return given.length === expected.length && timingSafeEqual(given, expected);
    });
}

const server = createServer((request, response) => {
  const chunks = [];
  request.on('data', (chunk) => chunks.push(chunk));
  request.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    const signature = request.headers['zippygo-signature'];
    if (!verify(signature, body)) {
      console.log(`✗ ${new Date().toISOString()} refused: the signature does not match`);
      response.writeHead(400).end();
      return;
    }
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      event = body;
    }
    console.log(`✓ ${new Date().toISOString()} ${event?.type ?? 'delivery'} v${event?.version ?? '?'}`);
    console.log(JSON.stringify(event, null, 2));
    response.writeHead(204).end();
  });
});

server.listen(port, 'localhost', () => {
  console.log(`Listening for ZippyGo webhooks on http://localhost:${port}/`);
});
