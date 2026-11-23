import React, { useEffect, useMemo, useState } from 'react';
import { categories, compareProducts, currencyInfo, navItems, products as defaultProducts } from './data';
import { formatINR } from './currency';
import { getStoredCart, saveStoredCart } from './cart';
import { getCurrentUser, logoutUser, seedDemoAccountIfNeeded, isAdminUser } from './auth';
import { getAdminProducts, ADMIN_DATA_CHANGED_EVENT } from './adminData';
import { parseCurrentRoute, persistRoute } from './router';
import { subscribeToRealtimeSync, synchronizeCartWithLatestProducts } from './realtimeSync';
import AdminDashboard from './AdminDashboard';
import ProductDetailPage from './ProductDetailPage';
import ComparisonPage from './ComparisonPage';
import StoreLocatorPage from './StoreLocatorPage';
import SearchResultsPage from './SearchResultsPage';
import SearchBar from './SearchBar';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrderConfirmationPage from './OrderConfirmationPage';
import OrdersHistoryPage from './OrdersHistoryPage';
import AuthPage from './AuthPage';
import UserProfilePage from './UserProfilePage';
import SetupBuilderPage from './SetupBuilderPage';
import { searchProducts } from './searchUtils';
import { getSavedPreferredStore, savePreferredStore } from './storesData';
import { getSavedPincode } from './pincodeData';
import { handleProductImageError } from './imageUtils';
import './App.css';

const scrollToDeals = () => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });

