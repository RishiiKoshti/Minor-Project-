import React, { useMemo, useState } from 'react';
import { categories, compareProducts, navItems, products } from './data';
import './App.css';

const scrollToDeals = () => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });

function Header({ cartCount, search, setSearch, onMenu }) {
  return <header className="topbar">
    <button className="mobile-menu" aria-label="Open menu" onClick={onMenu}>☰</button>
    <a className="logo" href="#top" aria-label="ElectroHaven home"><span className="logo-mark">E</span><span>Electro<span>Haven</span></span></a>
    <div className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, brands, and more..." aria-label="Search products" /></div>
    <div className="header-actions">
      <button className="account" aria-label="Account"><span className="avatar">◯</span><span>Hi, Alex<br /><b>Account & Lists</b></span></button>
      <button className="icon-button" aria-label="Wishlist">♡</button>
      <button className="cart-button" aria-label={`${cartCount} items in cart`}>🛒<i>{cartCount}</i></button>
    </div>
  </header>;
}

function Sidebar({ active, setActive, open }) {
  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="sidebar-label">EXPLORE</div>
    <nav>{navItems.map(([icon, label]) => <button className={active === label ? 'active' : ''} key={label} onClick={() => setActive(label)}><span>{icon}</span>{label}{label === 'Deals' && <em>HOT</em>}</button>)}</nav>
    {/* <div className="sidebar-card"><span>✦</span><strong>ElectroHaven<br />Premium</strong><small>Get more. Pay less.</small><button>Discover →</button></div> */}
    {/* <div className="sidebar-footer">© 2024 ElectroHaven<br /><span>Built for the future</span></div> */}
  </aside>;
}

function Hero() {
  return <section className="hero" id="top">
    <div className="hero-copy"><div className="eyebrow">🚀 UP TO 40% OFF PREMIUM GEAR</div><h1>Next-Gen Tech.<br /><span>Unbeatable Prices.</span></h1><p>Discover the latest in electronics from top global brands — all in one place.</p><div className="hero-buttons"><button className="primary" onClick={scrollToDeals}>Shop Now <b>→</b></button><button className="secondary" onClick={scrollToDeals}>Explore Deals</button></div><div className="hero-note"><span>✓</span> Free shipping on orders over $50</div></div>
    <div className="hero-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="laptop"><div className="laptop-screen"><div className="screen-glow">E<span>H</span></div><div className="screen-line" /></div><div className="laptop-base" /></div><div className="float-chip">NEW<br /><b>2024</b></div></div>
  </section>;
}

function CategorySection({ selected, setSelected }) {
  return <section className="section categories-section"><div className="section-head"><div><p className="kicker">FIND YOUR PERFECT GEAR</p><h2>Shop by Category</h2></div><button className="text-button">View all <b>→</b></button></div><div className="category-grid">{categories.map(([icon, label, key]) => <button className={`category-card ${selected === key ? 'selected' : ''}`} key={key} onClick={() => setSelected(selected === key ? 'all' : key)}><span className="category-icon">{icon}</span><strong>{label}</strong><small>Explore <b>→</b></small></button>)}</div></section>;
}

function Benefits() {
  return <div className="benefits"><div><span>⌁</span><p><b>Free Shipping</b><small>On all orders above $50</small></p></div><div><span>◌</span><p><b>24/7 Tech Support</b><small>Expert technical assistance</small></p></div><div><span>▣</span><p><b>Secure Payment</b><small>100% encrypted checkout</small></p></div><div><span>↺</span><p><b>Easy Returns</b><small>30-day money back guarantee</small></p></div></div>;
}

function ProductCard({ product, addToCart, wishlist, toggleWishlist }) {
  return <article className="product-card"><div className="product-image"><span className="discount">{product.discount}</span><button className={`heart ${wishlist ? 'liked' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label={`Wishlist ${product.name}`}>{wishlist ? '♥' : '♡'}</button><img src={product.image} alt={product.name} /></div><div className="product-info"><h3>{product.name}</h3><p>{product.description}</p><div className="rating"><strong>★ {product.rating}</strong><span>({product.reviews} reviews)</span></div><div className="price-row"><div><b>${product.price}</b><del>${product.oldPrice}</del></div><button className="add-button" onClick={() => addToCart(product)}>Add to cart <span>+</span></button></div></div></article>;
}

function ProductSection({ filter, search, addToCart, wishlist, toggleWishlist }) {
  const filtered = products.filter((product) => (filter === 'all' || product.category === filter) && `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="section deals-section" id="deals"><div className="section-head"><div><p className="kicker">CURATED FOR YOU</p><h2>Best Deals</h2></div><button className="text-button">View all <b>→</b></button></div>{filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} wishlist={wishlist.includes(product.id)} toggleWishlist={toggleWishlist} />)}</div> : <div className="empty-state">No products found. Try another search or category.</div>}</section>;
}

