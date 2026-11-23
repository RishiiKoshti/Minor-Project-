import React, { useState, useMemo, useEffect } from 'react';
import { formatINR } from './currency';
import { getProductDetails } from './productDetailsData';
import {
  ahmedabadStores,
  ahmedabadLocalities,
  getGoogleMapsDirectionsUrl,
  getStoredStoresList,
} from './storesData';
import { getProductStoreStock, getProductAvailabilityForAllStores } from './storeAvailability';
import { subscribeToRealtimeSync } from './realtimeSync';
import PincodeDeliveryChecker from './PincodeDeliveryChecker';
import { handleProductImageError } from './imageUtils';

export default function ProductDetailPage({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  onStorePickup,
  wishlist = [],
  toggleWishlist,
  compareIds = [],
  toggleCompare,
  onNavigateCategory,
  onNavigateHome,
  preferredStore = null,
  onSetPreferredStore = null,
  deliveryPincode = '380009',
  onPincodeChange = null,
}) {
  const details = useMemo(() => getProductDetails(product), [product]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [realtimeKey, setRealtimeKey] = useState(0);

  // Real-time synchronization subscription for live stock, price, and store updates
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync((msg) => {
      if (msg.entity === 'inventory' || msg.entity === 'products' || msg.entity === 'stores') {
        setRealtimeKey((prev) => prev + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Store-wise availability states
  const storesList = useMemo(() => getStoredStoresList(), [realtimeKey]);
  const initialStoreId = preferredStore?.id || (storesList[0] && storesList[0].id) || 'eh-store-amd-01';
  const [activeStoreId, setActiveStoreId] = useState(initialStoreId);
  const [selectedLocality, setSelectedLocality] = useState(preferredStore?.locality || 'all');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'single'
  const [pickupReservedMessage, setPickupReservedMessage] = useState('');

  // Selected locality coordinates for distance calculation
  const selectedLocalityObj = useMemo(() => {
    return ahmedabadLocalities.find((loc) => loc.locality === selectedLocality);
  }, [selectedLocality]);

  const userCoordinates = selectedLocalityObj?.coordinates || null;

  // Real-time store availability computed for current product across all stores
  const allStoresAvailability = useMemo(() => {
    if (!product) return [];
    return getProductAvailabilityForAllStores(product.id, userCoordinates);
  }, [product, userCoordinates, realtimeKey]);

  // Selected store and its live stock for current product
  const selectedStore = useMemo(() => {
    return storesList.find((s) => s.id === activeStoreId) || storesList[0];
  }, [storesList, activeStoreId]);

  const selectedStoreStock = useMemo(() => {
    if (!product || !selectedStore) return null;
    return getProductStoreStock(product.id, selectedStore.id);
  }, [product, selectedStore, realtimeKey]);

  // Stores to display based on view mode (all stores vs single store)
  const storesToDisplay = useMemo(() => {
    if (viewMode === 'single') {
      const single = allStoresAvailability.find((item) => item.store.id === activeStoreId);
      return single ? [single] : allStoresAvailability.slice(0, 1);
    }
    // If user selected a locality with coordinates, sort by nearest first
    if (userCoordinates) {
      return [...allStoresAvailability].sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }
    return allStoresAvailability;
  }, [viewMode, activeStoreId, allStoresAvailability, userCoordinates]);

  if (!product || !details) {
    return (
      <section className="section catalog-page pdp-container">
        <div className="empty-state">
          <h2>Product Not Found</h2>
          <p>The product you are looking for does not exist or has been removed.</p>
          <button className="primary" onClick={onNavigateHome}>
            Return to Storefront <b>→</b>
          </button>
        </div>
      </section>
    );
  }

  const isLiked = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const compareLimitReached = compareIds.length >= 4 && !isCompared;
  const savings = product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  const discountPercent = savings > 0 ? Math.round((savings / product.oldPrice) * 100) : 0;
  const discountLabel = savings > 0 ? `${discountPercent}% OFF` : product.discount;
  const emiPerMonth = Math.round(product.price / 6);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onBuyNow(product);
  };

  const scrollToStoreAvailability = () => {
    const el = document.getElementById('store-availability');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSetAsPreferred = (store) => {
    setActiveStoreId(store.id);
    if (onSetPreferredStore) {
      onSetPreferredStore(store);
    }
  };

  const handleSelectStoreAndCheckout = (store) => {
    setShowPickupModal(false);
    if (onStorePickup) {
      onStorePickup(product, store, quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }
      onBuyNow(product);
    }
  };

  const handleReservePickup = (storeItem) => {
    handleSelectStoreAndCheckout(storeItem.store);
  };

  const categoryName = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'Electronics';

  return (
    <div className="pdp-wrapper">
      {/* Breadcrumb Navigation */}
      <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
        <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
          Home
        </button>
        <span className="breadcrumb-separator">›</span>
        <button
          type="button"
          className="breadcrumb-link"
          onClick={() => onNavigateCategory(product.category)}
        >
          {categoryName}
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current" title={product.name}>
          {product.name}
        </span>
      </nav>

      {/* Back button */}
      <div className="pdp-back-row">
        <button className="text-button pdp-back-btn" type="button" onClick={onBack}>
          ← Back to browsing
        </button>
      </div>

      {/* Main Product Showcase Section */}
      <div className="pdp-grid">
        {/* Left Column: Image Gallery */}
        <div className="pdp-gallery-column">
          <div className="pdp-main-image-card">
            <div className="pdp-image-badges">
              {discountLabel && <span className="discount-tag">{discountLabel}</span>}
              <span className="pdp-tag-stock">✓ In Stock</span>
            </div>

            <button
              className={`pdp-wishlist-toggle ${isLiked ? 'liked' : ''}`}
              type="button"
              aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => toggleWishlist(product.id)}
            >
              {isLiked ? '♥' : '♡'}
            </button>

            <div className="pdp-image-view">
              <img
                src={details.images[selectedImageIndex] || product.image}
                alt={`${product.name} view ${selectedImageIndex + 1}`}
                className="pdp-active-img"
                onError={handleProductImageError}
              />
            </div>

            <div className="pdp-trust-bar">
              <span>🔒 100% Genuine</span>
              <span>🛡 1-Year Warranty</span>
              <span>↺ 7-Day Replacement</span>
            </div>
          </div>

          {/* Thumbnail Selector Strip */}
          <div className="pdp-thumbnails">
            {details.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                className={`pdp-thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={`Show image view ${idx + 1}`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} onError={handleProductImageError} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Buy Box & Product Info */}
        <div className="pdp-info-column">
          <div className="pdp-header">
            <span className="pdp-brand-kicker">{details.brand} · {details.series}</span>
            <h1 className="pdp-title">{product.name}</h1>
            <p className="pdp-subtitle">{product.description}</p>

            {/* Rating Bar */}
            <div className="pdp-ratings-row">
              <div className="pdp-star-badge">
                ★ {details.ratingScore}
              </div>
              <span className="pdp-review-count">
                {details.reviewsCount} Ratings &amp; Reviews
              </span>
              <span className="pdp-verified-badge">✓ Verified Authentic</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="pdp-pricing-box">
            <div className="pdp-price-row">
              <span className="pdp-deal-price">{formatINR(product.price)}</span>
              {product.oldPrice > product.price && (
                <del className="pdp-old-price">{formatINR(product.oldPrice)}</del>
              )}
              {savings > 0 && (
                <span className="pdp-save-badge">
                  Save {formatINR(savings)} ({discountLabel})
                </span>
              )}
            </div>
            <p className="pdp-tax-notice">Inclusive of all taxes</p>

            {/* Croma-style Bank & Offer Badges */}
            <div className="pdp-offers-box">
              <div className="pdp-offer-item">
                <span className="offer-icon">🏷</span>
                <div>
                  <strong>Special Coupon Offer:</strong> Apply code <span className="pdp-code">SAVE10</span> at checkout for 10% off.
                </div>
              </div>
              <div className="pdp-offer-item">
                <span className="offer-icon">💳</span>
                <div>
                  <strong>No Cost EMI:</strong> Available starting from {formatINR(emiPerMonth)}/month on major credit cards.
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status Bar */}
          <div className="pdp-availability-status-bar">
            <span className="status-dot"></span>
            <strong>{details.availability}</strong>
            <small>({details.dispatchTime})</small>
          </div>

          {/* Check Delivery Availability Section (Croma Style) */}
          <PincodeDeliveryChecker
            savedPincode={deliveryPincode}
            onPincodeChange={onPincodeChange}
            onScrollToStores={scrollToStoreAvailability}
          />

          {/* Croma-style Store Pickup & Availability Preview in Buy Box */}
          {selectedStoreStock && (
            <div className="pdp-store-preview-box">
              <div className="pdp-store-preview-main">
                <span className="pdp-store-badge-icon">🏬</span>
                <div className="pdp-store-preview-text">
                  <div className="pdp-store-preview-label-row">
                    <small>STORE AVAILABILITY</small>
                    <span className={`store-status-badge ${selectedStoreStock.statusClass}`}>
                      {selectedStoreStock.status === 'In Stock' && '✓ '}
                      {selectedStoreStock.status === 'Low Stock' && '⚠ '}
                      {selectedStoreStock.status === 'Out of Stock' && '✕ '}
                      {selectedStoreStock.status}
                    </span>
                  </div>
                  <strong>ElectroHaven {selectedStore.locality}</strong>
                  <p className="pdp-store-stock-qty">
                    {selectedStoreStock.quantity === 0
                      ? 'Currently out of stock at this location'
                      : selectedStoreStock.quantity <= 3
                      ? `Only ${selectedStoreStock.quantity} ${selectedStoreStock.quantity === 1 ? 'unit' : 'units'} left in-store`
                      : `${selectedStoreStock.quantity} units available in-store`}
                  </p>
                </div>
              </div>
              <div className="pdp-store-preview-bottom">
                <span className="pdp-store-pickup-time">⚡ {selectedStoreStock.pickupEstimate}</span>
                <button
                  type="button"
                  className="pdp-store-check-link"
                  onClick={scrollToStoreAvailability}
                >
                  Check all 5 stores ↓
                </button>
              </div>
            </div>
          )}

          {/* Quantity Selector & Purchase Action Buttons */}
          <div className="pdp-actions-container">
            <div className="pdp-quantity-row">
              <span className="pdp-qty-label">Quantity:</span>
              <div className="cart-quantity pdp-qty-stepper">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {savings > 0 && (
                <span className="pdp-total-saving-line">
                  Total savings: {formatINR(savings * quantity)}
                </span>
              )}
            </div>

            <div className="pdp-btn-group pdp-btn-group-3col">
              <button
                className="primary pdp-btn-cart"
                type="button"
                onClick={handleAddToCart}
              >
                <span>🛒</span> Add to Cart
              </button>

              <button
                className="pdp-btn-buynow"
                type="button"
                onClick={handleBuyNow}
              >
                <span>⚡</span> Buy Now
              </button>

              <button
                className="pdp-btn-storepickup"
                type="button"
                onClick={() => setShowPickupModal(true)}
              >
                <span>🏬</span> Pick Up from Store
              </button>
            </div>

            {addedToast && (
              <div className="pdp-added-alert" role="status">
                ✓ Added {quantity} unit{quantity > 1 ? 's' : ''} of {product.name} to your shopping cart!
              </div>
            )}

            {/* Secondary Actions */}
            <div className="pdp-sub-actions">
              <button
                type="button"
                className={`outline-button pdp-compare-btn ${isCompared ? 'active' : ''}`}
                disabled={compareLimitReached}
                onClick={() => toggleCompare(product.id)}
              >
                {isCompared
                  ? '✓ Comparing'
                  : compareLimitReached
                  ? 'Comparison limit (4) reached'
                  : '⇄ Add to Comparison'}
              </button>

              {product.sourceUrl && (
                <a
                  className="product-source pdp-external-link"
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official Manufacturer Page ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section (Croma Style) */}
      <section className="section pdp-section">
        <div className="section-head">
          <div>
            <p className="kicker">HIGHLIGHTS</p>
            <h2>Key Features</h2>
          </div>
        </div>

        <div className="pdp-features-grid">
          {details.keyFeatures.map((feature, idx) => (
            <div key={idx} className="pdp-feature-card">
              <span className="feature-check">✦</span>
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Store-wise Product Availability Section (Croma Style) */}
      <section className="section pdp-section" id="store-availability">
        <div className="section-head pdp-store-avail-head">
          <div>
            <p className="kicker">STORE AVAILABILITY &amp; EXPRESS PICKUP</p>
            <h2>Check Store Availability in Ahmedabad</h2>
            <p className="catalog-description">
              Live stock for <strong>{product.name}</strong> across all 5 official ElectroHaven stores in Ahmedabad.
              Select a store or compare availability across all locations for instant in-store pickup.
            </p>
          </div>
        </div>

        {pickupReservedMessage && (
          <div className="pdp-pickup-reserved-banner" role="status">
            <span>{pickupReservedMessage}</span>
            <button type="button" onClick={() => setPickupReservedMessage('')}>✕</button>
          </div>
        )}

        {/* Toolbar: Location Filter & View Mode */}
        <div className="store-avail-toolbar">
          <div className="store-avail-location-picker">
            <span className="store-avail-filter-label">📍 Your Location (for Distance):</span>
            <div className="store-avail-locality-chips">
              {ahmedabadLocalities.map((loc) => (
                <button
                  key={loc.locality}
                  type="button"
                  className={`store-locality-chip ${selectedLocality === loc.locality ? 'active' : ''}`}
                  onClick={() => setSelectedLocality(loc.locality)}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="store-avail-view-modes">
            <span className="store-avail-filter-label">View Mode:</span>
            <div className="store-avail-view-toggle">
              <button
                type="button"
                className={`store-view-btn ${viewMode === 'all' ? 'active' : ''}`}
                onClick={() => setViewMode('all')}
              >
                All 5 Stores
              </button>
              <button
                type="button"
                className={`store-view-btn ${viewMode === 'single' ? 'active' : ''}`}
                onClick={() => setViewMode('single')}
              >
                Selected Store
              </button>
            </div>

            {viewMode === 'single' && (
              <select
                className="store-select-dropdown"
                value={activeStoreId}
                onChange={(e) => setActiveStoreId(e.target.value)}
                aria-label="Select store to view availability"
              >
                {storesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.locality} – {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Stores Availability Grid */}
        <div className={`store-avail-grid ${viewMode === 'single' ? 'single-view' : ''}`}>
          {storesToDisplay.map((item) => {
            const isPreferred = preferredStore && preferredStore.id === item.store.id;
            return (
              <div
                key={item.store.id}
                className={`store-avail-card ${item.statusClass} ${isPreferred ? 'is-preferred' : ''}`}
              >
                <div className="store-avail-card-head">
                  <div className="store-avail-title-col">
                    <div className="store-avail-tags-row">
                      <span className="store-locality-badge">{item.store.locality}</span>
                      <span className="store-type-badge">{item.store.tag}</span>
                      {isPreferred && <span className="store-my-preferred-badge">★ My Store</span>}
                    </div>
                    <h3 className="store-avail-name">{item.store.name}</h3>
                    <p className="store-avail-address">{item.store.address}</p>
                  </div>

                  <div className="store-avail-stock-col">
                    <span className={`status-pill ${item.statusClass}`}>
                      {item.status === 'In Stock' && '✓ '}
                      {item.status === 'Low Stock' && '⚠ '}
                      {item.status === 'Out of Stock' && '✕ '}
                      {item.status}
                    </span>
                    <strong className="store-stock-count">
                      {item.quantity === 0
                        ? '0 units available'
                        : item.quantity <= 3
                        ? `Only ${item.quantity} ${item.quantity === 1 ? 'unit' : 'units'} left`
                        : `${item.quantity} units in stock`}
                    </strong>
                  </div>
                </div>

                <div className="store-avail-meta-row">
                  {item.distanceKm != null && (
                    <span className="store-meta-distance">
                      📍 <strong>{item.distanceKm} km away</strong> from {selectedLocalityObj?.name || 'Selected Area'}
                    </span>
                  )}
                  <span className="store-meta-hours">
                    🕒 {item.store.openingHours.timing}
                  </span>
                  <span className="store-meta-phone">
                    📞 {item.store.contact}
                  </span>
                </div>

                <div className="store-avail-pickup-note">
                  <span>⚡ {item.pickupEstimate}</span>
                </div>

                <div className="store-avail-card-actions">
                  <button
                    type="button"
                    className={`store-action-pref-btn ${isPreferred ? 'active' : ''}`}
                    onClick={() => handleSetAsPreferred(item.store)}
                    title={isPreferred ? 'This is currently your preferred store' : 'Set as your primary store for shopping'}
                  >
                    {isPreferred ? '★ My Preferred Store' : 'Set as My Store'}
                  </button>

                  <a
                    href={getGoogleMapsDirectionsUrl(item.store, userCoordinates)}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-button store-dir-btn"
                  >
                    Get Directions ↗
                  </a>

                  {item.canExpressPickup ? (
                    <button
                      type="button"
                      className="primary store-pickup-btn"
                      onClick={() => handleReservePickup(item)}
                    >
                      Reserve for Pickup
                    </button>
                  ) : (
                    <span className="store-pickup-disabled-pill">Unavailable in-store</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Specifications Section (Croma Style) */}
      <section className="section pdp-section">
        <div className="section-head">
          <div>
            <p className="kicker">DETAILED BREAKDOWN</p>
            <h2>Technical Specifications</h2>
          </div>
        </div>

        <div className="pdp-specs-container">
          {details.specGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="pdp-spec-group">
              <h3 className="pdp-spec-group-title">{group.title}</h3>
              <table className="pdp-spec-table">
                <tbody>
                  {group.specs.map(([label, val], sIdx) => (
                    <tr key={sIdx}>
                      <th className="pdp-spec-label">{label}</th>
                      <td className="pdp-spec-value">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* Ratings & Customer Reviews Summary (Croma Style) */}
      <section className="section pdp-section">
        <div className="section-head">
          <div>
            <p className="kicker">VERIFIED BUYERS</p>
            <h2>Ratings &amp; Customer Reviews</h2>
          </div>
        </div>

        <div className="pdp-reviews-layout">
          {/* Scorecard */}
          <div className="pdp-scorecard">
            <div className="pdp-overall-score">{details.ratingScore}</div>
            <div className="pdp-score-stars">★★★★★</div>
            <p className="pdp-score-text">Based on {details.reviewsCount} verified purchases</p>
            <div className="pdp-recommendation-pill">
              {details.customerRecommendation}
            </div>

            <div className="pdp-rating-bars">
              {[
                { stars: '5★', pct: '78%' },
                { stars: '4★', pct: '16%' },
                { stars: '3★', pct: '4%' },
                { stars: '2★', pct: '1%' },
                { stars: '1★', pct: '1%' },
              ].map((bar) => (
                <div key={bar.stars} className="pdp-bar-row">
                  <span>{bar.stars}</span>
                  <div className="pdp-bar-track">
                    <div className="pdp-bar-fill" style={{ width: bar.pct }}></div>
                  </div>
                  <small>{bar.pct}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Verified Reviews */}
          <div className="pdp-reviews-list">
            <div className="pdp-review-card">
              <div className="pdp-review-header">
                <strong>Rahul S.</strong>
                <span className="pdp-buyer-badge">✓ Verified Buyer</span>
                <span className="pdp-review-rating">★ 5.0</span>
              </div>
              <p className="pdp-review-comment">
                "Outstanding product quality and performance! The packaging was immaculate and delivery arrived right on time through ElectroHaven. Highly recommended."
              </p>
              <span className="pdp-review-date">Reviewed in India on 18 October 2026</span>
            </div>

            <div className="pdp-review-card">
              <div className="pdp-review-header">
                <strong>Priya M.</strong>
                <span className="pdp-buyer-badge">✓ Verified Buyer</span>
                <span className="pdp-review-rating">★ 4.8</span>
              </div>
              <p className="pdp-review-comment">
                "Exactly matches the manufacturer specifications. Great build finish, vivid clarity, and the coupon discount made it a fantastic value purchase."
              </p>
              <span className="pdp-review-date">Reviewed in India on 12 October 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Return to Shopping footer prompt */}
      <div className="pdp-bottom-cta">
        <button className="primary" type="button" onClick={onNavigateHome}>
          ← Continue Exploring More Electronics
        </button>
      </div>

      {/* Interactive Store Pickup Selection Modal */}
      {showPickupModal && (
        <div className="store-pickup-modal-backdrop" onClick={() => setShowPickupModal(false)}>
          <div className="store-pickup-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="store-pickup-modal-head">
              <div>
                <span className="kicker">CLICK &amp; COLLECT</span>
                <h2>Choose Pickup Store in Ahmedabad</h2>
                <p>
                  Pick up <b>{quantity}x {product.name}</b> in 2 hours for free at any store with sufficient stock.
                </p>
              </div>
              <button
                type="button"
                className="store-pickup-close-btn"
                onClick={() => setShowPickupModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="store-pickup-modal-body">
              <div className="store-pickup-list">
                {allStoresAvailability.map((item) => {
                  const hasStock = item.quantity >= quantity;
                  return (
                    <div
                      key={item.store.id}
                      className={`store-pickup-option-card ${hasStock ? 'available' : 'unavailable'}`}
                    >
                      <div className="store-pickup-card-left">
                        <div className="store-pickup-head-row">
                          <span className="store-pickup-badge-tag">{item.store.locality}</span>
                          <span className={`status-pill ${hasStock ? 'status-delivered' : 'status-cancelled'}`}>
                            {hasStock
                              ? `✓ In Stock (${item.quantity} available)`
                              : item.quantity === 0
                              ? '✕ Out of Stock'
                              : `⚠️ Only ${item.quantity} left (Need ${quantity})`}
                          </span>
                        </div>
                        <h3>{item.store.name}</h3>
                        <p className="store-pickup-addr">{item.store.address}</p>
                        <div className="store-pickup-meta-strip">
                          <span>🕒 {item.store.openingHours.timing}</span>
                          <span>📞 {item.store.contact}</span>
                          {item.distanceKm != null && <span>📍 {item.distanceKm} km away</span>}
                        </div>
                      </div>

                      <div className="store-pickup-card-right">
                        <span className="pickup-speed-badge">⚡ Ready in 2 Hours (FREE)</span>
                        <button
                          type="button"
                          className={hasStock ? 'primary' : 'disabled-btn'}
                          disabled={!hasStock}
                          onClick={() => handleSelectStoreAndCheckout(item.store)}
                        >
                          {hasStock ? 'Pick Up Here →' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
