/* Microsoft Clarity (visitor behaviour analytics) */
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "ytjbgsksvx");

/* ===========================
   MATTBED CANADA — main.js
   =========================== */

// ── Nav toggle ──────────────────────────────
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  // Close menu when a real navigation link (not dropdown toggle) is tapped
  nav.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      });
    }
  });
}

// ── City modal ──────────────────────────────
const modal = document.getElementById('city-modal');
if (modal) {
  const saved = localStorage.getItem('mc_city');
  // No automatic popup: visitors see prices and delivery info straight away.
  modal.querySelectorAll('.city-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('mc_city', btn.dataset.city);
      modal.style.display = 'none';
      if (btn.dataset.href) window.location.href = btn.dataset.href;
    });
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

// ── Scroll animations ───────────────────────
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
}

// ── Product card 3D tilt ─────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── Size button selection — handled by cart.js ──

// ── Inquire button — handled by cart.js ──────
// View Details / Add to Cart is managed in cart.js

// ── Product filter ───────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const cats = (card.dataset.cat || '').split(' ');
      card.classList.toggle('hidden', filter !== 'all' && !cats.includes(filter));
    });
  });
});

// ── FAQ accordion ────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Mobile dropdown tap-to-toggle ─────────────
document.querySelectorAll('.has-dropdown > a').forEach(link => {
  link.addEventListener('click', (e) => {
    // Only intercept on mobile (when hamburger menu is visible)
    if (window.innerWidth < 768) {
      e.preventDefault();
      const parent = link.closest('.has-dropdown');
      const isOpen = parent.classList.contains('dropdown-open');
      document.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('dropdown-open'));
      if (!isOpen) parent.classList.add('dropdown-open');
    }
  });
});

// ── Smooth scroll (skip empty/invalid hashes) ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  const href = a.getAttribute('href');
  if (!href || href === '#') return; // skip dropdown toggles and empty anchors
  a.addEventListener('click', e => {
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu after navigating to an anchor
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      }
    }
  });
});

// ── Header scroll shadow ─────────────────────
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(10,22,40,0.35)' : '0 2px 16px rgba(10,22,40,0.3)';
  }, { passive: true });
}

// ── Page Back Button (mobile-first, smart fallback) ──
(function() {
  // Don't show back button on homepage
  const isHome = /\/(index\.html)?$/.test(window.location.pathname) || window.location.pathname === '/';
  if (isHome) return;

  const main = document.querySelector('#main-content, .header')?.parentElement || document.body;
  const header = document.querySelector('.header');
  if (!header) return;

  const bar = document.createElement('div');
  bar.className = 'page-back-bar';
  bar.innerHTML = `
    <button class="page-back-btn" aria-label="Go back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      Back
    </button>`;
  header.insertAdjacentElement('afterend', bar);

  bar.querySelector('.page-back-btn').addEventListener('click', () => {
    // If there's meaningful history AND the referrer is our own site, go back
    if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.hostname)) {
      window.history.back();
    } else {
      // Fallback to homepage if opened directly (e.g. from Google search)
      window.location.href = 'index.html';
    }
  });
})();
(function() {
  let btn = document.getElementById('back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
  }
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('visible');
    else btn.classList.remove('visible');

    // Add shadow to sticky filter bar when scrolled
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      if (window.scrollY > 200) filterBar.classList.add('scrolled');
      else filterBar.classList.remove('scrolled');
    }
  }, { passive: true });
})();

// ── Sticky WhatsApp CTA (all pages) ─────────
(function () {
  if (document.querySelector('.mb-wa-sticky')) return;
  var p = (location.pathname || '').toLowerCase();
  var map = { 'calgary': 'Calgary', 'edmonton': 'Edmonton', 'vancouver': 'Vancouver', 'reddeer': 'Red Deer', 'red-deer': 'Red Deer', 'toronto': 'Toronto' };
  var found = {};
  Object.keys(map).forEach(function (k) { if (p.indexOf(k) !== -1) found[map[k]] = 1; });
  var cities = Object.keys(found);
  var city = cities.length === 1 ? cities[0] : '';
  if (!city) {
    try {
      var s = localStorage.getItem('mc_city');
      var m2 = { calgary: 'Calgary', edmonton: 'Edmonton', vancouver: 'Vancouver', reddeer: 'Red Deer', toronto: 'Toronto' };
      if (s && m2[s] && cities.length === 0) city = m2[s];
    } catch (e) {}
  }
  var msg = "Hi, I'd like today's price for a mattress" + (city ? ' in ' + city : '') + '.';
  var a = document.createElement('a');
  a.className = 'mb-wa-sticky' + (document.querySelector('.whatsapp-float') ? ' mb-mobile-only' : '');
  a.href = 'https://wa.me/15878389102?text=' + encodeURIComponent(msg);
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', "WhatsApp for today's price");
  a.innerHTML = '<span aria-hidden="true">💬</span> WhatsApp for Today\'s Price';
  document.body.appendChild(a);
  document.body.classList.add('mb-has-sticky');
})();

// Rotating sale bar messages
(function () {
  const msgs = document.querySelectorAll('.sale-bar-inner .bar-msg');
  if (msgs.length < 2) return;
  let i = 0;
  setInterval(() => {
    msgs[i].classList.remove('active');
    i = (i + 1) % msgs.length;
    msgs[i].classList.add('active');
  }, 4500);
})();
