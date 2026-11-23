import React, { useState, useMemo } from 'react';
import { formatINR } from './currency';
import { getProductDetails } from './productDetailsData';
import { handleProductImageError } from './imageUtils';

export default function ComparisonPage({
  selectedProducts = [],
  allProducts = [],
  onRemove,
  onAddProduct,
  onClear,
  onAddToCart,
  onViewProduct,
  onContinueShopping,
}) {
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [onlyDiffs, setOnlyDiffs] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');

  // Enrich selected products with comprehensive technical specifications
  const enrichedProducts = useMemo(() => {
    return selectedProducts.map((p) => getProductDetails(p));
  }, [selectedProducts]);

  // Available products to add (excluding already compared)
  const availableToAdd = useMemo(() => {
    const comparedIds = new Set(selectedProducts.map((p) => p.id));
    return allProducts.filter((p) => {
      const notInCompare = !comparedIds.has(p.id);
      const matchesCat = pickerCategory === 'all' || p.category === pickerCategory;
      const matchesQuery = `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(pickerSearch.toLowerCase());
      return notInCompare && matchesCat && matchesQuery;
    });
  }, [allProducts, selectedProducts, pickerCategory, pickerSearch]);

  // Categories for the picker
  const pickerCategories = ['all', 'phones', 'laptops', 'headphones', 'cameras', 'gaming', 'wearables', 'smart home'];

  // Comparison Rows & Groups Definition
  const specSections = useMemo(() => {
    if (!enrichedProducts.length) return [];

    return [
      {
        sectionTitle: 'Price & Offer Details',
        rows: [
          {
            label: 'Current Deal Price',
            getValue: (p) => formatINR(p.price),
          },
          {
            label: 'Original Price (MRP)',
            getValue: (p) => formatINR(p.oldPrice),
          },
          {
            label: 'Discount',
            getValue: (p) => {
              const diff = p.oldPrice - p.price;
              if (diff <= 0) return 'Regular Price';
              const pct = Math.round((diff / p.oldPrice) * 100);
              return `${pct}% OFF (Save ${formatINR(diff)})`;
            },
          },
          {
            label: 'Ratings & Reviews',
            getValue: (p) => `★ ${p.ratingScore} / 5.0 (${p.reviewsCount} reviews)`,
          },
        ],
      },
      {
        sectionTitle: 'General Information',
        rows: [
          {
            label: 'Brand',
            getValue: (p) => p.brand || 'ElectroHaven',
          },
          {
            label: 'Category',
            getValue: (p) => (p.category ? p.category.toUpperCase() : 'ELECTRONICS'),
          },
          {
            label: 'Product Type',
            getValue: (p) => (p.type ? p.type.toUpperCase() : 'Standard'),
          },
          {
            label: 'Series / Model',
            getValue: (p) => p.series || p.modelName || p.name,
          },
          {
            label: 'Stock Availability',
            getValue: (p) => p.availability || 'In Stock',
          },
          {
            label: 'Dispatch Timeline',
            getValue: (p) => p.dispatchTime || 'Within 24 Hours',
          },
          {
            label: 'Warranty Coverage',
            getValue: (p) => p.warranty || '1 Year Manufacturer Warranty',
          },
          {
            label: 'Replacement Policy',
            getValue: (p) => p.returnPolicy || '7 Days Replacement Policy',
          },
        ],
      },
      {
        sectionTitle: 'Key Highlights',
        rows: [
          {
            label: 'Core Highlight 1',
            getValue: (p) => p.keyFeatures?.[0] || 'High performance and reliable engineering',
          },
          {
            label: 'Core Highlight 2',
            getValue: (p) => p.keyFeatures?.[1] || 'Precision build quality with premium materials',
          },
          {
            label: 'Core Highlight 3',
            getValue: (p) => p.keyFeatures?.[2] || 'Advanced power and battery efficiency',
          },
          {
            label: 'Core Highlight 4',
            getValue: (p) => p.keyFeatures?.[3] || 'High-speed wireless and seamless connectivity',
          },
        ],
      },
      {
        sectionTitle: 'Technical Specifications',
        rows: [
          {
            label: 'Hardware Architecture',
            getValue: (p) => {
              const grp = p.specGroups?.find((g) => g.title.includes('Hardware') || g.title.includes('Performance') || g.title.includes('Processor'));
              return grp?.specs?.[0]?.[1] || `${p.name} Performance Architecture`;
            },
          },
          {
            label: 'Display / Audio Technology',
            getValue: (p) => {
              const grp = p.specGroups?.find((g) => g.title.includes('Display') || g.title.includes('Audio'));
              return grp?.specs?.[0]?.[1] || grp?.specs?.[1]?.[1] || 'Standard High Definition';
            },
          },
          {
            label: 'Connectivity & Wireless',
            getValue: (p) => {
              const grp = p.specGroups?.find((g) => g.title.includes('Connectivity') || g.title.includes('Battery'));
              return grp?.specs?.[0]?.[1] || 'USB Type-C & Latest Wireless';
            },
          },
          {
            label: 'Package Contents (In The Box)',
            getValue: (p) => p.inTheBox || 'Main Unit, Charging Cable, Documentation',
          },
        ],
      },
    ];
  }, [enrichedProducts]);

  // Check if a row has differences among selected products
  const checkIsDifferent = (getValue) => {
    if (enrichedProducts.length < 2) return false;
    const values = enrichedProducts.map((p) => String(getValue(p) || '').trim().toLowerCase());
    return new Set(values).size > 1;
  };

  // If no products are selected for comparison
  if (selectedProducts.length === 0) {
    const suggestedProducts = allProducts.slice(0, 4);

    return (
      <section className="section compare-section comparison-page">
        <div className="section-head comparison-head">
          <div>
            <p className="kicker">SIDE-BY-SIDE SPECIFICATIONS</p>
            <h1>Product Comparison</h1>
            <p className="catalog-description">
              Compare specifications, features, and pricing across selected electronics side by side.
            </p>
          </div>
        </div>

        <div className="compare-empty-state">
          <div className="compare-empty-icon">⇄</div>
          <h2>No Products Selected for Comparison</h2>
          <p>
            You can select up to 4 products from any category to inspect their technical specifications,
            features, and pricing side by side.
          </p>

          <div className="compare-empty-actions">
            <button className="primary" type="button" onClick={onContinueShopping}>
              Explore Storefront <b>→</b>
            </button>
            <button className="secondary" type="button" onClick={() => setShowPicker(true)}>
              + Choose Products to Compare
            </button>
          </div>

          {/* Quick select suggestions */}
          <div className="compare-suggestions">
            <p className="compare-suggest-label">POPULAR TECH TO COMPARE</p>
            <div className="compare-suggest-grid">
              {suggestedProducts.map((product) => (
                <div key={product.id} className="compare-suggest-card">
                  <img src={product.image} alt={product.name} onError={handleProductImageError} />
                  <div>
                    <strong>{product.name}</strong>
                    <span className="suggest-price">{formatINR(product.price)}</span>
                  </div>
                  <button
                    className="outline-button"
                    type="button"
                    onClick={() => onAddProduct(product.id)}
                  >
                    + Compare
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Picker Modal */}
        {showPicker && renderPickerModal()}
      </section>
    );
  }

  function renderPickerModal() {
    return (
      <div className="compare-modal-backdrop" onClick={() => setShowPicker(false)}>
        <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
          <div className="compare-modal-head">
            <div>
              <h3>Add Product to Compare</h3>
              <p>Select another product to add to your side-by-side comparison ({selectedProducts.length}/4 selected)</p>
            </div>
            <button className="compare-modal-close" onClick={() => setShowPicker(false)}>✕</button>
          </div>

          <div className="compare-modal-filter">
            <input
              type="text"
              placeholder="Search products by title or brand..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              autoFocus
            />
            <div className="compare-cat-chips">
              {pickerCategories.map((cat) => (
                <button
                  key={cat}
                  className={`chip ${pickerCategory === cat ? 'active' : ''}`}
                  onClick={() => setPickerCategory(cat)}
                  type="button"
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="compare-picker-list">
            {availableToAdd.length ? (
              availableToAdd.map((product) => (
                <div key={product.id} className="compare-picker-item">
                  <img src={product.image} alt={product.name} onError={handleProductImageError} />
                  <div className="compare-picker-info">
                    <strong>{product.name}</strong>
                    <small>{product.description}</small>
                    <div className="compare-picker-price">
                      <b>{formatINR(product.price)}</b>
                      {product.oldPrice > product.price && <del>{formatINR(product.oldPrice)}</del>}
                    </div>
                  </div>
                  <button
                    className="primary compare-picker-add"
                    type="button"
                    onClick={() => {
                      onAddProduct(product.id);
                      if (selectedProducts.length + 1 >= 4) {
                        setShowPicker(false);
                      }
                    }}
                  >
                    + Add
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">No matching products found. Try another query or category.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="section compare-section comparison-page">
      {/* Header and Controls */}
      <div className="section-head comparison-head">
        <div>
          <p className="kicker">SIDE-BY-SIDE SPECIFICATIONS</p>
          <h1>Product Comparison</h1>
          <p className="catalog-description">
            Comparing <strong>{selectedProducts.length}</strong> of <strong>4</strong> items. Analyze
            specifications, key features, and pricing side by side.
          </p>
        </div>

        <div className="compare-actions-bar">
          <label className="compare-toggle-label">
            <input
              type="checkbox"
              checked={highlightDiffs}
              onChange={(e) => setHighlightDiffs(e.target.checked)}
            />
            <span>Highlight differences</span>
          </label>

          <label className="compare-toggle-label">
            <input
              type="checkbox"
              checked={onlyDiffs}
              onChange={(e) => setOnlyDiffs(e.target.checked)}
            />
            <span>Show differences only</span>
          </label>

          {selectedProducts.length < 4 && (
            <button
              className="outline-button compare-add-btn"
              type="button"
              onClick={() => setShowPicker(true)}
            >
              + Add Product
            </button>
          )}

          <button className="text-button compare-clear-btn" type="button" onClick={onClear}>
            Clear all
          </button>
        </div>
      </div>

      {/* Main Comparison Table */}
      <div className="compare-table-container">
        <table className="compare-main-table">
          <thead>
            {/* Top Product Card Headers */}
            <tr className="compare-header-row">
              <th className="compare-attr-corner">
                <div className="corner-card">
                  <span className="corner-icon">⇄</span>
                  <strong>Specifications &amp; Features</strong>
                  <small>
                    {highlightDiffs
                      ? 'Differences highlighted'
                      : 'All attributes shown'}
                  </small>
                </div>
              </th>

              {enrichedProducts.map((product) => {
                const diff = product.oldPrice - product.price;
                const hasDiscount = diff > 0;
                const discountPct = hasDiscount ? Math.round((diff / product.oldPrice) * 100) : 0;

                return (
                  <th key={product.id} className="compare-product-col">
                    <div className="compare-header-card">
                      <button
                        className="compare-remove-icon"
                        type="button"
                        onClick={() => onRemove(product.id)}
                        aria-label={`Remove ${product.name} from comparison`}
                        title="Remove from comparison"
                      >
                        ✕
                      </button>

                      <div
                        className="compare-header-img"
                        onClick={() => onViewProduct && onViewProduct(product)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view details"
                      >
                        <img src={product.image} alt={product.name} onError={handleProductImageError} />
                      </div>

                      <div className="compare-header-info">
                        <span className="compare-category-tag">
                          {product.category ? product.category.toUpperCase() : 'TECH'}
                        </span>
                        <h3
                          onClick={() => onViewProduct && onViewProduct(product)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view details"
                        >
                          {product.name}
                        </h3>

                        <div className="compare-rating-pill">
                          ★ {product.ratingScore} <span>({product.reviewsCount})</span>
                        </div>

                        <div className="compare-price-block">
                          <b className="compare-deal-price">{formatINR(product.price)}</b>
                          {hasDiscount && (
                            <div className="compare-old-line">
                              <del>{formatINR(product.oldPrice)}</del>
                              <span className="discount-tag-inline">{discountPct}% OFF</span>
                            </div>
                          )}
                        </div>

                        <button
                          className="primary compare-cart-btn"
                          type="button"
                          onClick={() => onAddToCart(product)}
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Slot to add another product if < 4 */}
              {selectedProducts.length < 4 && (
                <th className="compare-product-col compare-empty-slot">
                  <div className="compare-add-slot-card" onClick={() => setShowPicker(true)}>
                    <div className="add-slot-circle">+</div>
                    <strong>Add another product</strong>
                    <small>Compare up to 4 items ({4 - selectedProducts.length} slots left)</small>
                    <button className="outline-button" type="button">
                      Select Item
                    </button>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {specSections.map((section, secIdx) => {
              // Filter rows if "onlyDiffs" is active
              const visibleRows = section.rows.filter((row) => {
                if (!onlyDiffs) return true;
                return checkIsDifferent(row.getValue);
              });

              if (onlyDiffs && visibleRows.length === 0) return null;

              return (
                <React.Fragment key={secIdx}>
                  {/* Category Section Divider Header */}
                  <tr className="compare-section-header">
                    <th
                      colSpan={
                        selectedProducts.length +
                        (selectedProducts.length < 4 ? 2 : 1)
                      }
                    >
                      <span>✦</span> {section.sectionTitle}
                    </th>
                  </tr>

                  {/* Specification Rows */}
                  {visibleRows.map((row, rIdx) => {
                    const isDiff = checkIsDifferent(row.getValue);
                    const shouldHighlight = highlightDiffs && isDiff;

                    return (
                      <tr
                        key={rIdx}
                        className={`compare-spec-row ${
                          shouldHighlight ? 'compare-diff-highlight' : ''
                        }`}
                      >
                        <th className="compare-spec-name">
                          <div className="spec-name-wrap">
                            <span>{row.label}</span>
                            {shouldHighlight && (
                              <span className="diff-pill" title="Values differ among products">
                                Diff
                              </span>
                            )}
                          </div>
                        </th>

                        {enrichedProducts.map((product) => {
                          const val = row.getValue(product);
                          return (
                            <td key={product.id} className="compare-spec-val">
                              {val}
                            </td>
                          );
                        })}

                        {/* Filler cell for the empty add slot if present */}
                        {selectedProducts.length < 4 && (
                          <td className="compare-empty-cell">—</td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Return Prompt */}
      <div className="compare-footer-cta">
        <button className="secondary" type="button" onClick={onContinueShopping}>
          ← Continue Browsing Store
        </button>
      </div>

      {/* Product Picker Modal */}
      {showPicker && renderPickerModal()}
    </section>
  );
}
