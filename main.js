/* ============================================================
   Mattbed Canada — main.js
   Single source of truth for: nav, cart, city, toast, filter
   ============================================================ */

/* ── WhatsApp SVG helper ── */
const WA_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.882a.5.5 0 00.611.632l6.197-1.624A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.528-5.204-1.443l-.374-.223-3.875 1.016 1.034-3.772-.244-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`;

/* ── City store ── */
const CITIES = {
  edmonton: { label: 'Edmonton', file: 'edmonton.html' },
  calgary:  { label: 'Calgary',  file: 'calgary.html'  },
  vancouver:{ label: 'Vancouver',file: 'vancouver.html'},
  reddeer:  { label: 'Red Deer', file: 'reddeer.html'  }
};

function getCity()      { return localStorage.getItem('mc_city') || ''; }
function setCity(slug)  { localStorage.setItem('mc_city', slug); }

/* ── Cart store ── */
function getCart()      { try { return JSON.parse(localStorage.getItem('mc_cart')) || []; } catch(e) { return []; } }
function saveCart(c)    { localStorage.setItem('mc_cart', JSON.stringify(c)); }
function cartCount()    { return getCart().reduce((s,i) => s + i.qty, 0); }

/* ── Update ALL cart badges on page ── */
function refreshBadges() {
  const n = cartCount();
  document.querySelectorAll('.nav-badge').forEach(b => {
    b.textContent = n;
    b.style.display = n > 0 ? 'inline-flex' : 'none';
  });
}

/* ── Toast ── */
let _toastTimer;
function showToast(msg) {
  let t = document.getElementById('mc-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'mc-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── Add to cart (used by city pages and order page) ── */
function addToCart(name, size, category) {
  const cart = getCart();
  const key = name + '||' + size;
  const existing = cart.find(i => i.name + '||' + i.size === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, size, category, qty: 1 });
  }
  saveCart(cart);
  refreshBadges();
  showToast('✓ Added to cart');
  updateCartBar();
}

/* ── Sticky cart bar (city pages) ── */
function updateCartBar() {
  const bar = document.getElementById('city-cart-bar');
  if (!bar) return;
  const n = cartCount();
  if (n > 0) {
    bar.querySelector('.bar-count').textContent = n + ' item' + (n > 1 ? 's' : '');
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }
}

/* ── Mobile nav toggle ── */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── Set active nav link ── */
(function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
})();

/* ── City selector in nav: show saved city ── */
(function populateCityNav() {
  const slug = getCity();
  const cityBadge = document.getElementById('nav-city-badge');
  if (cityBadge && slug && CITIES[slug]) {
    cityBadge.textContent = CITIES[slug].label;
    cityBadge.style.display = 'inline-block';
  }
})();

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── Category filter ── */
window.filterProducts = function(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
  });
};

/* ── Size selection on product cards ── */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  const card = btn.closest('.product-card');
  if (!card) return;
  card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
});

/* ── Add-to-cart button handler (city + order pages) ── */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.add-cart-btn');
  if (!btn) return;
  const card = btn.closest('.product-card');
  if (!card) return;
  const name = card.querySelector('.product-name')?.textContent?.trim() || 'Product';
  const cat  = card.dataset.cat || 'other';
  const selected = card.querySelector('.size-btn.selected');
  const size = selected ? selected.dataset.size : (card.querySelector('.size-btn')?.dataset.size || 'One Size');

  // Animate button
  btn.classList.add('added');
  btn.innerHTML = '✓ Added!';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '🛒 Add to Cart';
  }, 1500);

  addToCart(name, size, cat);
});

/* ── City picker modal (index page) ── */
(function initCityModal() {
  const modal = document.getElementById('city-modal');
  if (!modal) return;
  // If city already set, don't show modal
  if (getCity()) { modal.style.display = 'none'; return; }
  modal.style.display = 'flex';
  modal.querySelectorAll('.city-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.city;
      setCity(slug);
      modal.style.display = 'none';
      // Redirect to city page
      if (CITIES[slug]) window.location.href = CITIES[slug].file;
    });
  });
})();

/* ── Pre-select city in cart dropdown ── */
(function preselectCity() {
  const sel = document.getElementById('city-select');
  if (!sel) return;
  const slug = getCity();
  if (slug && CITIES[slug]) {
    sel.value = CITIES[slug].label;
  }
})();

/* ── Init on load ── */
refreshBadges();
updateCartBar();