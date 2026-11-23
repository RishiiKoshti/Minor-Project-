import React, { useState, useMemo, useEffect } from 'react';
import {
  SETUP_PURPOSES,
  BUDGET_PRESETS,
  ECOSYSTEM_PREFERENCES,
  PORTABILITY_PREFERENCES,
  SLOT_DEFINITIONS,
  generateSmartSetups,
  getCandidatesForSlot,
  recalculateCustomSetup,
  getRecommendationReason,
} from './setupBuilderEngine.js';
import { formatINR } from './currency.js';
import { handleProductImageError, getProductImagePath } from './imageUtils.js';
import { getProductStoreStock } from './storeAvailability.js';

export default function SetupBuilderPage({
  allProducts = [],
  onAddToCart,
  onAddMultipleToCart,
  onViewProduct,
  onCompare,
  onNavigate,
  wishlist = [],
  onToggleWishlist,
}) {
  // Setup Configuration State
  const [selectedPurpose, setSelectedPurpose] = useState('gaming');
  const [budget, setBudget] = useState(250000);
  const [budgetInput, setBudgetInput] = useState('250000');
  const [selectedEcosystem, setSelectedEcosystem] = useState('all');
  const [selectedPortability, setSelectedPortability] = useState('balanced');
  const [activeTier, setActiveTier] = useState('balanced'); // 'budget' | 'balanced' | 'performance'

  // Customized Items state (in case user swaps any item manually)
  const [customItems, setCustomItems] = useState(null);

  // Swap Modal state
  const [swapSlot, setSwapSlot] = useState(null); // slotId or null

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);
  const [addedSetupBanner, setAddedSetupBanner] = useState(false);

  // Generate setups based on current configuration
  const setupResult = useMemo(() => {
    return generateSmartSetups(allProducts, {
      purpose: selectedPurpose,
      budget,
      ecosystem: selectedEcosystem,
      portability: selectedPortability,
    });
  }, [allProducts, selectedPurpose, budget, selectedEcosystem, selectedPortability]);

  // When purpose, budget, ecosystem, or portability changes, reset customItems
  useEffect(() => {
    setCustomItems(null);
    setAddedSetupBanner(false);
  }, [selectedPurpose, budget, selectedEcosystem, selectedPortability, activeTier]);

  // Current active tier setup object
  const currentTierSetup = setupResult.tiers[activeTier] || setupResult.tiers.balanced;

  // Active items being displayed (either customized or tier default)
  const activeItems = useMemo(() => {
    if (customItems) return customItems;
    return currentTierSetup.items || [];
  }, [customItems, currentTierSetup]);

  // Active setup financial metrics
  const financialSummary = useMemo(() => {
    if (customItems) {
      return recalculateCustomSetup(customItems, budget);
    }
    return {
      totalPrice: currentTierSetup.totalPrice,
      budget,
      savings: currentTierSetup.savings,
      overBudgetBy: currentTierSetup.overBudgetBy,
      isUnderBudget: currentTierSetup.isUnderBudget,
      itemCount: activeItems.length,
    };
  }, [customItems, currentTierSetup, budget, activeItems]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Handle Budget input changes
  const handleBudgetChange = (newVal) => {
    const val = Math.max(50000, Math.min(1000000, Number(newVal) || 50000));
    setBudget(val);
    setBudgetInput(String(val));
  };

  // Handle Preset Budget click
  const handlePresetClick = (presetVal) => {
    setBudget(presetVal);
    setBudgetInput(String(presetVal));
  };

  // Handle Add Entire Setup to Cart
  const handleAddEntireSetup = () => {
    if (activeItems.length === 0) return;

    if (onAddMultipleToCart) {
      onAddMultipleToCart(activeItems);
    } else if (onAddToCart) {
      activeItems.forEach((item) => onAddToCart(item));
    }

    setAddedSetupBanner(true);
    showToast(`✓ All ${activeItems.length} products added to your cart (${formatINR(financialSummary.totalPrice)})`);
  };

  // Handle Compare Setup products
  const handleCompareSetup = () => {
    if (onCompare && activeItems.length > 0) {
      const ids = activeItems.map((i) => i.id).slice(0, 4);
      onCompare(ids);
    }
  };

  // Handle Copy Setup Specs / Export
  const handleCopySetup = () => {
    const purposeInfo = SETUP_PURPOSES.find((p) => p.id === selectedPurpose);
    let text = `⚡ ElectroHaven AI Smart Setup — ${purposeInfo?.label || 'Custom'} (${activeTier.toUpperCase()} TIER)\n`;
    text += `Total Setup Cost: ${formatINR(financialSummary.totalPrice)} | Budget: ${formatINR(budget)}\n`;
    text += `---------------------------------------------------------\n`;
    activeItems.forEach((item, idx) => {
      text += `${idx + 1}. [${item.slotName}] ${item.name} — ${formatINR(item.price)}\n`;
      text += `   Why: ${item.recommendationReason || item.description}\n`;
    });
    text += `---------------------------------------------------------\nVerified in stock with authentic brand warranty at ElectroHaven.`;

    try {
      navigator.clipboard.writeText(text);
      showToast('📋 Setup specifications copied to clipboard!');
    } catch {
      showToast('Setup specifications ready for order.');
    }
  };

  // Swap / Replace item in active setup
  const handleSwapItem = (newProduct) => {
    if (!swapSlot) return;

    const updated = activeItems.map((item) => {
      if (item.slotId === swapSlot) {
        return {
          ...newProduct,
          slotId: swapSlot,
          slotName: SLOT_DEFINITIONS[swapSlot]?.label || swapSlot,
          slotIcon: SLOT_DEFINITIONS[swapSlot]?.icon || '📦',
          recommendationReason: getRecommendationReason(newProduct, selectedPurpose, activeTier),
        };
      }
      return item;
    });

    setCustomItems(updated);
    setSwapSlot(null);
    showToast(`Swapped in ${newProduct.name}`);
  };

  // Get candidate alternatives for the active swap slot
  const swapAlternatives = useMemo(() => {
    if (!swapSlot) return [];
    return getCandidatesForSlot(swapSlot, allProducts, selectedEcosystem, selectedPurpose);
  }, [swapSlot, allProducts, selectedEcosystem, selectedPurpose]);

  const activePurposeObj = SETUP_PURPOSES.find((p) => p.id === selectedPurpose) || SETUP_PURPOSES[0];

  return (
    <div className="setup-builder-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="setup-builder-toast">
          <span>⚡</span>
          <p>{toastMessage}</p>
          <button type="button" onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* Hero Header */}
      <section className="setup-builder-hero">
        <div className="setup-hero-glow" />
        <div className="setup-hero-content">
          <div className="setup-hero-badges">
            <span className="setup-hero-pill">
              <span>🪄</span> AI SMART SETUP BUILDER
            </span>
            <span className="setup-hero-pill secondary">
              <span>✓</span> Ahmedabad Stores In-Stock Guarantee
            </span>
          </div>

          <h1>
            Build Your <span>Ultimate Workspace Setup</span>
          </h1>
          <p>
            Choose your core purpose, set your target budget, and our intelligent algorithm curates a fully compatible, high-performance ecosystem of flagships from Apple, Dell, Sony, LG, and Lenovo.
          </p>

          <div className="setup-hero-meta-bar">
            <div className="hero-meta-stat">
              <strong>6</strong>
              <span>Curated Disciplines</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-stat">
              <strong>100%</strong>
              <span>Compatible Hardware</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-stat">
              <strong>1-Click</strong>
              <span>Bundle to Cart</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-stat">
              <strong>₹0</strong>
              <span>Ahmedabad Store Pickup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Purpose Selector */}
      <section className="setup-config-section">
        <div className="setup-section-title">
          <span className="step-number">STEP 1</span>
          <h2>Select Your Primary Purpose</h2>
          <p>We tailor processing specs, display refresh rates, acoustics, and input ergonomics to your exact workflow.</p>
        </div>

        <div className="purpose-selection-grid">
          {SETUP_PURPOSES.map((purpose) => {
            const isSelected = selectedPurpose === purpose.id;
            return (
              <button
                key={purpose.id}
                type="button"
                className={`purpose-card ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedPurpose(purpose.id)}
                aria-pressed={isSelected}
              >
                <div className="purpose-card-head">
                  <span className="purpose-icon">{purpose.icon}</span>
                  {isSelected && <span className="purpose-active-check">✓ Active</span>}
                </div>
                <h3>{purpose.label}</h3>
                <span className="purpose-tagline">{purpose.tagline}</span>
                <p>{purpose.description}</p>
                <div className="purpose-slots-preview">
                  {purpose.componentSlots.map((slotKey) => (
                    <span key={slotKey} className="slot-badge-mini" title={SLOT_DEFINITIONS[slotKey]?.label}>
                      {SLOT_DEFINITIONS[slotKey]?.icon}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Budget & Preferences Controls */}
      <section className="setup-config-section">
        <div className="setup-section-title">
          <span className="step-number">STEP 2</span>
          <h2>Define Your Budget & Preferences</h2>
          <p>Our algorithm balances your budget across all components without exceeding your limit.</p>
        </div>

        <div className="budget-controls-card">
          <div className="budget-header-row">
            <div className="budget-label-box">
              <span className="budget-kicker">TOTAL SETUP BUDGET</span>
              <div className="budget-display-amount">
                <span className="currency-sign">₹</span>
                <span className="amount-num">{Number(budget).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="budget-presets-row">
              <span className="presets-label">Quick Presets:</span>
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`budget-preset-chip ${budget === preset.value ? 'active' : ''}`}
                  onClick={() => handlePresetClick(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="budget-slider-wrap">
            <input
              type="range"
              min="80000"
              max="700000"
              step="5000"
              value={budget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              className="setup-budget-slider"
              aria-label="Setup budget range slider"
            />
            <div className="slider-ticks">
              <span>₹80,000 (Starter)</span>
              <span>₹2,50,000 (Pro Mid)</span>
              <span>₹4,50,000 (High-End)</span>
              <span>₹7,00,000 (Flagship Max)</span>
            </div>
          </div>

          {/* Preferences Row */}
          <div className="setup-preferences-grid">
            <div className="pref-group">
              <label htmlFor="pref-ecosystem">
                <span>🍎</span> Preferred Brand Ecosystem:
              </label>
              <select
                id="pref-ecosystem"
                value={selectedEcosystem}
                onChange={(e) => setSelectedEcosystem(e.target.value)}
                className="pref-select"
              >
                {ECOSYSTEM_PREFERENCES.map((eco) => (
                  <option key={eco.id} value={eco.id}>
                    {eco.icon} {eco.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pref-group">
              <label htmlFor="pref-portability">
                <span>⚖️</span> Form Factor & Portability:
              </label>
              <select
                id="pref-portability"
                value={selectedPortability}
                onChange={(e) => setSelectedPortability(e.target.value)}
                className="pref-select"
              >
                {PORTABILITY_PREFERENCES.map((port) => (
                  <option key={port.id} value={port.id}>
                    {port.icon} {port.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Added to Cart Success Banner */}
      {addedSetupBanner && (
        <div className="setup-added-banner">
          <div className="added-banner-icon">🛒</div>
          <div className="added-banner-copy">
            <h3>Setup Successfully Added to Cart!</h3>
            <p>
              All {activeItems.length} products ({formatINR(financialSummary.totalPrice)}) have been bundled into your cart with genuine warranty and store pickup options.
            </p>
          </div>
          <div className="added-banner-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => onNavigate && onNavigate('Cart')}
            >
              View Cart & Checkout →
            </button>
            <button
              type="button"
              className="text-btn"
              onClick={() => setAddedSetupBanner(false)}
            >
              Keep Customizing
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Recommended Setup Results */}
      <section className="setup-results-section" id="setup-results">
        {/* Tier Selector & Financial Overview Bar */}
        <div className="setup-overview-bar">
          <div className="tier-tabs-group" role="tablist" aria-label="Setup Tier Selection">
            <button
              type="button"
              role="tab"
              aria-selected={activeTier === 'budget'}
              className={`tier-tab-btn ${activeTier === 'budget' ? 'active' : ''}`}
              onClick={() => setActiveTier('budget')}
            >
              <span className="tier-badge budget">🟢 Smart Value</span>
              <strong>{formatINR(setupResult.tiers.budget.totalPrice)}</strong>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTier === 'balanced'}
              className={`tier-tab-btn ${activeTier === 'balanced' ? 'active' : ''}`}
              onClick={() => setActiveTier('balanced')}
            >
              <span className="tier-badge balanced">⚡ Recommended Sweet Spot</span>
              <strong>{formatINR(setupResult.tiers.balanced.totalPrice)}</strong>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTier === 'performance'}
              className={`tier-tab-btn ${activeTier === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTier('performance')}
            >
              <span className="tier-badge performance">🚀 Peak Performance</span>
              <strong>{formatINR(setupResult.tiers.performance.totalPrice)}</strong>
            </button>
          </div>

          {/* Pricing & Budget Difference Meter */}
          <div className="setup-financial-pillbox">
            <div className="financial-stat">
              <span className="stat-label">TOTAL SETUP COST</span>
              <strong className="stat-value">{formatINR(financialSummary.totalPrice)}</strong>
            </div>

            <div className="financial-divider" />

            <div className="financial-stat">
              <span className="stat-label">YOUR BUDGET</span>
              <span className="stat-sub">{formatINR(budget)}</span>
            </div>

            <div className="financial-divider" />

            <div className="financial-stat">
              <span className="stat-label">BUDGET STATUS</span>
              {financialSummary.isUnderBudget ? (
                <span className="budget-tag under-budget">
                  ✓ Saves {formatINR(financialSummary.savings)}
                </span>
              ) : (
                <span className="budget-tag over-budget">
                  ⚠️ Over by {formatINR(financialSummary.overBudgetBy)}
                </span>
              )}
            </div>
          </div>

          {/* Setup Action Controls */}
          <div className="setup-action-buttons">
            <button
              type="button"
              className="btn-add-entire-setup"
              onClick={handleAddEntireSetup}
              title="Add all items in this setup directly to your shopping cart"
            >
              <span>🛒</span>
              Add Entire Setup to Cart ({activeItems.length} Items)
            </button>

            <button
              type="button"
              className="btn-setup-action outline"
              onClick={handleCompareSetup}
              title="Compare setup items side-by-side"
            >
              <span>⇄</span> Compare Setup
            </button>

            <button
              type="button"
              className="btn-setup-action secondary"
              onClick={handleCopySetup}
              title="Copy setup breakdown to clipboard"
            >
              <span>📋</span> Copy Specs
            </button>
          </div>
        </div>

        {/* Tier Narrative Banner */}
        <div className="tier-narrative-box">
          <div className="tier-narrative-left">
            <span className="tier-narrative-icon">{activePurposeObj.icon}</span>
            <div>
              <h3>
                {activePurposeObj.label} · {currentTierSetup.tierName}
              </h3>
              <p>{currentTierSetup.headline}. Engineered with genuine Ahmedabad stock and authorized brand warranties.</p>
            </div>
          </div>

          {customItems && (
            <button
              type="button"
              className="btn-reset-custom"
              onClick={() => {
                setCustomItems(null);
                showToast('Reset to default recommendation');
              }}
            >
              ↺ Reset to AI Recommendation
            </button>
          )}
        </div>

        {/* Component Cards Grid */}
        <div className="setup-components-grid">
          {activeItems.map((item, index) => {
            const stockCheck = getProductStoreStock(item.id, 'eh-store-amd-01');
            const isWishlisted = wishlist.includes(item.id);

            return (
              <div key={`${item.slotId}-${item.id}`} className="setup-component-card">
                {/* Slot Header */}
                <div className="component-slot-header">
                  <div className="slot-badge">
                    <span className="slot-icon">{item.slotIcon}</span>
                    <span className="slot-title">{item.slotName}</span>
                  </div>
                  <span className="slot-index">SLOT {index + 1} OF {activeItems.length}</span>
                </div>

                {/* Product Main Info */}
                <div className="component-card-body">
                  <div
                    className="component-img-wrap"
                    onClick={() => onViewProduct && onViewProduct(item)}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={getProductImagePath(item.image)}
                      alt={item.name}
                      onError={handleProductImageError}
                      className="component-thumb"
                      loading="lazy"
                    />
                    {item.discount && <span className="component-discount-badge">{item.discount}</span>}
                  </div>

                  <div className="component-details">
                    <div className="component-category-tag">
                      <span>{item.category?.toUpperCase()}</span>
                      {item.type && <span className="type-dot">· {item.type}</span>}
                    </div>

                    <h4
                      className="component-name"
                      onClick={() => onViewProduct && onViewProduct(item)}
                    >
                      {item.name}
                    </h4>

                    <p className="component-desc">{item.description}</p>

                    {/* Store Availability Badge */}
                    <div className="component-stock-row">
                      <span className={`stock-indicator-pill ${stockCheck.statusClass}`}>
                        <span className="indicator-dot" />
                        {stockCheck.badgeText} (Ahmedabad Stores)
                      </span>
                      <span className="express-pickup-tag">⚡ Ready in 2h</span>
                    </div>

                    {/* Price Row */}
                    <div className="component-price-row">
                      <div className="component-prices">
                        <strong className="component-price">{formatINR(item.price)}</strong>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <del className="component-old-price">{formatINR(item.oldPrice)}</del>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="component-card-actions">
                        <button
                          type="button"
                          className="btn-component-swap"
                          onClick={() => setSwapSlot(item.slotId)}
                          title="Choose a different compatible product for this slot"
                        >
                          <span>🔄</span> Swap
                        </button>

                        <button
                          type="button"
                          className="btn-component-add"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart(item);
                              showToast(`Added ${item.name} to cart`);
                            }
                          }}
                          title="Add only this item to cart"
                        >
                          <span>🛒</span> Add
                        </button>

                        {onToggleWishlist && (
                          <button
                            type="button"
                            className={`btn-component-wish ${isWishlisted ? 'active' : ''}`}
                            onClick={() => onToggleWishlist(item.id)}
                            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                          >
                            {isWishlisted ? '♥' : '♡'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Insight Footer */}
                <div className="component-ai-insight">
                  <div className="ai-insight-head">
                    <span className="ai-spark-icon">✨</span>
                    <strong>WHY THIS IS RECOMMENDED FOR {activePurposeObj.label.toUpperCase()}:</strong>
                  </div>
                  <p className="ai-insight-text">
                    {item.recommendationReason ||
                      `Engineered for optimal synergy with your ${activePurposeObj.label} setup with authentic manufacturer warranty.`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Swap / Replacement Modal */}
      {swapSlot && (
        <div className="setup-swap-modal-backdrop" onClick={() => setSwapSlot(null)}>
          <div className="setup-swap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="swap-modal-head">
              <div>
                <span className="swap-modal-kicker">CUSTOMIZE COMPONENT</span>
                <h3>
                  Replace {SLOT_DEFINITIONS[swapSlot]?.icon} {SLOT_DEFINITIONS[swapSlot]?.label}
                </h3>
                <p>Choose any compatible in-stock alternative from the ElectroHaven catalog.</p>
              </div>
              <button
                type="button"
                className="swap-modal-close"
                onClick={() => setSwapSlot(null)}
                aria-label="Close replacement modal"
              >
                ✕
              </button>
            </div>

            <div className="swap-alternatives-list">
              {swapAlternatives.map((alt) => {
                const currentSlotItem = activeItems.find((i) => i.slotId === swapSlot);
                const isCurrent = currentSlotItem?.id === alt.id;
                const priceDiff = alt.price - (currentSlotItem ? currentSlotItem.price : 0);
                const altStock = getProductStoreStock(alt.id, 'eh-store-amd-01');

                return (
                  <div key={alt.id} className={`swap-item-card ${isCurrent ? 'current' : ''}`}>
                    <img
                      src={getProductImagePath(alt.image)}
                      alt={alt.name}
                      onError={handleProductImageError}
                      className="swap-item-thumb"
                    />

                    <div className="swap-item-meta">
                      <h4>{alt.name}</h4>
                      <p>{alt.description}</p>
                      <div className="swap-item-stock">
                        <span className={`stock-indicator-pill ${altStock.statusClass}`}>
                          {altStock.badgeText}
                        </span>
                      </div>
                    </div>

                    <div className="swap-item-pricing">
                      <strong>{formatINR(alt.price)}</strong>
                      {!isCurrent && (
                        <span className={`price-diff-tag ${priceDiff > 0 ? 'increase' : 'decrease'}`}>
                          {priceDiff > 0 ? `+${formatINR(priceDiff)}` : `-${formatINR(Math.abs(priceDiff))}`}
                        </span>
                      )}
                    </div>

                    <div className="swap-item-action">
                      {isCurrent ? (
                        <span className="current-slot-badge">✓ In Setup</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-select-swap"
                          onClick={() => handleSwapItem(alt)}
                        >
                          Select This
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {swapAlternatives.length === 0 && (
                <div className="swap-empty-state">
                  <p>No alternative compatible products currently available for this slot.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
