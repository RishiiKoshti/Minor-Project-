import React, { useState, useEffect, useRef, useMemo } from 'react';
import { formatINR } from './currency';
import { getProductBrand, categoryDisplayMap, POPULAR_SEARCHES, getSearchSuggestions } from './searchUtils';
import { handleProductImageError } from './imageUtils';

export default function SearchBar({
  search,
  setSearch,
  products,
  onSearchSubmit,
  onViewProduct,
  onSelectCategory,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Compute suggestions based on current search input
  const suggestions = useMemo(() => {
    return getSearchSuggestions(products, search, 5);
  }, [products, search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Reset highlight index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [search]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearch('');
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const query = search.trim();
    if (!query) return;

    // If an item was highlighted with arrow keys, view it
    if (highlightedIndex >= 0 && suggestions.products[highlightedIndex]) {
      handleSelectProduct(suggestions.products[highlightedIndex]);
      return;
    }

    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  const handleSelectProduct = (product) => {
    setIsOpen(false);
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  const handleSelectCategory = (catSlug) => {
    setIsOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catSlug);
    }
  };

  const handlePopularSearch = (term) => {
    setSearch(term);
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((prev) =>
        prev < suggestions.products.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) return;
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.products.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions.products[highlightedIndex]) {
        e.preventDefault();
        handleSelectProduct(suggestions.products[highlightedIndex]);
      } else {
        handleSubmit(e);
      }
    }
  };

  const hasQuery = search.trim().length > 0;

  return (
    <div className="search-wrapper" ref={containerRef}>
      <form className="search" onSubmit={handleSubmit} role="search">
        <span className="search-lens-btn" onClick={handleSubmit} title="Search">
          ⌕
        </span>
        <input
          ref={inputRef}
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, and more..."
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoComplete="off"
          spellCheck="false"
        />
        {hasQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search input"
          >
            ✕
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="search-dropdown" role="listbox">
          {hasQuery ? (
            suggestions.products.length > 0 ? (
              <>
                {/* Matched Categories & Brands header if any */}
                {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                  <div className="search-quick-tags">
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        className="search-tag-chip"
                        onClick={() => handleSelectCategory(cat.slug)}
                        title={`Browse in ${cat.displayName}`}
                      >
                        <span className="tag-type">Category:</span> {cat.displayName}{' '}
                        <small>({cat.count})</small>
                      </button>
                    ))}
                    {suggestions.brands.map((brand) => (
                      <button
                        key={brand.name}
                        type="button"
                        className="search-tag-chip search-brand-chip"
                        onClick={() => {
                          setSearch(brand.name);
                          if (onSearchSubmit) onSearchSubmit(brand.name);
                          setIsOpen(false);
                        }}
                        title={`Search ${brand.name}`}
                      >
                        <span className="tag-type">Brand:</span> {brand.name}{' '}
                        <small>({brand.count})</small>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions Label */}
                <div className="search-dropdown-section-title">
                  <span>MATCHING PRODUCTS</span>
                  <small>{suggestions.totalMatches} found</small>
                </div>

                {/* Product Suggestions List */}
                <div className="search-suggestions-list">
                  {suggestions.products.map((product, idx) => {
                    const brand = getProductBrand(product);
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <div
                        key={product.id}
                        className={`search-suggestion-item ${isHighlighted ? 'highlighted' : ''}`}
                        onClick={() => handleSelectProduct(product)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        role="option"
                        aria-selected={isHighlighted}
                      >
                        <div className="suggestion-img-wrap">
                          <img src={product.image} alt={product.name} loading="lazy" onError={handleProductImageError} />
                        </div>
                        <div className="suggestion-info">
                          <div className="suggestion-title-row">
                            <span className="suggestion-brand">{brand}</span>
                            <span className="suggestion-name">{product.name}</span>
                          </div>
                          <div className="suggestion-meta">
                            <span className="suggestion-cat">
                              {categoryDisplayMap[product.category] || product.category}
                            </span>
                            {product.rating && (
                              <span className="suggestion-rating">★ {product.rating}</span>
                            )}
                          </div>
                        </div>
                        <div className="suggestion-price-col">
                          <b>{formatINR(product.price)}</b>
                          {product.oldPrice > product.price && (
                            <del>{formatINR(product.oldPrice)}</del>
                          )}
                        </div>
                        <span className="suggestion-arrow">→</span>
                      </div>
                    );
                  })}
                </div>

                {/* View All Results Button */}
                <button
                  type="button"
                  className="search-dropdown-view-all"
                  onClick={handleSubmit}
                >
                  <span>View all {suggestions.totalMatches} results for “{search.trim()}”</span>
                  <b>→</b>
                </button>
              </>
            ) : (
              /* No matching results in dropdown */
              <div className="search-dropdown-empty">
                <div className="search-dropdown-empty-icon">⌕</div>
                <strong>No products matching “{search.trim()}”</strong>
                <p>Check your spelling, or try searching with general keywords or popular brands.</p>
                <div className="search-dropdown-quick-terms">
                  <span>Try searching:</span>
                  <div className="search-quick-pills">
                    {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handlePopularSearch(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Empty input: show popular searches */
            <div className="search-dropdown-popular">
              <div className="search-dropdown-section-title">
                <span>POPULAR SEARCHES</span>
              </div>
              <div className="search-popular-list">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="search-popular-item"
                    onClick={() => handlePopularSearch(term)}
                  >
                    <span className="search-popular-icon">🔥</span>
                    <span>{term}</span>
                    <span className="search-popular-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