function SunIcon({ className = '', size = 18 }) {
  return (
    <svg
      className={`theme-svg-icon sun-svg-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="4.57" y1="4.57" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.43" y2="19.43" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.57" y1="19.43" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.43" y2="4.57" />
    </svg>
  );
}

function MoonIcon({ className = '', size = 18 }) {
  return (
    <svg
      className={`theme-svg-icon moon-svg-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function Header({
  cartCount,
  wishlistCount,
  search,
  setSearch,
  products,
  onSearchSubmit,
  onViewProduct,
  onSelectCategory,
  onMenu,
  onCart,
  onWishlist,
  onHome,
  onStores,
  preferredStore,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenOrders,
  onOpenAdmin,
  onLogout,
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu" onClick={onMenu}>
        ☰
      </button>
      <a
        className="logo"
        href="#top"
        aria-label="ElectroHaven home"
        onClick={(e) => {
          e.preventDefault();
          onHome();
        }}
      >
        <span className="logo-mark">E</span>
        <span>
          Electro<span>Haven</span>
        </span>
      </a>
      <SearchBar
        search={search}
        setSearch={setSearch}
        products={products}
        onSearchSubmit={onSearchSubmit}
        onViewProduct={onViewProduct}
        onSelectCategory={onSelectCategory}
      />
      <div className="header-actions">
        {isAdminUser(user) && (
          <button
            type="button"
            className="header-admin-pill-btn"
            onClick={onOpenAdmin}
            title="Open ElectroHaven Admin Central"
          >
            ⚡ Admin Panel
          </button>
        )}

        <button
          className="header-store-btn"
          onClick={onStores}
          title="Store Locator"
          aria-label="Open Store Locator"
        >
          <span className="store-pin-icon">📍</span>
          <span className="header-store-text">
            <small>My Store</small>
            <b>{preferredStore ? preferredStore.locality : 'Ahmedabad'}</b>
          </span>
        </button>

        {/* Dynamic Account Dropdown */}
        <div className="account-dropdown-wrap">
          <button
            className="account"
            aria-label="Account"
            onClick={() => {
              if (user) {
                setAccountMenuOpen(!accountMenuOpen);
              } else {
                onOpenAuth('login');
              }
            }}
          >
            <span className="avatar">
              {user ? user.avatar || user.name.slice(0, 2).toUpperCase() : '👤'}
            </span>
            <span>
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign In'}
              <br />
              <b>{user ? 'Account & Orders ▾' : 'My Account'}</b>
            </span>
          </button>

          {accountMenuOpen && user && (
            <div className="account-menu-dropdown">
              <div className="account-menu-user">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <div className="account-menu-divider" />
              {isAdminUser(user) && (
                <button
                  type="button"
                  className="account-menu-item account-menu-admin"
                  onClick={() => {
                    onOpenAdmin();
                    setAccountMenuOpen(false);
                  }}
                >
                  ⚡ <strong>Admin Dashboard</strong>
                </button>
              )}
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onOpenProfile();
                  setAccountMenuOpen(false);
                }}
              >
                👤 My Profile &amp; Addresses
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onOpenOrders();
                  setAccountMenuOpen(false);
                }}
              >
                📦 My Orders &amp; Receipts
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onWishlist();
                  setAccountMenuOpen(false);
                }}
              >
                ♡ My Saved Wishlist ({wishlistCount})
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => {
                  onCart();
                  setAccountMenuOpen(false);
                }}
              >
                🛒 My Cart ({cartCount})
              </button>
              <div className="account-menu-divider" />
              <button
                type="button"
                className="account-menu-item account-menu-logout"
                onClick={() => {
                  onLogout();
                  setAccountMenuOpen(false);
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        <button
          className="icon-button wishlist-header-button"
          aria-label={`Open wishlist, ${wishlistCount} items`}
          onClick={onWishlist}
        >
          ♡{wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
        </button>
        <button
          className="cart-button"
          aria-label={`Open cart, ${cartCount} items`}
          onClick={onCart}
        >
          🛒<i>{cartCount}</i>
        </button>
      </div>
    </header>
  );
}

function Sidebar({
  active,
  setActive,
  open,
  compareCount,
  cartCount,
  wishlistCount,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout,
}) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-label">EXPLORE</div>
      <nav>
        {navItems.map(([icon, label]) => (
          <button
            className={active === label ? 'active' : ''}
            key={label}
            onClick={() => setActive(label)}
          >
            <span>{icon}</span>
            {label}
            {label === 'Deals' ? (
              <em>HOT</em>
            ) : label === 'Build Setup' ? (
              <em className="sidebar-ai-pill">AI</em>
            ) : label === 'Comparison' && compareCount > 0 ? (
              <em>{compareCount}</em>
            ) : label === 'Wishlist' && wishlistCount > 0 ? (
              <em>{wishlistCount}</em>
            ) : label === 'Cart' && cartCount > 0 ? (
              <em>{cartCount}</em>
            ) : null}
          </button>
        ))}
      </nav>

      {/* Admin Central Link */}
      <div className="sidebar-admin-box">
        <button
          type="button"
          className={`sidebar-admin-btn ${active === 'Admin' ? 'active' : ''}`}
          onClick={() => setActive('Admin')}
        >
          <span>⚙️</span>
          Admin Dashboard
          <em className="sidebar-admin-pill">ADMIN</em>
        </button>
      </div>

      {/* Sidebar User Status Card */}
      <div className="sidebar-account-box">
        {user ? (
          <div className="sidebar-user-card">
            <div className="sidebar-user-info">
              <span className="sidebar-user-avatar">
                {user.avatar || user.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="sidebar-user-meta">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
            </div>
            <div className="sidebar-user-actions">
              <button type="button" className="text-button" onClick={() => setActive('Profile')}>
                Profile
              </button>
              <span>·</span>
              <button type="button" className="text-button" onClick={() => setActive('Orders')}>
                Orders
              </button>
              <span>·</span>
              <button
                type="button"
                className="text-button sidebar-logout-btn"
                onClick={onLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="sidebar-signin-btn"
            onClick={() => onOpenAuth('login')}
          >
            <span>👤</span> Sign In / Register
          </button>
        )}
      </div>

      <div className="sidebar-theme-panel">
        <div className="sidebar-theme-head">
          <span className="sidebar-label">THEME</span>
          <span className="sidebar-theme-pill">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <div className="theme-segmented-control" role="group" aria-label="Theme mode selector">
          <button
            type="button"
            className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => theme !== 'dark' && onToggleTheme()}
            aria-pressed={theme === 'dark'}
          >
            <MoonIcon />
            <span>Dark</span>
          </button>
          <button
            type="button"
            className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => theme !== 'light' && onToggleTheme()}
            aria-pressed={theme === 'light'}
          >
            <SunIcon />
            <span>Light</span>
          </button>
        </div>
      </div>

      <div className="sidebar-card">
        <span>⚡</span>
        <strong>Need tech advice?</strong>
        <small>Our Ahmedabad specialists are online to assist you.</small>
        <button onClick={() => alert('Support chat: Our representatives are available 24/7.')}>
          Start live chat →
        </button>
      </div>

      <div className="sidebar-footer">
        <p>ElectroHaven Storefront</p>
        <span>v2.4.0 · Pan-India</span>
      </div>
    </aside>
  );
}

function Hero({ onBuildSetup }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">CROMA-INSPIRED PREMIUM ELECTRONICS</span>
        <h1>
          Future-Ready Tech.<br />
          <span>Authentic Flagships.</span>
        </h1>
        <p>
          Experience genuine consumer electronics from Apple, Samsung, Sony, HP, Dell, and Lenovo with express Pan-India shipping and local store pickup.
        </p>
        <div className="hero-buttons">
          <button className="primary" onClick={scrollToDeals}>
            Explore Hot Deals <b>↯</b>
          </button>
          {onBuildSetup && (
            <button
              type="button"
              className="hero-builder-trigger-btn"
              onClick={onBuildSetup}
            >
              <span>🪄</span> Build Your Setup (AI)
            </button>
          )}
          <button
            className="secondary"
            onClick={() =>
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Browse Products <b>→</b>
          </button>
        </div>
        <div className="hero-note">
          <span>✓ Genuine Brand Warranty</span> · <span>✓ Free Express Delivery</span> · <span>✓ Store Pickup</span>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="orbit" />
        <div className="orbit-two" />
        <div className="laptop">
          <div className="laptop-screen">
            <div className="screen-glow">
              Electro<span>Haven</span>
            </div>
            <div className="screen-line" />
          </div>
          <div className="laptop-base" />
        </div>
        <div className="float-chip">
          <span>OFFICIAL STORES</span>
          <b>Ahmedabad Hub</b>
        </div>
      </div>
    </section>
  );
}

