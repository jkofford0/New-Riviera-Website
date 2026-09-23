/* ===========================================================
   Riviera Shop — catalog, cart & checkout
   Depends on js/shop-config.js and js/products.js
   =========================================================== */
document.addEventListener('DOMContentLoaded', function () {

  var config = window.RIVIERA_SHOP_CONFIG || {};
  var catalog = window.RIVIERA_CATALOG;
  var root = document.getElementById('shop-catalog');
  if (!catalog || !root) return;

  var CART_KEY = 'riviera-cart-v1';
  var currency = config.currency || 'USD';
  var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency });

  /* ---------- Lookups ---------- */
  var productById = {};
  var variationById = {};
  catalog.products.forEach(function (p) {
    productById[p.id] = p;
    p.variations.forEach(function (v) {
      variationById[v.id] = { product: p, variation: v };
    });
  });
  var categoryById = {};
  catalog.categories.forEach(function (c) { categoryById[c.id] = c; });

  var state = {
    filter: 'all',
    sort: 'featured',
    selected: {} // productId -> variationId
  };

  function money(cents) { return formatter.format(cents / 100); }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function selectedVariation(p) {
    var id = state.selected[p.id];
    var found = id && p.variations.filter(function (v) { return v.id === id; })[0];
    return found || p.variations[0];
  }

  function minPrice(p) {
    return Math.min.apply(null, p.variations.map(function (v) { return v.price; }));
  }

  /* ---------- Catalog rendering ---------- */
  var filtersEl = document.querySelector('.shop-filters');
  catalog.categories.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'shop-filter';
    b.setAttribute('data-filter', c.id);
    b.textContent = c.name;
    filtersEl.appendChild(b);
  });

  filtersEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.shop-filter');
    if (!btn) return;
    filtersEl.querySelectorAll('.shop-filter').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    state.filter = btn.getAttribute('data-filter');
    renderCatalog();
  });

  document.getElementById('shop-sort').addEventListener('change', function (e) {
    state.sort = e.target.value;
    renderCatalog();
  });

  function variationControl(p, context) {
    var current = selectedVariation(p);
    if (p.variations.length === 1) {
      return '<span class="variant-single">' + esc(current.name) + '</span>';
    }
    var id = 'var-' + context + '-' + p.id;
    return '<label class="sr-only" for="' + id + '">Option for ' + esc(p.name) + '</label>' +
      '<select class="variant-select" id="' + id + '" data-variant-for="' + p.id + '">' +
      p.variations.map(function (v) {
        return '<option value="' + v.id + '"' + (v.id === current.id ? ' selected' : '') + '>' +
          esc(v.name) + ' · ' + money(v.price) + '</option>';
      }).join('') +
      '</select>';
  }

  function cardHTML(p) {
    var v = selectedVariation(p);
    return '' +
      '<article class="product-card" data-product="' + p.id + '">' +
        '<button type="button" class="product-media" data-qv="' + p.id + '" aria-label="Quick view: ' + esc(p.name) + '">' +
          '<img src="' + esc(p.image) + '" alt="' + esc(p.brand + ' ' + p.name) + '" loading="lazy" width="800" height="800">' +
          (p.badge ? '<span class="product-badge">' + esc(p.badge) + '</span>' : '') +
          (p.rx ? '<span class="rx-badge" title="Prescription required">Rx</span>' : '') +
          '<span class="qv-hint">Quick view</span>' +
        '</button>' +
        '<div class="product-body">' +
          '<span class="product-brand">' + esc(p.brand) + '</span>' +
          '<h3 class="product-name"><button type="button" data-qv="' + p.id + '">' + esc(p.name) + '</button></h3>' +
          '<p class="product-tagline">' + esc(p.tagline) + '</p>' +
          '<div class="product-options">' + variationControl(p, 'card') + '</div>' +
          '<div class="product-buy">' +
            '<span class="product-price" data-price-for="' + p.id + '">' + money(v.price) + '</span>' +
            '<button type="button" class="btn btn-primary btn-sm" data-add="' + p.id + '">Add to Cart</button>' +
          '</div>' +
          (p.rx ? '<p class="rx-note">Prescription · online consult required</p>' : '') +
        '</div>' +
      '</article>';
  }

  function sortProducts(list) {
    if (state.sort === 'price-asc') return list.slice().sort(function (a, b) { return minPrice(a) - minPrice(b); });
    if (state.sort === 'price-desc') return list.slice().sort(function (a, b) { return minPrice(b) - minPrice(a); });
    return list;
  }

  function renderCatalog() {
    var visible = catalog.products.filter(function (p) {
      return state.filter === 'all' || p.category === state.filter;
    });

    // Price sorting across everything reads best as one flat grid
    if (state.sort !== 'featured') {
      root.innerHTML = '<div class="product-grid">' + sortProducts(visible).map(cardHTML).join('') + '</div>';
      return;
    }

    root.innerHTML = catalog.categories.map(function (c) {
      var items = visible.filter(function (p) { return p.category === c.id; });
      if (!items.length) return '';
      return '' +
        '<div class="shop-group" id="cat-' + c.id + '">' +
          '<div class="shop-group-head">' +
            '<div>' +
              '<h2>' + esc(c.title) + '</h2>' +
              '<p>' + esc(c.blurb) + '</p>' +
            '</div>' +
            (c.rxNote ? '<span class="group-tag">Physician-prescribed</span>' : '') +
          '</div>' +
          '<div class="product-grid">' + items.map(cardHTML).join('') + '</div>' +
          (c.disclaimer ? '<p class="group-disclaimer">' + esc(c.disclaimer) + '</p>' : '') +
        '</div>';
    }).join('');
  }

  /* ---------- Variation changes (cards + quick view) ---------- */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest('[data-variant-for]');
    if (!sel) return;
    var pid = sel.getAttribute('data-variant-for');
    state.selected[pid] = sel.value;
    var v = selectedVariation(productById[pid]);
    document.querySelectorAll('[data-price-for="' + pid + '"]').forEach(function (el) {
      el.textContent = money(v.price);
    });
    document.querySelectorAll('[data-variant-for="' + pid + '"]').forEach(function (el) {
      if (el !== sel) el.value = sel.value;
    });
  });

  /* ---------- Cart state ---------- */
  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function (l) { return variationById[l.v] && l.q > 0; }) : [];
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (err) { /* private mode */ }
  }

  var cart = loadCart();

  function addToCart(variationId, qty) {
    var line = cart.filter(function (l) { return l.v === variationId; })[0];
    if (line) line.q = Math.min(line.q + qty, 20);
    else cart.push({ v: variationId, q: qty });
    saveCart();
    renderCart();
  }

  function setQty(variationId, qty) {
    cart = cart
      .map(function (l) { return l.v === variationId ? { v: l.v, q: Math.min(qty, 20) } : l; })
      .filter(function (l) { return l.q > 0; });
    saveCart();
    renderCart();
  }

  function cartTotals() {
    var subtotal = 0, count = 0, hasRx = false;
    cart.forEach(function (l) {
      var entry = variationById[l.v];
      subtotal += entry.variation.price * l.q;
      count += l.q;
      if (entry.product.rx) hasRx = true;
    });
    return { subtotal: subtotal, count: count, hasRx: hasRx };
  }

  /* ---------- Cart rendering ---------- */
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.querySelector('.drawer-overlay');
  var itemsEl = document.getElementById('cart-items');
  var footEl = document.getElementById('cart-foot');
  var messageEl = document.getElementById('cart-message');
  var rxAck = document.getElementById('rx-ack');
  var rxCheck = document.getElementById('rx-ack-check');
  var checkoutBtn = document.getElementById('checkout-btn');

  function renderCart() {
    var t = cartTotals();

    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = t.count;
      el.hidden = t.count === 0;
    });

    if (!cart.length) {
      itemsEl.innerHTML = '' +
        '<div class="cart-empty">' +
          '<p>Your cart is empty.</p>' +
          '<button type="button" class="btn btn-outline" data-cart-close>Continue Shopping</button>' +
        '</div>';
      footEl.hidden = true;
      return;
    }
    footEl.hidden = false;

    itemsEl.innerHTML = cart.map(function (l) {
      var e = variationById[l.v], p = e.product, v = e.variation;
      return '' +
        '<div class="cart-line">' +
          '<img src="' + esc(p.image) + '" alt="" width="72" height="72">' +
          '<div class="cart-line-info">' +
            '<span class="product-brand">' + esc(p.brand) + (p.rx ? ' · Rx' : '') + '</span>' +
            '<strong>' + esc(p.name) + '</strong>' +
            '<span class="cart-line-var">' + esc(v.name) + '</span>' +
            '<div class="qty">' +
              '<button type="button" data-qty="' + v.id + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
              '<span>' + l.q + '</span>' +
              '<button type="button" data-qty="' + v.id + '" data-delta="1" aria-label="Increase quantity">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-line-end">' +
            '<strong>' + money(v.price * l.q) + '</strong>' +
            '<button type="button" class="link-btn" data-remove="' + v.id + '">Remove</button>' +
          '</div>' +
        '</div>';
    }).join('');

    document.getElementById('cart-subtotal').textContent = money(t.subtotal);

    var threshold = config.freeShippingThreshold;
    var ship = document.getElementById('ship-progress');
    if (threshold) {
      var pct = Math.min(100, Math.round(t.subtotal / threshold * 100));
      ship.innerHTML = (t.subtotal >= threshold
        ? '<span>You\'ve unlocked <strong>free shipping</strong>.</span>'
        : '<span>Add <strong>' + money(threshold - t.subtotal) + '</strong> for free shipping.</span>') +
        '<div class="ship-bar"><span style="width:' + pct + '%"></span></div>';
    }

    rxAck.hidden = !t.hasRx;
    if (!t.hasRx) rxCheck.checked = false;
    hideMessage();
  }

  function showMessage(html, kind) {
    messageEl.innerHTML = html;
    messageEl.className = 'cart-message' + (kind ? ' cart-message--' + kind : '');
    messageEl.hidden = false;
  }
  function hideMessage() { messageEl.hidden = true; }

  /* ---------- Drawer open / close ---------- */
  var lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.cart-head .icon-btn').focus();
  }

  function closeCart() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- Quick view ---------- */
  var qv = document.getElementById('quick-view');
  var qvContent = document.getElementById('qv-content');

  function openQuickView(pid) {
    var p = productById[pid];
    var v = selectedVariation(p);
    var cat = categoryById[p.category];
    qvContent.innerHTML = '' +
      '<div class="qv-media"><img src="' + esc(p.image) + '" alt="' + esc(p.brand + ' ' + p.name) + '">' +
        (p.rx ? '<span class="rx-badge">Rx</span>' : '') + '</div>' +
      '<div class="qv-info">' +
        '<span class="product-brand">' + esc(p.brand) + ' · ' + esc(cat ? cat.name : '') + '</span>' +
        '<h2 id="qv-title">' + esc(p.name) + '</h2>' +
        '<span class="qv-price" data-price-for="' + p.id + '">' + money(v.price) + '</span>' +
        '<p>' + esc(p.description) + '</p>' +
        '<ul class="qv-highlights">' + p.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
        '<div class="product-options">' + variationControl(p, 'qv') + '</div>' +
        (p.rx ? '<div class="qv-rx"><strong>Prescription required.</strong> After checkout you\'ll complete a short medical intake. Dr. Jenkins reviews every order before anything is dispensed.</div>' : '') +
        '<button type="button" class="btn btn-primary btn-block" data-add="' + p.id + '">Add to Cart</button>' +
      '</div>';
    qv.hidden = false;
    document.body.style.overflow = 'hidden';
    qv.querySelector('.qv-close').focus();
  }

  function closeQuickView() {
    qv.hidden = true;
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
  }

  qv.addEventListener('click', function (e) {
    if (e.target === qv || e.target.closest('[data-qv-close]')) closeQuickView();
  });

  /* ---------- Toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(p, v) {
    toast.innerHTML = '<img src="' + esc(p.image) + '" alt="" width="44" height="44">' +
      '<div><strong>Added to cart</strong><span>' + esc(p.name) + ' · ' + esc(v.name) + '</span></div>' +
      '<button type="button" class="btn btn-sm btn-primary" data-cart-open>View Cart</button>';
    toast.hidden = false;
    requestAnimationFrame(function () { toast.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.hidden = true; }, 250);
    }, 3500);
  }

  /* ---------- Global click handling ---------- */
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-add]'))) {
      var p = productById[t.getAttribute('data-add')];
      var v = selectedVariation(p);
      addToCart(v.id, 1);
      if (!qv.hidden) closeQuickView();
      showToast(p, v);
      return;
    }
    if ((t = e.target.closest('[data-qv]'))) { openQuickView(t.getAttribute('data-qv')); return; }
    if (e.target.closest('[data-cart-open]')) {
      toast.classList.remove('show');
      toast.hidden = true;
      openCart();
      return;
    }
    if (e.target.closest('[data-cart-close]')) { closeCart(); return; }
    if ((t = e.target.closest('[data-qty]'))) {
      var id = t.getAttribute('data-qty');
      var line = cart.filter(function (l) { return l.v === id; })[0];
      if (line) setQty(id, line.q + parseInt(t.getAttribute('data-delta'), 10));
      return;
    }
    if ((t = e.target.closest('[data-remove]'))) { setQty(t.getAttribute('data-remove'), 0); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!qv.hidden) closeQuickView();
    else if (drawer.classList.contains('open')) closeCart();
  });

  /* ---------- Checkout ---------- */
  checkoutBtn.addEventListener('click', function () {
    var t = cartTotals();
    if (!cart.length) return;

    if (t.hasRx && !rxCheck.checked) {
      showMessage('Please confirm you understand prescription items require a provider consultation.', 'warn');
      rxCheck.focus();
      return;
    }

    if (config.mode !== 'square') {
      showMessage('<strong>Demo store:</strong> online payments go live once the shop is connected to Square. ' +
        'To order today, call <a href="tel:+19493703177">(949) 370-3177</a>.', 'info');
      return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Redirecting to secure checkout…';
    hideMessage();

    fetch(config.checkoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(function (l) { return { variationId: l.v, quantity: l.q }; }),
        rxAcknowledged: t.hasRx ? rxCheck.checked : false
      })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || !body.url) throw new Error(body.error || 'Checkout is unavailable right now.');
          return body;
        });
      })
      .then(function (body) { window.location.assign(body.url); })
      .catch(function (err) {
        showMessage(esc(err.message) + ' Please try again or call <a href="tel:+19493703177">(949) 370-3177</a>.', 'warn');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Secure Checkout';
      });
  });

  /* ---------- Return from Square checkout ---------- */
  var params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'success') {
    cart = [];
    saveCart();
    document.getElementById('checkout-banner').hidden = false;
    if (window.history.replaceState) window.history.replaceState(null, '', window.location.pathname);
  }

  renderCatalog();
  renderCart();
});
