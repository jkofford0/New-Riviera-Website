document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  /* ---------- Active nav link ---------- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Gallery filter ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.ba-card');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category');
          var show = filter === 'all' || cat === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  if (lightbox && cards.length) {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var visibleCards = function () {
      return Array.prototype.filter.call(cards, function (c) {
        return c.style.display !== 'none';
      });
    };
    var currentIndex = 0;

    function openLightbox(card) {
      var list = visibleCards();
      currentIndex = list.indexOf(card);
      renderLightbox(list);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function renderLightbox(list) {
      var card = list[currentIndex];
      var img = card.querySelector('img');
      lbImg.src = img.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = card.getAttribute('data-caption') || '';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function step(dir) {
      var list = visibleCards();
      currentIndex = (currentIndex + dir + list.length) % list.length;
      renderLightbox(list);
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () { openLightbox(card); });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { step(-1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Contact form (front-end only placeholder) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('form-success').classList.add('show');
      form.reset();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }
});
