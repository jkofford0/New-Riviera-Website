/* ===========================================================
   Riviera Shop — checkout configuration
   -----------------------------------------------------------
   mode: 'demo'   → cart works, checkout shows a notice (no payment)
         'square' → checkout POSTs the cart to checkoutEndpoint, which
                    creates a Square payment link and returns { url }.
                    See server/README.md.

   Never put a Square access token in this file — it's public.
   =========================================================== */
window.RIVIERA_SHOP_CONFIG = {
  mode: 'demo',
  checkoutEndpoint: '/api/checkout',
  currency: 'USD',
  freeShippingThreshold: 7500, // cents. Keep in sync with FREE_SHIPPING_THRESHOLD on the server
  flatShipping: 800            // cents
};