function CategorySection({ selected, setSelected, products = [] }) {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="kicker">EXPLORE BY CATEGORY</p>
          <h2>Featured Categories</h2>
        </div>
        <button className="text-button" onClick={() => setSelected('all')}>
          View all <b>→</b>
        </button>
      </div>
      <div className="category-grid">
        {categories.map(([icon, label, slug]) => (
          <button
            className={`category-card ${selected === slug ? 'selected' : ''}`}
            onClick={() => setSelected(slug)}
            key={slug}
          >
            <span className="category-icon">{icon}</span>
            <strong>{label}</strong>
            <small>
              {products.filter((p) => p.category === slug).length} items <b>→</b>
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <div className="benefits">
      <div>
        <span>🚚</span>
        <p>
          <b>Fast Delivery</b>
          <small>Free delivery above ₹4,747</small>
        </p>
      </div>
      <div>
        <span>🛡</span>
        <p>
          <b>100% Authentic</b>
          <small>Direct from official brands</small>
        </p>
      </div>
      <div>
        <span>↺</span>
        <p>
          <b>Easy 7-Day Returns</b>
          <small>Hassle-free replacement policy</small>
        </p>
      </div>
      <div>
        <span>🏬</span>
        <p>
          <b>5 Local Stores</b>
          <small>Express pickup in Ahmedabad</small>
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  addToCart,
  wishlist,
  toggleWishlist,
  comparing,
  compareLimitReached,
  toggleCompare,
  onViewProduct,
}) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.discount && <span className="discount">{product.discount}</span>}
        <button
          className={`heart ${wishlist ? 'liked' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          {wishlist ? '♥' : '♡'}
        </button>
        <img
          src={product.image}
          alt={product.name}
          onClick={() => onViewProduct && onViewProduct(product)}
          style={{ cursor: 'pointer' }}
          onError={handleProductImageError}
        />
      </div>
      <div className="product-info">
        <h3
          onClick={() => onViewProduct && onViewProduct(product)}
          style={{ cursor: 'pointer' }}
          title={product.name}
        >
          {product.name}
        </h3>
        <p>{product.description}</p>
        <div className="rating">
          <strong>★ {product.rating || '4.8'}</strong>
          <span>({product.reviews || '120+'})</span>
        </div>
        <div className="price-row">
          <div>
            <b>{formatINR(product.price)}</b>
            {product.oldPrice > product.price && <del>{formatINR(product.oldPrice)}</del>}
          </div>
          <button
            className="add-button"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add <span>+</span>
          </button>
        </div>
        <button
          className="compare-button"
          disabled={compareLimitReached}
          onClick={() => toggleCompare(product.id)}
        >
          {comparing ? '✓ In comparison' : compareLimitReached ? 'Max 4 in compare' : '+ Compare'}
        </button>
      </div>
    </article>
  );
}

function ProductSection({
  filter,
  search,
  addToCart,
  wishlist,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onViewProduct,
  onNavigate,
  products = [],
}) {
  const filtered = products.filter((p) => {
    const matchesCategory = filter === 'all' || p.category === filter;
    const matchesSearch = !search || searchProducts([p], search).length > 0;
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="section" id="catalog-section">
      <div className="section-head">
        <div>
          <p className="kicker">CURATED SELECTION</p>
          <h2>Popular Electronics</h2>
        </div>
        <button className="text-button" onClick={() => onNavigate('Phones')}>
          Explore phones <b>→</b>
        </button>
      </div>
      <div className="product-grid">
        {filtered.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            wishlist={wishlist.includes(product.id)}
            toggleWishlist={toggleWishlist}
            comparing={compareIds.includes(product.id)}
            compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
            toggleCompare={toggleCompare}
            onViewProduct={onViewProduct}
          />
        ))}
      </div>
    </section>
  );
}

const catalogPages = {
  Phones: { title: 'Flagship Smartphones', kicker: 'NEXT-GEN MOBILITY', category: 'phones' },
  Laptops: { title: 'High-Performance Laptops', kicker: 'PORTABLE COMPUTING', category: 'laptops' },
  Audio: { title: 'Audiophile & Wireless Audio', kicker: 'ACOUSTIC ENGINEERING', category: 'headphones' },
  Cameras: { title: 'Cameras & Vlogging Gear', kicker: 'VISUAL CREATIVITY', category: 'cameras' },
  Gaming: { title: 'Gaming Gear & Consoles', kicker: 'COMPETITIVE HARDWARE', category: 'gaming' },
  Wearables: { title: 'Smartwatches & Trackers', kicker: 'CONNECTED LIFESTYLE', category: 'wearables' },
  'Smart Home': { title: 'Smart Home & Wi-Fi Systems', kicker: 'CONNECTED LIVING', category: 'smart home' },
  Deals: { title: 'ElectroHaven Hot Deals', kicker: 'LIMITED TIME OFFERS', dealsOnly: true },
};

function CatalogPage({
  page,
  search,
  addToCart,
  wishlist,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onViewProduct,
  products = [],
}) {
  const config = catalogPages[page] || { title: page, kicker: 'CATALOGUE', category: 'all' };
  const pageProducts = products.filter((p) => {
    const matchesCat = !config.category || config.category === 'all' || p.category === config.category;
    const matchesDeals = !config.dealsOnly || p.isHotDeal || (p.discount && p.discount.includes('OFF'));
    const matchesSearch = !search || searchProducts([p], search).length > 0;
    return matchesCat && matchesDeals && matchesSearch;
  });

  return (
    <section className="section catalog-page">
      <div className="section-head">
        <div>
          <p className="kicker">{config.kicker}</p>
          <h1>{config.title}</h1>
          <p className="catalog-description">
            Showing {pageProducts.length} authentic models available for immediate delivery.
          </p>
        </div>
      </div>
      <div className="product-grid">
        {pageProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            wishlist={wishlist.includes(product.id)}
            toggleWishlist={toggleWishlist}
            comparing={compareIds.includes(product.id)}
            compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
            toggleCompare={toggleCompare}
            onViewProduct={onViewProduct}
          />
        ))}
      </div>
    </section>
  );
}

function WishlistPage({
  search,
  wishlist,
  addToCart,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onContinueShopping,
  onViewProduct,
  products = [],
}) {
  const savedProducts = products.filter(
    (product) =>
      wishlist.includes(product.id) &&
      (!search.trim() || searchProducts([product], search).length > 0)
  );

  return (
    <section className="section wishlist-page">
      <div className="section-head wishlist-heading">
        <div>
          <p className="kicker">YOUR SAVED GEAR</p>
          <h1>
            Wishlist <span>({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className="catalog-description">
            Keep the products you love close by and add them to your cart whenever you’re ready.
          </p>
        </div>
      </div>
      {savedProducts.length ? (
        <div className="product-grid">
          {savedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist.includes(product.id)}
              toggleWishlist={toggleWishlist}
              comparing={compareIds.includes(product.id)}
              compareLimitReached={compareIds.length >= 4 && !compareIds.includes(product.id)}
              toggleCompare={toggleCompare}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state wishlist-empty-state">
          <span className="wishlist-empty-icon">♡</span>
          <h2>
            {wishlist.length
              ? 'No saved products match your search'
              : 'Your wishlist is waiting for favourites'}
          </h2>
          <p>
            {wishlist.length
              ? 'Try another search to find a saved product.'
              : 'Tap the heart on any product to save it here for later.'}
          </p>
          {!wishlist.length && (
            <button className="primary" type="button" onClick={onContinueShopping}>
              Explore products <b>→</b>
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Brands() {
  const [selected, setSelected] = useState('Apple');
  return (
    <section className="section brands-section">
      <div className="section-head">
        <div>
          <p className="kicker">THE BEST IN TECH</p>
          <h2>Popular Brands</h2>
        </div>
        <button className="text-button">
          Explore brands <b>→</b>
        </button>
      </div>
      <div className="brand-grid">
        {['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'HP'].map((brand, index) => (
          <button
            className={`brand-card ${selected === brand ? 'selected' : ''}`}
            onClick={() => setSelected(brand)}
            key={brand}
          >
            <span className={`brand-symbol symbol-${index}`}>
              {['A', 'S', 'S', 'D', 'L', 'H'][index]}
            </span>
            <strong>{brand}</strong>
            <small>Official store</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function Compare({ page = false, selectedProducts = [], onRemove, onClear, onViewProduct }) {
  if (page) {
    const rows = [
      ['Category', (product) => product.category],
      ['Product type', (product) => product.type],
      ['Description', (product) => product.description],
      ['Price', (product) => formatINR(product.price)],
      ['Original price', (product) => formatINR(product.oldPrice)],
      ['Discount', (product) => product.discount],
      ['Rating', (product) => `★ ${product.rating} / 5`],
      ['Reviews', (product) => product.reviews],
    ];

    return (
      <section className="section compare-section comparison-page">
        <div className="section-head">
          <div>
            <p className="kicker">SIDE-BY-SIDE PRODUCT DETAILS</p>
            <h2>Product Comparison</h2>
            <p className="catalog-description">
              Select up to three products from any category to compare them.
            </p>
          </div>
          {selectedProducts.length > 0 && (
            <button className="text-button" onClick={onClear}>
              Clear all
            </button>
          )}
        </div>
        {selectedProducts.length > 0 ? (
          <div className="compare-wrap">
            <table>
              <thead>
                <tr>
                  <th>Specifications</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id}>
                      <div className="compare-product">
                        <strong
                          onClick={() => onViewProduct && onViewProduct(product)}
                          style={{ cursor: 'pointer' }}
                          title="View product details"
                        >
                          {product.name}
                        </strong>
                        <span>{formatINR(product.price)}</span>
                        <button
                          className="outline-button"
                          onClick={() => onRemove(product.id)}
                          aria-label={`Remove ${product.name} from comparison`}
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, getValue]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {selectedProducts.map((product) => (
                      <td key={product.id}>{getValue(product)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No products selected. Browse a category and choose “Add to comparison” on up to three product cards.
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="section compare-section">
      <div className="section-head">
        <div>
          <p className="kicker">SIDE-BY-SIDE SPECS</p>
          <h2>Flagship Laptop Comparison</h2>
        </div>
        <button className="text-button">
          Compare models <b>→</b>
        </button>
      </div>
      <div className="compare-wrap">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              {compareProducts.map((product) => (
                <th key={product.name}>
                  <div className="compare-product">
                    <span className="mini-laptop">▣</span>
                    <strong>{product.name}</strong>
                    <span>{formatINR(product.price)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Display', 'display'],
              ['Processor', 'processor'],
              ['RAM', 'ram'],
              ['Storage', 'storage'],
              ['Rating', 'rating'],
            ].map(([label, key]) => (
              <tr key={label}>
                <th>{label}</th>
                {compareProducts.map((product) => (
                  <td key={product.name}>
                    {key === 'rating' ? <span className="stars">★ </span> : null}
                    {product[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Promos() {
  return (
    <section className="promo-grid">
      <article className="promo trade">
        <div>
          <p className="kicker">TRADE-IN PROGRAM</p>
          <h2>
            Get up to {formatINR(47470)}
            <br />
            for your old device
          </h2>
          <p>Trade in your next-gen tech effortlessly. Real-time online appraisal.</p>
          <button className="secondary">
            Get your estimate <b>→</b>
          </button>
        </div>
        <div className="promo-art phone-art">▱</div>
      </article>
      <article className="promo premium">
        <div>
          <p className="kicker">ELECTROHAVEN PREMIUM</p>
          <h2>
            Express shipping &amp;
            <br />
            exclusive deals
          </h2>
          <p>Unlock members-only early access to drops and product launches.</p>
          <button className="secondary">
            Become a member <b>→</b>
          </button>
        </div>
        <div className="promo-art premium-art">✦</div>
      </article>
    </section>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand">
          <a
            className="logo"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('Home');
            }}
          >
            <span className="logo-mark">E</span>
            <span>
              Electro<span>Haven</span>
            </span>
          </a>
          <p>
            Powering your future with
            <br />
            the world's best technology.
          </p>
          <div className="socials">
            <button>◎</button>
            <button>𝕏</button>
            <button>in</button>
            <button>◉</button>
          </div>
        </div>
        {[
          ['Shop', 'Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming'],
          ['Support', 'Help Center', 'Shipping', 'Returns', 'Contact'],
          ['Company', 'About', 'Careers', 'Privacy', 'Admin Portal'],
        ].map(([title, ...links]) => (
          <div className="footer-col" key={title}>
            <strong>{title}</strong>
            {links.map((link) => (
              <a
                href="#top"
                key={link}
                onClick={(e) => {
                  if (['Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming'].includes(link)) {
                    e.preventDefault();
                    onNavigate(link);
                  } else if (link === 'Admin Portal') {
                    e.preventDefault();
                    onNavigate('Admin');
                  }
                }}
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <p className="currency-note">
        Official electronics storefront in India. All product photography, specifications, and brand trademarks are authentic representations of respective manufacturers.
      </p>
      <div className="footer-bottom">
        <span>© 2026 ElectroHaven Electronics. All rights reserved.</span>
        <span>
          Made for the curious. <b>✦</b>
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const initialRoute = useMemo(() => parseCurrentRoute(), []);

  const [activeNav, setActiveNav] = useState(() => initialRoute.page);
  const [category, setCategory] = useState(() => initialRoute.category || 'all');
  const [search, setSearch] = useState(() => initialRoute.query || '');
  const [submittedSearch, setSubmittedSearch] = useState(() => initialRoute.query || '');
  const [viewedProductId, setViewedProductId] = useState(() => initialRoute.productId || null);

  // Dynamic products list connected to Admin Central
  const [products, setProducts] = useState(() => getAdminProducts());

  // Authentication State
  const [user, setUser] = useState(() => getCurrentUser());
  const [authReturnTo, setAuthReturnTo] = useState('Home');
  const [authInitialMode, setAuthInitialMode] = useState('login');

  // Cart & Checkout State (persisted via localStorage)
  const [cart, setCart] = useState(() => getStoredCart());
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [lastRemovedProduct, setLastRemovedProduct] = useState(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);
  const [checkoutFulfillmentType, setCheckoutFulfillmentType] = useState('delivery');
  const [checkoutPickupStore, setCheckoutPickupStore] = useState(null);

  // Other State
  const [wishlist, setWishlist] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previousPage, setPreviousPage] = useState('Home');
  const [preferredStore, setPreferredStore] = useState(() => getSavedPreferredStore());
  const [deliveryPincode, setDeliveryPincode] = useState(() => getSavedPincode());

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('electrohaven_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Seed demo customer and master admin accounts on startup
  useEffect(() => {
    seedDemoAccountIfNeeded();
  }, []);

  // Multi-Channel Real-Time Pub/Sub Synchronization (BroadcastChannel, StorageEvent & WebSockets)
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync((message) => {
      if (message.entity === 'products') {
        const latest = getAdminProducts();
        setProducts(latest);

        // Instantly synchronize cart items with new prices, titles, images, and discounts!
        setCart((currentCart) => {
          const synced = synchronizeCartWithLatestProducts(currentCart, latest);
          saveStoredCart(synced);
          return synced;
        });
      }

      if (message.entity === 'stores') {
        setPreferredStore(getSavedPreferredStore());
      }
    });

    return () => unsubscribe();
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Synchronize theme with data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('electrohaven_theme', next);
    } catch {}
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSetPreferredStore = (store) => {
    setPreferredStore(store);
    savePreferredStore(store);
  };

  const handleSearchSubmit = (query) => {
    const clean = (query || '').trim();
    if (!clean) return;
    setSubmittedSearch(clean);
    setSearch(clean);
    navigate('Search', { query: clean });
  };

  const handleClearSearch = () => {
    setSearch('');
    setSubmittedSearch('');
    if (activeNav === 'Search') {
      navigate('Home');
    }
  };

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const comparedProducts = useMemo(
    () => products.filter((product) => compareIds.includes(product.id)),
    [products, compareIds]
  );

  // Synchronize dynamic routing with URL path, hashchange and history popstate
  useEffect(() => {
    persistRoute(initialRoute, true);

    const handleLocationChange = () => {
      const route = parseCurrentRoute();

      if (route.page === 'Product' && route.productId) {
        setViewedProductId(route.productId);
        setActiveNav('Product');
      } else if (route.page === 'Search') {
        if (route.query) {
          setSubmittedSearch(route.query);
          setSearch(route.query);
        }
        setActiveNav('Search');
        setViewedProductId(null);
      } else if (route.page === 'Home') {
        if (route.category) {
          setCategory(route.category);
        }
        setActiveNav('Home');
        setViewedProductId(null);
      } else {
        setActiveNav(route.page);
        setViewedProductId(null);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Cart operations
  const addToCart = (product) => {
    setCart((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const addMultipleToCart = (productsList) => {
    if (!Array.isArray(productsList) || productsList.length === 0) return;
    setCart((current) => {
      let updated = [...current];
      productsList.forEach((prod) => {
        const existingIndex = updated.findIndex((item) => item.id === prod.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
        } else {
          updated.push({ ...prod, quantity: 1 });
        }
      });
      return updated;
    });
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) {
      const removedProduct = cart.find((item) => item.id === id);
      if (removedProduct) setLastRemovedProduct(removedProduct);
      setCart((current) => current.filter((item) => item.id !== id));
      return;
    }

    setCart((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id) => {
    const removedProduct = cart.find((item) => item.id === id);
    if (removedProduct) setLastRemovedProduct(removedProduct);
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const toggleWishlist = (id) =>
    setWishlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const toggleCompare = (id) =>
    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 4
        ? [...current, id]
        : current
    );

  // Protected & general navigation router
  const navigate = (item, options = {}) => {
    // Admin route
    if (item === 'Admin') {
      setActiveNav('Admin');
      setMenuOpen(false);
      setViewedProductId(null);
      persistRoute({ page: 'Admin' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protected routes check: Checkout, Orders, Profile
    if ((item === 'Checkout' || item === 'Orders' || item === 'Profile') && !user) {
      setAuthReturnTo(item);
      setAuthInitialMode('login');
      setActiveNav('Auth');
      setMenuOpen(false);
      persistRoute({ page: 'Auth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Search route
    if (item === 'Search') {
      const q = options.query !== undefined ? options.query : (submittedSearch || search || '');
      setActiveNav('Search');
      setMenuOpen(false);
      setViewedProductId(null);
      persistRoute({ page: 'Search', query: q });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Home or category routes
    if (item === 'Home') {
      const cat = options.category !== undefined ? options.category : (options.resetCategory ? 'all' : category);
      if (options.resetCategory) {
        setCategory('all');
      } else if (options.category !== undefined) {
        setCategory(options.category);
      }
      setActiveNav('Home');
      setMenuOpen(false);
      setViewedProductId(null);
      persistRoute({ page: 'Home', category: cat });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveNav(item);
    setMenuOpen(false);
    if (item !== 'Product') {
      setViewedProductId(null);
    }
    persistRoute({ page: item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthPage = (mode = 'login', returnTarget = 'Home') => {
    setAuthInitialMode(mode);
    setAuthReturnTo(returnTarget);
    setActiveNav('Auth');
    setMenuOpen(false);
    persistRoute({ page: 'Auth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (authedUser, returnTarget) => {
    setUser(authedUser);
    navigate(returnTarget || 'Home');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    if (activeNav === 'Checkout' || activeNav === 'Orders' || activeNav === 'Profile') {
      navigate('Home');
    }
  };

  const handleProceedToCheckout = (couponCode) => {
    setAppliedCoupon(couponCode || '');
    setCheckoutFulfillmentType('delivery');
    if (!user) {
      openAuthPage('login', 'Checkout');
      return;
    }
    navigate('Checkout');
  };

  const handleStorePickupFromPDP = (product, store, qty = 1) => {
    setCart((current) => {
      const exists = current.find((i) => i.id === product.id);
      if (exists) {
        return current.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...current, { ...product, quantity: qty }];
    });

    setCheckoutFulfillmentType('store_pickup');
    setCheckoutPickupStore(store);

    if (user) {
      navigate('Checkout');
    } else {
      openAuthPage('login', 'Checkout');
    }
  };

  const handleOrderSuccess = (order) => {
    setLastCompletedOrder(order);
    setCart([]);
    navigate('OrderConfirmation');
  };

  const handleReorderItems = (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    setCart((current) => {
      let nextCart = [...current];
      orderItems.forEach((orderItem) => {
        const existing = nextCart.find((i) => i.id === orderItem.id);
        if (existing) {
          nextCart = nextCart.map((i) =>
            i.id === orderItem.id ? { ...i, quantity: i.quantity + orderItem.quantity } : i
          );
        } else {
          const fullProduct = products.find((p) => p.id === orderItem.id) || orderItem;
          nextCart.push({ ...fullProduct, quantity: orderItem.quantity });
        }
      });
      return nextCart;
    });
    navigate('Cart');
  };

  const viewProduct = (product) => {
    if (activeNav !== 'Product') {
      setPreviousPage(activeNav);
    }
    setViewedProductId(product.id);
    setActiveNav('Product');
    setMenuOpen(false);
    persistRoute({ page: 'Product', productId: product.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromProduct = () => {
    const targetPage = previousPage === 'Product' ? 'Home' : previousPage;
    navigate(targetPage);
  };

  const handleNavigateCategory = (cat) => {
    const pageEntry = Object.entries(catalogPages).find(([pageName, info]) => info.category === cat);
    if (pageEntry) {
      navigate(pageEntry[0]);
    } else {
      setCategory(cat);
      navigate('Home', { category: cat });
    }
  };

  const viewedProduct = products.find((product) => product.id === viewedProductId);

  // Dedicated Full-Width Admin Dashboard View
  if (activeNav === 'Admin') {
    return (
      <div className="app admin-fullscreen" data-theme={theme}>
        <AdminDashboard
          currentUser={user}
          onLoginSuccess={(authedUser) => {
            setUser(authedUser);
          }}
          onExitToStore={() => navigate('Home')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  return (
    <div className="app" data-theme={theme}>
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        search={search}
        setSearch={setSearch}
        products={products}
        onSearchSubmit={handleSearchSubmit}
        onViewProduct={viewProduct}
        onSelectCategory={handleNavigateCategory}
        onMenu={() => setMenuOpen(!menuOpen)}
        onCart={() => navigate('Cart')}
        onWishlist={() => navigate('Wishlist')}
        onHome={() => {
          handleClearSearch();
          navigate('Home');
        }}
        onStores={() => navigate('Stores')}
        preferredStore={preferredStore}
        user={user}
        onOpenAuth={(mode) => openAuthPage(mode, 'Home')}
        onOpenProfile={() => navigate('Profile')}
        onOpenOrders={() => navigate('Orders')}
        onOpenAdmin={() => navigate('Admin')}
        onLogout={handleLogout}
      />

      <Sidebar
        active={activeNav}
        setActive={navigate}
        open={menuOpen}
        compareCount={compareIds.length}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onOpenAuth={(mode) => openAuthPage(mode, 'Home')}
        onLogout={handleLogout}
      />

      <main>
        {activeNav === 'Auth' ? (
          <AuthPage
            initialMode={authInitialMode}
            returnTo={authReturnTo}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => navigate('Home')}
          />
        ) : activeNav === 'Profile' ? (
          <UserProfilePage
            user={user}
            onLogout={handleLogout}
            onNavigateOrders={() => navigate('Orders')}
            onNavigateWishlist={() => navigate('Wishlist')}
            onNavigateCart={() => navigate('Cart')}
            onContinueShopping={() => navigate('Home')}
          />
        ) : activeNav === 'Checkout' ? (
          <CheckoutPage
            cart={cart}
            user={user}
            appliedCoupon={appliedCoupon}
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => navigate('Cart')}
            onPromptLogin={(target) => openAuthPage('login', target)}
            initialFulfillmentType={checkoutFulfillmentType}
            initialPickupStore={checkoutPickupStore}
            preferredStore={preferredStore}
            onSetPreferredStore={handleSetPreferredStore}
          />
        ) : activeNav === 'OrderConfirmation' ? (
          <OrderConfirmationPage
            order={lastCompletedOrder}
            onContinueShopping={() => navigate('Home')}
            onNavigateOrders={() => navigate('Orders')}
          />
        ) : activeNav === 'Orders' ? (
          <OrdersHistoryPage
            user={user}
            onContinueShopping={() => navigate('Home')}
            onReorderItems={handleReorderItems}
            onViewOrderDetails={(order) => {
              setLastCompletedOrder(order);
              navigate('OrderConfirmation');
            }}
            onPromptLogin={(target) => openAuthPage('login', target)}
          />
        ) : activeNav === 'Search' ? (
          <SearchResultsPage
            query={submittedSearch || search}
            allProducts={products}
            addToCart={addToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onViewProduct={viewProduct}
            onSearch={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onContinueShopping={() => navigate('Home')}
            ProductCardComponent={ProductCard}
          />
        ) : activeNav === 'Stores' ? (
          <StoreLocatorPage
            preferredStore={preferredStore}
            onSetPreferredStore={handleSetPreferredStore}
            onContinueShopping={() => navigate('Home')}
          />
        ) : activeNav === 'Wishlist' ? (
          <WishlistPage
            search={search}
            wishlist={wishlist}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onContinueShopping={() => navigate('Home')}
            onViewProduct={viewProduct}
            products={products}
          />
        ) : activeNav === 'Cart' ? (
          <CartPage
            cart={cart}
            lastRemovedProduct={lastRemovedProduct}
            onQuantityChange={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onViewProduct={viewProduct}
            onContinueShopping={() => navigate('Home')}
            onProceedToCheckout={handleProceedToCheckout}
            user={user}
            onPromptLogin={(target) => openAuthPage('login', target)}
          />
        ) : activeNav === 'Product' && viewedProduct ? (
          <ProductDetailPage
            product={viewedProduct}
            onBack={handleBackFromProduct}
            onAddToCart={addToCart}
            onBuyNow={(prod) => {
              addToCart(prod);
              if (user) {
                navigate('Checkout');
              } else {
                openAuthPage('login', 'Checkout');
              }
            }}
            onStorePickup={handleStorePickupFromPDP}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onNavigateCategory={handleNavigateCategory}
            onNavigateHome={() => navigate('Home')}
            preferredStore={preferredStore}
            onSetPreferredStore={handleSetPreferredStore}
            deliveryPincode={deliveryPincode}
            onPincodeChange={setDeliveryPincode}
          />
        ) : activeNav === 'Build Setup' || activeNav === 'SetupBuilder' ? (
          <SetupBuilderPage
            allProducts={products}
            onAddToCart={addToCart}
            onAddMultipleToCart={addMultipleToCart}
            onViewProduct={viewProduct}
            onCompare={(productIds) => {
              setCompareIds(productIds);
              navigate('Comparison');
            }}
            onNavigate={navigate}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        ) : activeNav === 'Comparison' ? (
          <ComparisonPage
            selectedProducts={comparedProducts}
            allProducts={products}
            onRemove={toggleCompare}
            onAddProduct={(id) => {
              if (!compareIds.includes(id) && compareIds.length < 4) {
                setCompareIds((current) => [...current, id]);
              }
            }}
            onClear={() => setCompareIds([])}
            onAddToCart={addToCart}
            onViewProduct={viewProduct}
            onContinueShopping={() => navigate('Home')}
          />
        ) : activeNav === 'Home' ? (
          <>
            <Hero onBuildSetup={() => navigate('Build Setup')} />
            <CategorySection selected={category} setSelected={setCategory} products={products} />
            <Benefits />
            <ProductSection
              filter={category}
              search={search}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              compareIds={compareIds}
              toggleCompare={toggleCompare}
              onViewProduct={viewProduct}
              onNavigate={navigate}
              products={products}
            />
            <Brands />
            <Compare onViewProduct={viewProduct} />
            <Promos />
          </>
        ) : (
          <CatalogPage
            page={activeNav}
            search={search}
            addToCart={addToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareIds={compareIds}
            toggleCompare={toggleCompare}
            onViewProduct={viewProduct}
            products={products}
          />
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