function Brands() {
  const [selected, setSelected] = useState('SonicWave');
  return <section className="section brands-section"><div className="section-head"><div><p className="kicker">THE BEST IN TECH</p><h2>Popular Brands</h2></div><button className="text-button">Explore brands <b>→</b></button></div><div className="brand-grid">{['TechCore', 'SonicWave', 'PixelPro', 'NovaByte', 'CloudEdge', 'VoltX'].map((brand, index) => <button className={`brand-card ${selected === brand ? 'selected' : ''}`} onClick={() => setSelected(brand)} key={brand}><span className={`brand-symbol symbol-${index}`}>{['T', 'S', 'P', 'N', 'C', 'V'][index]}</span><strong>{brand}</strong><small>Official store</small></button>)}</div></section>;
}

function Compare() {
  return <section className="section compare-section"><div className="section-head"><div><p className="kicker">MAKE THE RIGHT CHOICE</p><h2>Compare Products</h2></div><button className="text-button">View all laptops <b>→</b></button></div><div className="compare-wrap"><table><thead><tr><th>Specifications</th>{compareProducts.map((product) => <th key={product.name}><div className="compare-product"><div className="mini-laptop">▰</div><strong>{product.name}</strong><span>{product.price}</span></div></th>)}</tr></thead><tbody>{[['Display', 'display'], ['Processor', 'processor'], ['RAM', 'ram'], ['Storage', 'storage'], ['Rating', 'rating']].map(([label, key]) => <tr key={key}><th>{label}</th>{compareProducts.map((product) => <td key={product.name}>{key === 'rating' && <span className="stars">★ </span>}{product[key]}</td>)}</tr>)}<tr><th></th>{compareProducts.map((product) => <td key={product.name}><button className="outline-button">Compare now</button></td>)}</tr></tbody></table></div></section>;
}

function Promos() {
  return <section className="promo-grid"><article className="promo trade"><div><p className="kicker">TRADE-IN PROGRAM</p><h2>Get up to $500<br />for your old device</h2><p>Trade in your next-gen tech effortlessly. Real-time online appraisal.</p><button className="secondary">Get your estimate <b>→</b></button></div><div className="promo-art phone-art">▱</div></article><article className="promo premium"><div><p className="kicker">ELECTROHAVEN PREMIUM</p><h2>Express shipping &<br />exclusive deals</h2><p>Unlock members-only early access to drops and product launches.</p><button className="secondary">Become a member <b>→</b></button></div><div className="promo-art premium-art">✦</div></article></section>;
}

function Footer() {
  return <footer><div className="footer-main"><div className="footer-brand"><a className="logo" href="#top"><span className="logo-mark">E</span><span>Electro<span>Haven</span></span></a><p>Powering your future with<br />the world's best technology.</p><div className="socials"><button>◎</button><button>𝕏</button><button>in</button><button>◉</button></div></div>{[['Shop', 'Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming'], ['Support', 'Help Center', 'Shipping', 'Returns', 'Contact'], ['Company', 'About', 'Careers', 'Privacy', 'Terms']].map(([title, ...links]) => <div className="footer-col" key={title}><strong>{title}</strong>{links.map((link) => <a href="#top" key={link}>{link}</a>)}</div>)}</div><div className="footer-bottom"><span>© 2024 ElectroHaven. All rights reserved.</span><span>Made for the curious. <b>✦</b></span></div></footer>;
}

export default function App() {
  const [activeNav, setActiveNav] = useState('Home');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const addToCart = (product) => setCart((current) => current.some((item) => item.id === product.id) ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]);
  const toggleWishlist = (id) => setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <div className="app"><Header cartCount={cartCount} search={search} setSearch={setSearch} onMenu={() => setMenuOpen(!menuOpen)} /><Sidebar active={activeNav} setActive={(item) => { setActiveNav(item); setMenuOpen(false); if (item === 'Deals') scrollToDeals(); }} open={menuOpen} /><main><Hero /><CategorySection selected={category} setSelected={setCategory} /><Benefits /><ProductSection filter={category} search={search} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} /><Brands /><Compare /><Promos /></main><Footer /></div>;
}
