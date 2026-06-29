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
}

// ── City modal ──────────────────────────────
const modal = document.getElementById('city-modal');
if (modal) {
  const saved = localStorage.getItem('mc_city');
  if (!saved) modal.style.display = 'flex';
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
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.cat !== filter);
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

// ── Smooth scroll ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Header scroll shadow ─────────────────────
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(10,22,40,0.35)' : '0 2px 16px rgba(10,22,40,0.3)';
  }, { passive: true });
}
