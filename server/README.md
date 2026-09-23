# Connecting the Shop to Square

The shop (`shop.html`) runs in **demo mode** by default: the cart works, but checkout only shows a notice. To take real payments, the site uses Square's **Checkout API (payment links)**. A small server creates a secure Square-hosted checkout page from the cart, and the customer is redirected there to pay.

```
shop.html ──POST /api/checkout──▶ server/server.js ──▶ Square Checkout API
    ▲                                   │ (validates cart, prices from products.js
    └──── redirect back ◀── Square ◀────┘  or your Square catalog)
          shop.html?checkout=success
```

Your Square access token lives only on the server. Never put it in `js/`.

## Files

| File | Purpose |
| --- | --- |
| `js/products.js` | Product catalog (demo data). Shared by the page and the server. |
| `js/shop-config.js` | `mode: 'demo'` or `'square'`, the checkout endpoint and the shipping threshold. |
| `js/shop.js` | Catalog rendering, cart (saved in the browser), quick view and checkout call. |
| `server/server.js` | `/api/checkout` plus a static file server for local testing. Node 18+, no dependencies. |

## 1. Get Square credentials

1. Create an application at https://developer.squareup.com/apps.
2. On the **Credentials** tab, copy the **Sandbox access token**.
3. On the **Locations** tab, copy the **Sandbox location ID**.

## 2. Run locally with Square Sandbox

Install Node.js 18 or newer from https://nodejs.org. Then, from the `New-Riviera-Website` folder in PowerShell:

```powershell
$env:SQUARE_ACCESS_TOKEN = "EAAA..."      # sandbox token
$env:SQUARE_LOCATION_ID  = "L..."
$env:SQUARE_ENVIRONMENT  = "sandbox"
$env:SITE_URL            = "http://localhost:3000"
node server/server.js
```

Set `mode: 'square'` in `js/shop-config.js`, then open http://localhost:3000/shop.html. Pay with Square's sandbox test card: `4111 1111 1111 1111`, any future expiry date, any CVV and ZIP.

## 3. Link products to your Square catalog (recommended)

Until they're linked, each order line is created "ad hoc" using the price in `js/products.js`, so checkout works on day one.

To have Square manage prices, tax and inventory, create each item in your Square Dashboard (**Items & services**). Then copy each variation's ID into `squareVariationId` in `js/products.js`:

```js
{ id: 'elta-uv-clear-untinted', name: 'Untinted', price: 4500, squareVariationId: 'ABCD1234EFGH...' }
```

After that, Square charges the catalog price for linked items.

## 4. Go live

1. Switch to your **Production** access token and location ID, and set `SQUARE_ENVIRONMENT=production`.
2. Set `SITE_URL` to the real domain, e.g. `https://rivieralaserstudios.com`.
3. Host the server:
   - **Whole site on a Node host** (Render, Railway, a VPS): run `node server/server.js`, which serves the site and the API.
   - **Static host + serverless** (Netlify, Vercel): keep the site static and wrap `handleCheckout` from `server/server.js` in a function at `/api/checkout`.
   - **API on a different domain**: set `checkoutEndpoint` in `js/shop-config.js` to the full URL, and set `ALLOWED_ORIGIN` on the server to the site's origin.

## Prescription products

- Items with `rx: true` show an Rx badge. The customer must check an acknowledgment box before checkout, and the server enforces this too.
- Rx lines carry the note `Rx: pending provider approval`, and the Square order gets `contains_rx=true` metadata. Staff can filter these orders and send the intake form.
- **Before launch, confirm with Square that your account may process payments for prescription medications and compounded GLP-1s.** Payment processors often restrict these categories, and some require approval or a specialized processor. Also confirm the pharmacy and fulfillment setup, and state licensing, with your compliance advisor.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `SQUARE_ACCESS_TOKEN` | yes | Sandbox or production token. Keep it secret. |
| `SQUARE_LOCATION_ID` | yes | The location that receives the orders. |
| `SQUARE_ENVIRONMENT` | no | `sandbox` (default) or `production`. |
| `SITE_URL` | no | Used for the post-payment redirect. Default `http://localhost:3000`. |
| `SQUARE_VERSION` | no | Pins the Square API version, e.g. `2025-01-23`. |
| `ALLOWED_ORIGIN` | no | Enables CORS when the site and API are on different domains. |
| `PORT` | no | Default `3000`. |
