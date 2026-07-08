/* ===========================
   MATTBED CANADA — cart.js
   Cart + Checkout + Email + Detail Modal
   =========================== */

// ── Promo Codes ─────────────────────────────
const PROMO_CODES = [
  'BEDS20','SLEEP30','REST15','FOAM25',
  'KING10','COZY44','BLUE99','GOLD55',
  'SOFT77','REST88','CALM11','BEST66',
  'WARM33','DREAM42','NIGHT50','CLOUD73',
  'PLUSH18','ROYAL91','VELVET37','PRIME62'
];
const PROMO_DISCOUNT = 10;

// ── Cart State ───────────────────────────────
let cart = [];
let appliedPromo = null;

function getCartTotal() { return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }
function getDiscount() { return appliedPromo ? PROMO_DISCOUNT : 0; }
function getFinalTotal() { return Math.max(0, getCartTotal() - getDiscount()); }
function cartCount() { return cart.reduce((sum, i) => sum + i.qty, 0); }

function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(b => {
    const c = cartCount();
    b.textContent = c;
    b.style.display = c > 0 ? 'flex' : 'none';
  });
}

function addToCart(product) {
  const existing = cart.find(i => i.name === product.name && i.size === product.size && i.color === product.color);
  if (existing) { existing.qty += 1; }
  else { cart.push({ ...product, qty: 1, id: Date.now() + Math.random() }); }
  updateCartBadge();
  showCartNotification(product.name);
  renderCartDrawer();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartBadge();
  renderCartDrawer();
  renderCheckoutSummary();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartBadge();
  renderCartDrawer();
  renderCheckoutSummary();
}

// ── Cart notification ────────────────────────
function showCartNotification(name) {
  let notif = document.getElementById('cart-notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'cart-notif';
    notif.style.cssText = `position:fixed;bottom:24px;right:24px;background:var(--navy);color:white;
      padding:14px 20px;border-radius:12px;font-size:14px;font-weight:600;
      box-shadow:0 8px 32px rgba(10,22,40,0.3);z-index:9999;
      transform:translateY(80px);transition:transform 0.3s ease;
      display:flex;align-items:center;gap:10px;max-width:280px;`;
    document.body.appendChild(notif);
  }
  const short = name.length > 30 ? name.substring(0,30)+'...' : name;
  notif.innerHTML = `✅ <span>${short} added to cart!</span>`;
  setTimeout(() => notif.style.transform = 'translateY(0)', 10);
  setTimeout(() => notif.style.transform = 'translateY(80px)', 2500);
}

// ── Cart Drawer ──────────────────────────────
function createCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const d = document.createElement('div');
  d.id = 'cart-drawer';
  d.innerHTML = `
    <div id="cart-overlay" onclick="closeCart()"></div>
    <div id="cart-panel">
      <div class="cart-header">
        <h3>🛒 Your Cart</h3>
        <button onclick="closeCart()" class="cart-close">✕</button>
      </div>
      <div id="cart-items-list"></div>
      <div id="cart-footer"></div>
    </div>`;
  document.body.appendChild(d);
}

function openCart() {
  createCartDrawer();
  renderCartDrawer();
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const d = document.getElementById('cart-drawer');
  if (d) d.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartDrawer() {
  const list = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');
  if (!list || !footer) return;

  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px 20px;color:var(--text-muted);">
      <div style="font-size:48px;margin-bottom:16px;">🛏</div>
      <p style="font-size:15px;">Your cart is empty</p>
      <p style="font-size:13px;margin-top:8px;">Browse products and add them here</p></div>`;
    footer.innerHTML = '';
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.size}${item.color ? ' · '+item.color : ''}</p>
        <p class="cart-item-price">$${(item.price * item.qty).toLocaleString()} CAD</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQty(${item.id}, -1)" class="qty-btn">−</button>
        <span class="qty-num">${item.qty}</span>
        <button onclick="updateQty(${item.id}, 1)" class="qty-btn">+</button>
        <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑</button>
      </div>
    </div>`).join('');

  const subtotal = getCartTotal();
  const discount = getDiscount();
  const total = getFinalTotal();

  footer.innerHTML = `
    <div class="cart-totals">
      <div class="cart-total-row"><span>Subtotal</span><span>$${subtotal.toLocaleString()} CAD</span></div>
      ${discount > 0 ? `<div class="cart-total-row discount"><span>Promo discount</span><span>−$${discount}</span></div>` : ''}
      <div class="cart-total-row total"><span>Total</span><span>$${total.toLocaleString()} CAD</span></div>
    </div>
    <button onclick="openCheckout()" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;margin-top:16px;border-radius:12px;">
      Proceed to Checkout →
    </button>
    <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:10px;">Cash on delivery · Free delivery</p>`;
}

