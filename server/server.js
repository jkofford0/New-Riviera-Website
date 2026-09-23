/* ===========================================================
   Riviera Shop — Square checkout server (Node 18+, no dependencies)
   -----------------------------------------------------------
   POST /api/checkout  { items: [{ variationId, quantity }], rxAcknowledged }
     → validates the cart against js/products.js (never trusts browser prices)
     → creates a Square payment link (Checkout API)
     → responds { url } for the browser to redirect to

   Everything else is served as static files from the site root, so
   `node server/server.js` runs the whole site locally.
   See server/README.md for setup.
   =========================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const catalog = require('../js/products.js');

const {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID,
  SQUARE_ENVIRONMENT = 'sandbox',
  SQUARE_VERSION,            // optional, e.g. "2025-01-23"; defaults to your app's API version
  SITE_URL = 'http://localhost:3000',
  ALLOWED_ORIGIN,            // set if the site is hosted on a different domain than this server
  PORT = 3000
} = process.env;

const SQUARE_BASE_URL = SQUARE_ENVIRONMENT === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

const CURRENCY = 'USD';
const FREE_SHIPPING_THRESHOLD = 7500; // cents, keep in sync with js/shop-config.js
const FLAT_SHIPPING = 800;            // cents
const MAX_QTY = 20;
const SITE_ROOT = path.resolve(__dirname, '..');

const variations = new Map();
for (const product of catalog.products) {
  for (const variation of product.variations) variations.set(variation.id, { product, variation });
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

/* ---------- Cart → Square order ---------- */
function buildOrder(items, rxAcknowledged) {
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty.');

  let subtotal = 0;
  let hasRx = false;

  const lineItems = items.map(({ variationId, quantity }) => {
    const entry = variations.get(variationId);
    const qty = Number.parseInt(quantity, 10);
    if (!entry || !(qty >= 1 && qty <= MAX_QTY)) throw httpError(400, 'Your cart contains an invalid item.');

    const { product, variation } = entry;
    subtotal += variation.price * qty;
    if (product.rx) hasRx = true;
    const note = product.rx ? 'Rx: pending provider approval' : undefined;

    if (variation.squareVariationId) {
      // Linked to the Square catalog: Square uses its own price, tax and inventory
      return { catalog_object_id: variation.squareVariationId, quantity: String(qty), note };
    }
    // Not linked yet: ad-hoc line item priced from js/products.js
    return {
      name: `${product.name} (${variation.name})`,
      quantity: String(qty),
      base_price_money: { amount: variation.price, currency: CURRENCY },
      note
    };
  });

  if (hasRx && rxAcknowledged !== true) {
    throw httpError(400, 'Please confirm the prescription consultation requirement.');
  }
  return { lineItems, subtotal, hasRx };
}

async function createPaymentLink({ lineItems, subtotal, hasRx }) {
  const checkoutOptions = {
    redirect_url: `${SITE_URL}/shop.html?checkout=success`,
    ask_for_shipping_address: true
  };
  if (subtotal < FREE_SHIPPING_THRESHOLD) {
    checkoutOptions.shipping_fee = {
      name: 'Standard shipping',
      charge: { amount: FLAT_SHIPPING, currency: CURRENCY }
    };
  }

  const headers = {
    'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  if (SQUARE_VERSION) headers['Square-Version'] = SQUARE_VERSION;

  const res = await fetch(`${SQUARE_BASE_URL}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: SQUARE_LOCATION_ID,
        line_items: lineItems,
        metadata: { source: 'website-shop', contains_rx: String(hasRx) }
      },
      checkout_options: checkoutOptions,
      payment_note: hasRx ? 'Includes prescription items: complete provider intake before dispensing.' : undefined
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.payment_link) {
    console.error('Square error', res.status, JSON.stringify(data.errors || data));
    throw httpError(502, 'Checkout is unavailable right now.');
  }
  return data.payment_link.url;
}

/* ---------- HTTP plumbing ---------- */
function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > limit) {
        reject(httpError(413, 'Request too large.'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleCheckout(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
  try {
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) throw httpError(503, 'Checkout is not configured yet.');
    let payload;
    try { payload = JSON.parse(await readBody(req)); } catch (err) { throw err.status ? err : httpError(400, 'Invalid request.'); }
    const url = await createPaymentLink(buildOrder(payload.items, payload.rxAcknowledged));
    sendJson(res, 200, { url });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    sendJson(res, status, { error: status === 500 ? 'Checkout is unavailable right now.' : err.message });
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime'
};

function serveStatic(pathname, res) {
  const rel = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const file = path.join(SITE_ROOT, rel);
  const blocked = rel.split('/').some((part) => part.startsWith('.')) || rel.startsWith('/server/');
  if (!file.startsWith(SITE_ROOT + path.sep) || blocked) {
    res.writeHead(404); return res.end('Not found');
  }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/checkout') {
    if (ALLOWED_ORIGIN) {
      res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    }
    return handleCheckout(req, res);
  }
  serveStatic(pathname, res);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Riviera site running at http://localhost:${PORT}  (Square: ${SQUARE_ENVIRONMENT})`);
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      console.warn('SQUARE_ACCESS_TOKEN / SQUARE_LOCATION_ID not set: /api/checkout will return 503.');
    }
  });
}

// Reusable from a serverless function (Netlify, Vercel, etc.)
module.exports = { buildOrder, createPaymentLink, handleCheckout };
