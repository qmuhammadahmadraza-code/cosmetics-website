// ============================================================
// CART SYSTEM — shared across all pages
// ============================================================

const Cart = {
  get() {
    return JSON.parse(localStorage.getItem('beautyCart') || '[]');
  },
  save(items) {
    localStorage.setItem('beautyCart', JSON.stringify(items));
    this.updateBadge();
    this.renderDrawer();
  },
  add(product) {
    const items = this.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    this.save(items);
    this.pulseCartBadge();
  },
  remove(id) {
    const items = this.get().filter(i => i.id !== id);
    this.save(items);
  },
  updateQty(id, qty) {
    const items = this.get();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save(items);
    }
  },
  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.qty, 0);
  },
  count() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },
  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.count();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },
  pulseCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    }
  },
  renderDrawer() {
    const drawer = document.getElementById('cart-drawer-items');
    const drawerTotal = document.getElementById('cart-drawer-total');
    if (!drawer) return;
    const items = this.get();
    if (items.length === 0) {
      drawer.innerHTML = `<div class="drawer-empty"><span>🛒</span><p>Your cart is empty</p></div>`;
    } else {
      drawer.innerHTML = items.map(item => `
        <div class="drawer-item" id="ditem-${item.id}">
          <img src="${item.img}" alt="${item.name}" />
          <div class="drawer-item-info">
            <p class="drawer-item-name">${item.name}</p>
            <p class="drawer-item-price">$${item.price.toFixed(2)} × ${item.qty}</p>
          </div>
          <button class="drawer-remove" onclick="Cart.remove('${item.id}')">×</button>
        </div>
      `).join('');
    }
    if (drawerTotal) drawerTotal.textContent = `$${this.total().toFixed(2)}`;
  },
  init() {
    this.updateBadge();
    this.renderDrawer();
  }
};