// ── Product Detail Modal ─────────────────────
function openProductDetail(card) {
  // Read all data from card
  const name = card.querySelector('.product-name')?.textContent || '';
  const cat = card.querySelector('.product-cat-tag')?.textContent || '';
  const img = card.querySelector('.product-img img')?.src || '';
  const badge = card.querySelector('.product-badge')?.textContent || '';

  // Descriptions per product (keyed by first few words of name)
  const descriptions = {
    'DreamBreeze': 'Breathable bamboo-certified cover with high-density supportive foam core. Naturally temperature-regulating and moisture-wicking — ideal for Canada\'s climate. Excellent pressure relief for back, side and stomach sleepers. Available in single/twin, double/full, queen and king.',
    'CloudPillow': 'Luxuriously plush pillow top surface with certified bamboo cover and multiple deep foam layers. The extra depth gives a hotel-like sleeping experience. Perfect for those who prefer a softer, cloud-like feel. Available in single/twin through king.',
    'LuxReve': 'Hotel-quality 14 inch EuroTop with individually wrapped pocket coils for zero motion transfer — ideal for couples. Deep cushioning layers with bamboo-certified fabric. The finest mattress in our collection, perfect for master bedrooms.',
    'DualFirm': 'Two-sided orthopedic high-density foam mattress — flip it over to extend its lifespan. Extra firm feel preferred by South Asian and Pakistani families. Outstanding back support for people with back pain or those who prefer sleeping on a firm surface.',
    'OrganicRest': 'Certified organic cotton cover with supportive foam core. Natural, breathable and hypoallergenic — ideal for families with allergies or sensitivities. No synthetic materials, no off-gassing. Safe for children and adults alike.',
    'PureRest': 'Eco-friendly bamboo foam mattress available in 5", 7" and 9" thickness options. The most affordable mattress in our collection — perfect for newcomers, guest rooms and children\'s beds. Breathable bamboo fabric keeps you cool through the night.',
    'BoxFresh': 'Compressed and rolled for easy delivery through narrow hallways and apartment doors — simply unbox and it expands to full size within a few hours. 9 inch premium foam. Available in queen size with same-day delivery.',
    'RegalNight': 'Classic button-tufted upholstered headboard in faux leather. Strong and durable platform frame — no box spring required. Easy to assemble with all tools included. Adds elegance to any bedroom.',
    'SoftCrest': 'Plush velvet upholstered headboard with soft texture and rich colour. Strong platform frame with sturdy wooden slats. No box spring required. Easy assembly — all tools included. Pairs beautifully with any mattress.',
    'SlimLine': 'Sleek, minimalist leather headboard with clean vertical panel design. Perfect for modern condos and apartments where space and style both matter. Strong platform frame — no box spring needed.',
    'UrbanEdge': 'Bold contemporary leather or velvet headboard with a strong, durable frame. Makes a statement in any master bedroom. No box spring required — wooden slats provide full mattress support.',
    'LuxPanel': 'Channel-stitched panel headboard available in leather, black velvet and grey velvet. Clean lines and rich texture. Strong platform frame — no box spring needed. Available in a wide range of sizes.',
    'WoodHaven': 'Beautiful wooden bedframe with 4 generous built-in drawers and integrated headboard shelf — maximizing storage for apartments and condos. No box spring required. Assembly tools included.',
    'AzureCloud': 'Stunning ocean-blue button-tufted velvet headboard that makes a bold statement in any bedroom. Deep colour, plush texture, strong platform frame. No box spring required.',
    'LiftLux': 'Premium grey velvet hydraulic lift-up storage bed — the ultimate in bedroom storage. Gas-piston mechanism lifts the entire mattress platform to reveal a massive storage compartment underneath. Includes all tools.',
    'RiseStore': 'Beige PVC leather hydraulic lift-up storage bedframe — practical and stylish. Easy-lift gas piston mechanism with smooth action. Includes all tools. No box spring required.',
    'StarDust': 'Glamorous deep-pink velvet headboard with diamond-stud button tufting. A showstopper piece for any bedroom. Strong solid frame — no box spring needed. Makes a beautiful statement.',
    'DarkVault': 'Sleek black PVC bedframe with two built-in side drawers for quick, easy bedroom storage. Compact and practical for condos and apartments. No box spring required.',
    'CloudLift': 'Luxurious grey velvet hydraulic lift storage bed available in dark grey or light grey. Gas-piston lift provides effortless access to the large storage space underneath. All tools included.',
    'NavyLux': 'Striking navy blue velvet headboard — a bold, unique choice exclusive to Red Deer. Channel-stitched velvet with a rich, deep colour. Strong platform frame. No box spring required.',
    'NightShade': 'Deep dark grey velvet headboard — moody and sophisticated. Perfect for those who want a dramatic, premium look in their bedroom. Single/twin size, strong frame, no box spring required.',
    'BlushFrame': 'Beautiful blush pink velvet headboard — soft, feminine and elegant. Adds warmth and personality to any bedroom. Strong platform frame. No box spring required.',
    'PinkLine': 'Fun and stylish pink PVC headboard with a youthful, vibrant look. Great for children\'s or teen bedrooms. Strong frame — no box spring required.',
    'SleepBase': 'Traditional 7 inch black fabric box spring foundation. Available in regular (one piece) or split (two pieces — much easier through narrow hallways). Provides essential mattress support and height.',
    'GrandVelvet': 'Luxurious dark grey velvet button-tufted sofa set for living rooms. Deep, comfortable cushions with a strong wooden frame. Available as 2-seater, 3-seater or complete set (1+2+3 seater together).',
    'DualTone': 'Contemporary two-tone modern nightstand with multiple drawers for bedroom storage. Available in black or grey. Sturdy construction, smooth drawer action.',
    'NordicSit': 'Minimalist Scandinavian-style dining chair with white plastic moulded seat and solid wooden legs. Lightweight, stackable and easy to clean. Perfect for dining rooms and home offices.',
    'ArcGlow': 'Modern arc-base side table with round top. Lightweight and easy to move wherever you need it — living room, bedroom or study. Available in white and brown.',
    'VelvetFrame': 'Elegant beige upholstered dining chair with black powder-coated metal legs. Comfortable padded high back with easy-clean fabric. Perfect for dining rooms and home offices.',
  };

  // Find matching description
  let desc = 'Premium quality product with same-day delivery, free delivery and cash on delivery in ' + (localStorage.getItem('mc_city') || 'your city') + '. No advance payment required.';
  for (const [key, val] of Object.entries(descriptions)) {
    if (name.includes(key)) { desc = val; break; }
  }

  // Features list
  const features = [
    'Same-day delivery (order before 4pm)',
    'Cash on delivery — pay when it arrives',
    'Free delivery — no hidden charges',
    'No advance payment or deposit required',
    'Easy assembly — all tools included'
  ];

  // Collect sizes from hidden rows
  const sizes = [];
  card.querySelectorAll('.size-btn[data-price]').forEach(btn => {
    if (btn.dataset.price && parseInt(btn.dataset.price) > 0) {
      sizes.push({ size: btn.dataset.size, price: parseInt(btn.dataset.price) });
    }
  });

  // Collect colours
  const colors = [];
  // colours from size-btns without data-price
  card.querySelectorAll('.size-btn:not([data-price])').forEach(btn => {
    if (btn.dataset.size) colors.push(btn.dataset.size);
  });

  if (sizes.length === 0) {
    alert('Price information not available for this product yet.');
    return;
  }

  let modal = document.getElementById('product-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'product-detail-modal';
    document.body.appendChild(modal);
  }

  const sizesHTML = sizes.map((s, i) => `
    <button class="size-btn ${i === 0 ? 'selected' : ''}"
      data-size="${s.size}" data-price="${s.price}"
      onclick="selectDetailSize(this)">
      ${s.size} — $${s.price.toLocaleString()}
    </button>`).join('');

  const colorsHTML = colors.length > 0 ? `
    <div style="margin-top:12px;">
      <p style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">Colour:</p>
      <div class="size-select-row" id="detail-colors">
        ${colors.map((c,i) => `<button class="size-btn ${i===0?'selected':''}" data-color="${c}" onclick="selectDetailColor(this)">${c}</button>`).join('')}
      </div>
    </div>` : '';

  modal.innerHTML = `
    <div class="detail-overlay" onclick="closeProductDetail()"></div>
    <div class="detail-panel">
      <button onclick="closeProductDetail()" class="detail-close">✕</button>
      <div class="detail-inner">
        <div class="detail-img-wrap">
          <img src="${img}" alt="${name}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=font-size:64px;text-align:center;padding:60px>🛏</div>'">
          ${badge ? `<span class="product-badge" style="top:16px;left:16px;">${badge}</span>` : ''}
        </div>
        <div class="detail-info">
          <span class="product-cat-tag">${cat}</span>
          <h2 class="detail-name">${name}</h2>
          <div id="detail-price" class="detail-price">$${sizes[0].price.toLocaleString()} <span>CAD · cash on delivery</span></div>
          <div class="detail-trust">
            <span>🚚 Same-day</span>
            <span>💵 Cash on delivery</span>
            <span>✅ Free delivery</span>
          </div>
          <div style="margin:20px 0 16px;">
            <p style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">Select Size:</p>
            <div class="size-select-row" id="detail-sizes">${sizesHTML}</div>
            ${colorsHTML}
          </div>
          <div class="detail-desc">
            <h4 style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--navy);">Product Description</h4>
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">${desc}</p>
            <ul style="margin-top:14px;padding-left:0;list-style:none;">
              ${features.map(f => `<li style="font-size:13px;color:var(--text-secondary);padding:5px 0;border-bottom:1px solid var(--border);">✔ ${f}</li>`).join('')}
            </ul>
          </div>
          <button id="detail-add-btn" onclick="addToCartFromDetail()" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;margin-top:20px;border-radius:12px;">
            🛒 Add to Cart — $${sizes[0].price.toLocaleString()}
          </button>
          <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:10px;">Pay cash when your order arrives at your door</p>
        </div>
      </div>
    </div>`;

  // Store card ref for add to cart
  modal._sourceCard = card;
  modal._productName = name;
  modal._productImg = img;
  modal._productCat = cat;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

function selectDetailSize(btn) {
  document.getElementById('detail-sizes').querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const price = parseInt(btn.dataset.price);
  document.getElementById('detail-price').innerHTML = `$${price.toLocaleString()} <span>CAD · cash on delivery</span>`;
  document.getElementById('detail-add-btn').textContent = `🛒 Add to Cart — $${price.toLocaleString()}`;
}

function selectDetailColor(btn) {
  document.getElementById('detail-colors')?.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function addToCartFromDetail() {
  const modal = document.getElementById('product-detail-modal');
  const sizeBtn = document.querySelector('#detail-sizes .size-btn.selected');
  const colorBtn = document.querySelector('#detail-colors .size-btn.selected');
  if (!sizeBtn) { alert('Please select a size first.'); return; }
  addToCart({
    name: modal._productName,
    img: modal._productImg,
    category: modal._productCat,
    size: sizeBtn.dataset.size,
    color: colorBtn ? colorBtn.dataset.color : '',
    price: parseInt(sizeBtn.dataset.price)
  });
  closeProductDetail();
  openCart();
}

// ── Checkout Modal ───────────────────────────
function openCheckout() {
  closeCart();
  let modal = document.getElementById('checkout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'checkout-modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="checkout-overlay" onclick="closeCheckout()"></div>
    <div class="checkout-panel">
      <button onclick="closeCheckout()" class="detail-close">✕</button>
      <div class="checkout-inner">
        <div class="checkout-form-col">
          <h2 style="font-size:1.3rem;color:var(--navy);margin-bottom:6px;">📦 Place Your Order</h2>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:24px;">Fill in your details and we'll deliver same day. Pay cash on delivery.</p>
          <div class="form-group"><label>Full Name *</label><input type="text" id="co-name" placeholder="e.g. Ahmed Hassan" required></div>
          <div class="form-group"><label>Delivery Address *</label><input type="text" id="co-address" placeholder="Street address, unit number"></div>
          <div class="form-group"><label>City & Postal Code *</label><input type="text" id="co-postcode" placeholder="e.g. Calgary, AB T2P 1J9"></div>
          <div class="form-group"><label>Phone Number *</label><input type="tel" id="co-phone" placeholder="e.g. +1 403 555 0123"></div>
          <div class="form-group"><label>Additional Notes (delivery day, time, instructions)</label><textarea id="co-notes" rows="3" placeholder="e.g. Please deliver Saturday afternoon. Ring doorbell."></textarea></div>
          <div class="promo-row">
            <input type="text" id="co-promo" placeholder="Promo code (optional)" style="text-transform:uppercase;">
            <button onclick="applyPromo()" class="btn btn-navy" style="padding:10px 18px;border-radius:10px;font-size:13px;">Apply</button>
          </div>
          <div id="promo-msg" style="font-size:13px;margin-top:6px;min-height:18px;"></div>
          <button onclick="placeOrder()" id="place-order-btn" class="btn btn-primary" style="width:100%;padding:15px;font-size:16px;margin-top:20px;border-radius:12px;">
            ✅ Place Order — Cash on Delivery
          </button>
          <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:10px;">No advance payment · Free delivery · Same day</p>
        </div>
        <div class="checkout-summary-col">
          <h3 style="font-size:1rem;color:var(--navy);margin-bottom:16px;">Order Summary</h3>
          <div id="checkout-summary-items"></div>
          <div id="checkout-summary-totals"></div>
        </div>
      </div>
    </div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCheckoutSummary();
}

function closeCheckout() {
  const m = document.getElementById('checkout-modal');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

function renderCheckoutSummary() {
  const itemsEl = document.getElementById('checkout-summary-items');
  const totalsEl = document.getElementById('checkout-summary-totals');
  if (!itemsEl || !totalsEl) return;

  itemsEl.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div>
        <p style="font-size:13px;font-weight:600;color:var(--navy);">${item.name}</p>
        <p style="font-size:12px;color:var(--text-muted);">${item.size}${item.color?' · '+item.color:''} × ${item.qty}</p>
      </div>
      <p style="font-size:13px;font-weight:700;color:var(--navy);">$${(item.price*item.qty).toLocaleString()}</p>
    </div>`).join('');

  const subtotal = getCartTotal();
  const discount = getDiscount();
  const total = getFinalTotal();

  totalsEl.innerHTML = `
    <div style="border-top:2px solid var(--border);margin-top:12px;padding-top:12px;">
      <div class="summary-total-row"><span>Subtotal</span><span>$${subtotal.toLocaleString()} CAD</span></div>
      <div class="summary-total-row"><span>Delivery</span><span style="color:var(--success);">FREE</span></div>
      ${discount > 0 ? `<div class="summary-total-row" style="color:var(--success);"><span>Promo (${appliedPromo})</span><span>−$${discount}</span></div>` : ''}
      <div class="summary-total-row" style="font-size:16px;font-weight:700;color:var(--navy);margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
        <span>Total to Pay</span><span>$${total.toLocaleString()} CAD</span>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-top:8px;text-align:center;">Cash on delivery when your order arrives</p>
    </div>`;
}

function applyPromo() {
  const input = document.getElementById('co-promo');
  const msg = document.getElementById('promo-msg');
  const code = input.value.trim().toUpperCase();
  if (PROMO_CODES.includes(code)) {
    appliedPromo = code;
    msg.innerHTML = `<span style="color:var(--success);">✅ Code applied — $${PROMO_DISCOUNT} off your order!</span>`;
    input.disabled = true;
    renderCheckoutSummary();
  } else {
    msg.innerHTML = `<span style="color:#e53e3e;">❌ Invalid promo code. Please check and try again.</span>`;
  }
}

// ── Place Order ──────────────────────────────
async function placeOrder() {
  const name = document.getElementById('co-name').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const postcode = document.getElementById('co-postcode').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  const notes = document.getElementById('co-notes').value.trim();

  if (!name || !address || !postcode || !phone) {
    alert('Please fill in all required fields: Name, Address, Postal Code and Phone.');
    return;
  }
  if (cart.length === 0) { alert('Your cart is empty.'); return; }

  const btn = document.getElementById('place-order-btn');
  btn.textContent = '⏳ Sending order...';
  btn.disabled = true;

  const orderLines = cart.map(item =>
    `• ${item.name} | Size: ${item.size}${item.color?' | Colour: '+item.color:''} | Qty: ${item.qty} | $${(item.price*item.qty).toLocaleString()} CAD`
  ).join('\n');

  const subtotal = getCartTotal();
  const discount = getDiscount();
  const total = getFinalTotal();
  const city = localStorage.getItem('mc_city') || 'Not specified';

  const orderText = `
NEW ORDER — Mattbed Canada
==========================
CUSTOMER DETAILS
Name: ${name}
Phone: ${phone}
Address: ${address}
City/Postcode: ${postcode}
Delivery City: ${city.toUpperCase()}

ORDER ITEMS
${orderLines}

ORDER SUMMARY
Subtotal: $${subtotal.toLocaleString()} CAD
Delivery: FREE
${appliedPromo ? `Promo Code: ${appliedPromo} (−$${discount})` : 'No promo code used'}
TOTAL TO COLLECT: $${total.toLocaleString()} CAD

DELIVERY NOTES
${notes || 'None provided'}

==========================
Order placed via mattressbedframe.ca
  `.trim();

  try {
    const response = await fetch('https://formspree.io/f/meebzolk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: name,
        phone: phone,
        address: address,
        postcode: postcode,
        order_total: `$${total.toLocaleString()} CAD`,
        promo_code: appliedPromo || 'None',
        message: orderText
      })
    });
    if (response.ok) {
      showOrderSuccess(name, total);
      cart = [];
      appliedPromo = null;
      updateCartBadge();
      closeCheckout();
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    console.error('Formspree error:', err);
    btn.textContent = '✅ Place Order — Cash on Delivery';
    btn.disabled = false;
    alert('There was an issue sending your order. Please try again.');
  }
}

function showOrderSuccess(name, total) {
  let s = document.getElementById('order-success');
  if (!s) { s = document.createElement('div'); s.id = 'order-success'; document.body.appendChild(s); }
  s.innerHTML = `
    <div class="success-overlay"></div>
    <div class="success-box">
      <div style="font-size:56px;margin-bottom:16px;">🎉</div>
      <h2 style="color:var(--navy);margin-bottom:10px;">Order Placed!</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:8px;">Thank you <strong>${name}</strong> for placing your order!</p>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px;">Your order of <strong>$${total.toLocaleString()} CAD</strong> has been received. You will soon receive a text message on your provided phone number confirming your order and delivery details.</p>
      <div style="background:var(--navy-pale);border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;color:var(--text-secondary);text-align:left;">
        📱 <strong>Confirmation:</strong> Sent via text message<br>
        💵 <strong>Payment:</strong> Cash on delivery<br>
        🚚 <strong>Delivery:</strong> Same day (if ordered before 4pm)<br>
        ✅ <strong>Delivery fee:</strong> Free
      </div>
      <button onclick="document.getElementById('order-success').remove()" class="btn btn-primary" style="padding:12px 32px;border-radius:12px;">
        Continue Shopping
      </button>
    </div>`;
  s.classList.add('open');
}

// ── Cart button in header ────────────────────
function injectCartButton() {
  const nav = document.getElementById('nav');
  if (!nav || document.getElementById('cart-nav-btn')) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <button id="cart-nav-btn" onclick="openCart()" style="
      background:var(--gold);color:var(--navy);border:none;
      padding:8px 16px;border-radius:20px;font-size:14px;font-weight:700;
      cursor:pointer;display:flex;align-items:center;gap:6px;
      font-family:inherit;transition:all 0.2s;
    " onmouseover="this.style.background='var(--gold-light)'" onmouseout="this.style.background='var(--gold)'">
      🛒 Cart
      <span class="cart-badge" style="
        background:var(--navy);color:white;border-radius:50%;
        width:18px;height:18px;font-size:11px;font-weight:700;
        display:none;align-items:center;justify-content:center;
      ">0</span>
    </button>`;
  nav.querySelector('ul').appendChild(li);
}

// ── View Details buttons ─────────────────────
function initViewDetailButtons() {
  document.querySelectorAll('.inquire-btn').forEach(btn => {
    // Get starting price from first hidden size btn
    const card = btn.closest('.product-card');
    const firstPriceBtn = card.querySelector('.size-select-row .size-btn[data-price]');
    const startPrice = firstPriceBtn ? parseInt(firstPriceBtn.dataset.price) : null;

    btn.innerHTML = `👁 View Details${startPrice ? ` — from $${startPrice.toLocaleString()}` : ''}`;
    btn.style.cssText = `
      width:100%;padding:11px;background:var(--gold);color:var(--navy);
      border:none;border-radius:var(--radius-md);font-size:14px;font-weight:700;
      cursor:pointer;transition:all 0.2s;font-family:inherit;
      display:flex;align-items:center;justify-content:center;gap:6px;
    `;

    btn.onclick = () => openProductDetail(card);
  });
}

// ── Remove product-price display from cards ──
function cleanProductCards() {
  document.querySelectorAll('.product-card .product-price').forEach(el => el.remove());
}

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectCartButton();
  cleanProductCards();
  initViewDetailButtons();
  updateCartBadge();
});
