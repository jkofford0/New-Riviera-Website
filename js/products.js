/* ===========================================================
   Riviera Shop — product catalog
   -----------------------------------------------------------
   DEMO DATA: names, prices and images are placeholders.

   The shape mirrors Square's Catalog API (an ITEM with one or
   more ITEM_VARIATIONs, prices in cents). When the Square
   catalog is set up, paste each ID into squareItemId /
   squareVariationId — the checkout server will then charge the
   price stored in Square instead of the price below.

   This file is shared by the browser (window.RIVIERA_CATALOG)
   and the checkout server (require('../js/products.js')).
   =========================================================== */
(function (root) {

  var CATEGORIES = [
    {
      id: 'sunscreen',
      name: 'Sunscreen',
      title: 'EltaMD Sun Protection',
      blurb: 'Dermatologist-favorite broad-spectrum sunscreens: lightweight, oil-free and gentle on post-treatment skin.'
    },
    {
      id: 'skincare',
      name: 'Skincare',
      title: 'EltaMD Skincare',
      blurb: 'Clinical cleansers and moisturizers that support your skin barrier between treatments.'
    },
    {
      id: 'hair',
      name: 'Hair Restoration',
      title: 'Hair Restoration',
      blurb: 'Proven treatments for thinning hair, prescribed by Dr. Jenkins. Rx items need a quick online consultation before they ship.',
      rxNote: true
    },
    {
      id: 'weight-loss',
      name: 'Weight Loss',
      title: 'Medical Weight Loss (GLP-1)',
      blurb: 'Physician-supervised GLP-1 programs with medication, supplies and regular provider check-ins included.',
      rxNote: true,
      disclaimer: 'Compounded medications are not FDA-approved and have not been evaluated by the FDA for safety, effectiveness, or quality. Prescriptions are issued only after a licensed provider decides treatment is right for you.'
    }
  ];

  var PRODUCTS = [
    /* ---------- EltaMD · Sunscreen ---------- */
    {
      id: 'elta-uv-clear',
      category: 'sunscreen',
      brand: 'EltaMD',
      name: 'UV Clear Broad-Spectrum SPF 46',
      tagline: 'Oil-free daily facial sunscreen for sensitive & acne-prone skin',
      description: 'A lightweight, oil-free sunscreen with niacinamide and hyaluronic acid that calms and protects skin prone to acne, rosacea and discoloration. Our most-recommended sunscreen after laser and injectable treatments.',
      highlights: ['Transparent zinc oxide 9%', 'Niacinamide calms redness', 'Fragrance-free, non-comedogenic', '1.7 oz / 48 g'],
      image: 'assets/img/shop/elta-uv-clear-placeholder.jpg',
      badge: 'Bestseller',
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-uv-clear-untinted', name: 'Untinted', price: 4500, squareVariationId: null },
        { id: 'elta-uv-clear-tinted', name: 'Tinted', price: 4600, squareVariationId: null }
      ]
    },
    {
      id: 'elta-uv-physical',
      category: 'sunscreen',
      brand: 'EltaMD',
      name: 'UV Physical Broad-Spectrum SPF 41',
      tagline: '100% mineral, sheer-tinted and water-resistant',
      description: 'A chemical-free mineral sunscreen with a universal sheer tint. Zinc oxide and titanium dioxide make it ideal for sensitive skin and for use right after in-office procedures.',
      highlights: ['Zinc oxide 9% + titanium dioxide 7%', 'Sheer universal tint', 'Water-resistant (40 min)', '3.0 oz / 85 g'],
      image: 'assets/img/shop/elta-uv-physical-placeholder.jpg',
      badge: null,
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-uv-physical-3oz', name: '3.0 oz', price: 4200, squareVariationId: null }
      ]
    },
    {
      id: 'elta-uv-daily',
      category: 'sunscreen',
      brand: 'EltaMD',
      name: 'UV Daily Broad-Spectrum SPF 46',
      tagline: 'Moisturizing sunscreen for normal to dry skin',
      description: 'Hydrating daily protection with hyaluronic acid. It doubles as your morning moisturizer and wears well under makeup.',
      highlights: ['Hyaluronic acid hydration', 'Works as a moisturizer', 'Paraben- and fragrance-free', '1.7 oz / 48 g'],
      image: 'assets/img/shop/elta-uv-daily-placeholder.jpg',
      badge: null,
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-uv-daily-untinted', name: 'Untinted', price: 4200, squareVariationId: null },
        { id: 'elta-uv-daily-tinted', name: 'Tinted', price: 4300, squareVariationId: null }
      ]
    },
    {
      id: 'elta-uv-sport',
      category: 'sunscreen',
      brand: 'EltaMD',
      name: 'UV Sport Broad-Spectrum SPF 50',
      tagline: 'Water-resistant face & body protection',
      description: 'High-protection sunscreen for beach days, workouts and outdoor sports. Stays put through sweat and water for up to 80 minutes.',
      highlights: ['SPF 50 broad-spectrum', 'Water-resistant (80 min)', 'Face and body', '3.0 oz / 85 g'],
      image: 'assets/img/shop/elta-uv-sport-placeholder.jpg',
      badge: null,
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-uv-sport-3oz', name: '3.0 oz', price: 3200, squareVariationId: null }
      ]
    },

    /* ---------- EltaMD · Skincare ---------- */
    {
      id: 'elta-foaming-cleanser',
      category: 'skincare',
      brand: 'EltaMD',
      name: 'Foaming Facial Cleanser',
      tagline: 'Gentle, oil-free daily cleanser',
      description: 'Amino-acid cleansers and enzymes lift away oil, makeup and debris without stripping the skin. It leaves no residue, so the rest of your routine absorbs better.',
      highlights: ['Amino-acid gentle surfactants', 'pH-balanced', 'Oil- and fragrance-free', '7.0 fl oz / 207 mL'],
      image: 'assets/img/shop/elta-foaming-cleanser-placeholder.jpg',
      badge: null,
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-foaming-cleanser-7oz', name: '7.0 fl oz', price: 3600, squareVariationId: null }
      ]
    },
    {
      id: 'elta-am-therapy',
      category: 'skincare',
      brand: 'EltaMD',
      name: 'AM Therapy Facial Moisturizer',
      tagline: 'Lightweight daytime hydration',
      description: 'A light, non-greasy moisturizer with niacinamide and hyaluronic acid that hydrates and evens tone. Layers well under sunscreen.',
      highlights: ['Niacinamide + hyaluronic acid', 'Absorbs quickly', 'Non-comedogenic', '1.7 oz / 48 g'],
      image: 'assets/img/shop/elta-am-therapy-placeholder.jpg',
      badge: null,
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-am-therapy-1-7oz', name: '1.7 oz', price: 4200, squareVariationId: null }
      ]
    },
    {
      id: 'elta-pm-therapy',
      category: 'skincare',
      brand: 'EltaMD',
      name: 'PM Therapy Facial Moisturizer',
      tagline: 'Overnight barrier repair',
      description: 'A rich but breathable night moisturizer with ceramides, niacinamide and antioxidants that restores the skin barrier while you sleep.',
      highlights: ['Ceramides + niacinamide', 'Antioxidant blend', 'Great post-treatment', '1.7 oz / 48 g'],
      image: 'assets/img/shop/elta-pm-therapy-placeholder.jpg',
      badge: 'Staff Pick',
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'elta-pm-therapy-1-7oz', name: '1.7 oz', price: 4800, squareVariationId: null }
      ]
    },

    /* ---------- Riviera Rx · Hair Restoration ---------- */
    {
      id: 'rls-finasteride-tabs',
      category: 'hair',
      brand: 'Riviera Rx',
      name: 'Finasteride 1 mg Tablets',
      tagline: 'Daily pill that helps stop hair loss at the root',
      description: 'Finasteride lowers DHT, the hormone behind male-pattern hair loss. Taken once daily, it helps slow shedding and preserve existing hair. Most patients see results in 3–6 months.',
      highlights: ['One tablet daily', 'Blocks DHT production', 'Discreet delivery or local pickup', 'Provider follow-up included'],
      image: 'assets/img/shop/rls-finasteride-tabs-placeholder.jpg',
      badge: 'Most Popular',
      rx: true,
      squareItemId: null,
      variations: [
        { id: 'rls-finasteride-30', name: '30-day supply', price: 3000, squareVariationId: null },
        { id: 'rls-finasteride-90', name: '90-day supply', price: 7500, squareVariationId: null }
      ]
    },
    {
      id: 'rls-oral-minoxidil',
      category: 'hair',
      brand: 'Riviera Rx',
      name: 'Oral Minoxidil 2.5 mg Tablets',
      tagline: 'Low-dose daily pill to stimulate regrowth',
      description: 'Low-dose oral minoxidil improves blood flow to the follicles and extends the growth phase of hair. It is a convenient option for patients who find topicals hard to stick with.',
      highlights: ['Low-dose, once daily', 'No topical residue', 'Pairs well with finasteride', 'Provider follow-up included'],
      image: 'assets/img/shop/rls-oral-minoxidil-placeholder.jpg',
      badge: null,
      rx: true,
      squareItemId: null,
      variations: [
        { id: 'rls-oral-minoxidil-30', name: '30-day supply', price: 3500, squareVariationId: null },
        { id: 'rls-oral-minoxidil-90', name: '90-day supply', price: 9000, squareVariationId: null }
      ]
    },
    {
      id: 'rls-minoxidil-solution',
      category: 'hair',
      brand: 'Riviera Rx',
      name: 'Minoxidil 5% Topical Solution',
      tagline: 'Clinically proven regrowth, no prescription needed',
      description: 'The gold-standard topical for thinning hair. Apply 1 mL to the scalp twice daily with the included dropper for fuller-looking hair over time.',
      highlights: ['5% minoxidil', 'Precision dropper', 'No prescription required', '60 mL per bottle'],
      image: 'assets/img/shop/rls-minoxidil-solution-placeholder.jpg',
      badge: null,
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'rls-minoxidil-solution-1', name: '1-month (1 bottle)', price: 2500, squareVariationId: null },
        { id: 'rls-minoxidil-solution-3', name: '3-month (3 bottles)', price: 6000, squareVariationId: null }
      ]
    },
    {
      id: 'rls-topical-fin-min',
      category: 'hair',
      brand: 'Riviera Rx',
      name: 'Topical Finasteride + Minoxidil Spray',
      tagline: 'Two proven ingredients in one daily spray',
      description: 'A compounded spray that combines finasteride 0.3% and minoxidil 6%, delivering both treatments directly to the scalp. A good choice for patients who prefer to avoid oral finasteride.',
      highlights: ['Finasteride 0.3% + minoxidil 6%', 'Applied directly to the scalp', 'Fast-drying fine mist', 'Compounded by a licensed pharmacy'],
      image: 'assets/img/shop/rls-topical-fin-min-placeholder.jpg',
      badge: 'New',
      rx: true,
      squareItemId: null,
      variations: [
        { id: 'rls-topical-fin-min-30', name: '30-day supply', price: 5900, squareVariationId: null },
        { id: 'rls-topical-fin-min-90', name: '90-day supply', price: 14900, squareVariationId: null }
      ]
    },

    /* ---------- Riviera Rx · Weight Loss ---------- */
    {
      id: 'rls-weight-consult',
      category: 'weight-loss',
      brand: 'Riviera Rx',
      name: 'Medical Weight Loss Consultation',
      tagline: 'Start here: consultation and baseline labs',
      description: 'Meet with Dr. Jenkins to review your health history and goals, with a baseline lab panel. If GLP-1 treatment is a fit, the full consultation fee is credited toward your first month.',
      highlights: ['In-office or virtual visit', 'Baseline lab panel included', 'Personalized dosing plan', 'Credited toward first month'],
      image: 'assets/img/shop/rls-weight-consult-placeholder.jpg',
      badge: 'Start Here',
      rx: false,
      squareItemId: null,
      variations: [
        { id: 'rls-weight-consult-std', name: 'Consultation + labs', price: 14900, squareVariationId: null }
      ]
    },
    {
      id: 'rls-semaglutide',
      category: 'weight-loss',
      brand: 'Riviera Rx',
      name: 'Semaglutide Weight Loss Program',
      tagline: 'Once-weekly GLP-1 injection',
      description: 'Semaglutide is a once-weekly GLP-1 medication that reduces appetite and helps regulate blood sugar. Your program includes medication, injection supplies, dose adjustments and regular check-ins with our medical team.',
      highlights: ['Once-weekly injection', 'Medication + supplies included', 'Dose titration & check-ins', 'Cold-pack shipping or pickup'],
      image: 'assets/img/shop/rls-semaglutide-placeholder.jpg',
      badge: null,
      rx: true,
      squareItemId: null,
      variations: [
        { id: 'rls-semaglutide-1mo', name: '1-month program', price: 24900, squareVariationId: null },
        { id: 'rls-semaglutide-3mo', name: '3-month program', price: 67500, squareVariationId: null }
      ]
    },
    {
      id: 'rls-tirzepatide',
      category: 'weight-loss',
      brand: 'Riviera Rx',
      name: 'Tirzepatide Weight Loss Program',
      tagline: 'Once-weekly dual GLP-1 / GIP injection',
      description: 'Tirzepatide acts on two appetite-regulating hormones (GLP-1 and GIP). It is a strong option for patients with larger weight-loss goals. Medication, supplies and provider check-ins are included.',
      highlights: ['Dual GLP-1 / GIP action', 'Once-weekly injection', 'Medication + supplies included', 'Dose titration & check-ins'],
      image: 'assets/img/shop/rls-tirzepatide-placeholder.jpg',
      badge: null,
      rx: true,
      squareItemId: null,
      variations: [
        { id: 'rls-tirzepatide-1mo', name: '1-month program', price: 34900, squareVariationId: null },
        { id: 'rls-tirzepatide-3mo', name: '3-month program', price: 94500, squareVariationId: null }
      ]
    }
  ];

  var catalog = { categories: CATEGORIES, products: PRODUCTS };

  if (typeof module === 'object' && module.exports) {
    module.exports = catalog;
  } else {
    root.RIVIERA_CATALOG = catalog;
  }
})(this);