// ============================================================
// NAVBAR + DRAWER HTML — injected into every page
// ============================================================
function injectNav(activePage) {
  const pages = ['index', 'shop', 'skincare', 'makeup', 'about', 'contact'];
  const labels = ['Home', 'Shop', 'Skincare', 'Makeup', 'About', 'Contact'];
  const hrefs = ['index.html', 'shop.html', 'skincare.html', 'makeup.html', 'about.html', 'contact.html'];

  const navLinks = labels.map((label, i) =>
    `<a href="${hrefs[i]}" class="nav-link${pages[i] === activePage ? ' active' : ''}">${label}</a>`
  ).join('');

  const navHTML = `
  <nav class="navbar" id="navbar">
    <a href="index.html" class="nav-logo">🌿 Verdure</a>
    <div class="nav-links" id="nav-links">${navLinks}</div>
    <div class="nav-right">
      <button class="cart-btn" id="cart-btn" aria-label="Open cart">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <span class="cart-badge" id="cart-badge">0</span>
      </button>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- MOBILE MENU -->
  <div class="mobile-overlay" id="mobile-overlay"></div>
  <div class="mobile-menu" id="mobile-menu">
    <button class="mobile-close" id="mobile-close">×</button>
    ${labels.map((label, i) =>
      `<a href="${hrefs[i]}" class="mobile-link">${label}</a>`
    ).join('')}
  </div>

  <!-- CART DRAWER -->
  <div class="drawer-overlay" id="drawer-overlay"></div>
  <div class="cart-drawer" id="cart-drawer">
    <div class="drawer-header">
      <h3>Your Cart</h3>
      <button class="drawer-close" id="drawer-close">×</button>
    </div>
    <div class="drawer-items" id="cart-drawer-items"></div>
    <div class="drawer-footer">
      <div class="drawer-total-row">
        <span>Subtotal</span>
        <span id="cart-drawer-total">$0.00</span>
      </div>
      <a href="cart.html" class="btn-mint drawer-cart-btn">View Full Cart</a>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // hamburger
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('open');
    document.getElementById('mobile-overlay').classList.add('open');
  });
  const closeMenu = () => {
    document.getElementById('mobile-menu').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('open');
  };
  document.getElementById('mobile-close').addEventListener('click', closeMenu);
  document.getElementById('mobile-overlay').addEventListener('click', closeMenu);

  // cart drawer
  document.getElementById('cart-btn').addEventListener('click', () => {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
  });
  const closeDrawer = () => {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('open');
  };
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  // sticky navbar
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });

  Cart.init();
}

// ============================================================
// FOOTER HTML
// ============================================================
function injectFooter() {
  const footerHTML = `
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="index.html" class="footer-logo">🌿 Verdure</a>
        <p>Clean beauty rooted in nature. Made for the modern woman.</p>
        <div class="social-links">
          <a href="#" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="#" aria-label="Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-links">
        <h4>Shop</h4>
        <a href="shop.html">All Products</a>
        <a href="skincare.html">Skincare</a>
        <a href="makeup.html">Makeup</a>
      </div>
      <div class="footer-links">
        <h4>Company</h4>
        <a href="about.html">About Us</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="footer-newsletter">
        <h4>Stay in the loop</h4>
        <p>Get new arrivals and exclusive offers.</p>
        <div class="newsletter-form">
          <input type="email" placeholder="your@email.com" />
          <button class="btn-mint">Subscribe</button>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Verdure Beauty. All rights reserved.</p>
    </div>
  </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
// PRODUCT DATA
// ============================================================
const PRODUCTS = [
  { id: 'p1', name: 'Dew Drop Serum', category: 'skincare', price: 42.00, rating: 5, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80' },
  { id: 'p2', name: 'Velvet Moisturizer', category: 'skincare', price: 38.00, rating: 4, img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80' },
  { id: 'p3', name: 'Glow Toner', category: 'skincare', price: 28.00, rating: 5, img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80' },
  { id: 'p4', name: 'Petal Lip Balm', category: 'skincare', price: 14.00, rating: 4, img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80' },
  { id: 'p5', name: 'Silk Foundation', category: 'makeup', price: 52.00, rating: 5, img: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&q=80' },
  { id: 'p6', name: 'Bloom Blush', category: 'makeup', price: 34.00, rating: 4, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80' },
  { id: 'p7', name: 'Nude Lip Set', category: 'makeup', price: 26.00, rating: 5, img: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2519?w=400&q=80' },
  { id: 'p8', name: 'Lash Lift Mascara', category: 'makeup', price: 22.00, rating: 4, img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80' },
  { id: 'p9', name: 'Mint Eye Cream', category: 'skincare', price: 48.00, rating: 5, img: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&q=80' },
  { id: 'p10', name: 'Rose Clay Mask', category: 'skincare', price: 32.00, rating: 4, img: 'https://images.unsplash.com/photo-1601049541271-1f0a56c62fb3?w=400&q=80' },
  { id: 'p11', name: 'Contour Stick', category: 'makeup', price: 29.00, rating: 4, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80' },
  { id: 'p12', name: 'Highlighter Duo', category: 'makeup', price: 36.00, rating: 5, img: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=400&q=80' },
];

function renderStars(n) {
  return Array.from({length: 5}, (_, i) => `<span class="${i < n ? 'star-filled' : 'star-empty'}">★</span>`).join('');
}

function productCard(p, delay = 0) {
  return `
    <div class="product-card reveal fade-up" style="animation-delay:${delay}ms" data-category="${p.category}">
      <a href="product.html?id=${p.id}" class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        <span class="product-tag">${p.category}</span>
      </a>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-stars">${renderStars(p.rating)}</div>
        <div class="product-bottom">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="btn-add-cart" onclick="addToCartAnim(this, '${p.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

function addToCartAnim(btn, id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  Cart.add(product);
  btn.classList.add('added');
  btn.textContent = '✓ Added';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.textContent = 'Add to Cart';
  }, 1500);
}
