import React, { useMemo, useState } from 'react';
import { formatINR } from './currency';
import { getProductBrand, categoryDisplayMap, POPULAR_SEARCHES, searchProducts } from './searchUtils';

export default function SearchResultsPage({
  query,
  allProducts,
  addToCart,
  wishlist,
  toggleWishlist,
  compareIds,
  toggleCompare,
  onViewProduct,
  onSearch,
  onClearSearch,
  onContinueShopping,
  ProductCardComponent,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Search all products by name, brand, category, type, and keywords
  const matchedProducts = useMemo(() => {
    return searchProducts(allProducts, query);
  }, [allProducts, query]);

  // Extract categories present in the results
  const resultCategories = useMemo(() => {
    const counts = {};
    matchedProducts.forEach((p) => {
      const cat = p.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([slug, count]) => ({
      slug,
      name: categoryDisplayMap[slug] || slug.toUpperCase(),
      count,
    }));
  }, [matchedProducts]);

  // Filter and sort products
  const displayProducts = useMemo(() => {
    let list = [...matchedProducts];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === 'discount') {
      const getDiscountPct = (p) => (p.oldPrice > p.price ? (p.oldPrice - p.price) / p.oldPrice : 0);
      list.sort((a, b) => getDiscountPct(b) - getDiscountPct(a));
    }
    // 'relevance' maintains the order returned by searchProducts

    return list;
  }, [matchedProducts, selectedCategory, sortBy]);

  return (
    <section className="section search-results-page">
      <div className="section-head search-results-head">
        <div>
          <p className="kicker">SEARCH RESULTS</p>
          <h1>
            Results for <span>“{query}”</span>
          </h1>
          <p className="catalog-description">
            {matchedProducts.length > 0
              ? `Found ${matchedProducts.length} ${matchedProducts.length === 1 ? 'match' : 'matches'} across name, brand, category, and technical specifications.`
              : `No exact matches found for your query.`}
          </p>
        </div>
        <div className="search-results-top-actions">
          <button className="text-button" type="button" onClick={onClearSearch}>
            ✕ Clear search
          </button>
          <button className="text-button" type="button" onClick={onContinueShopping}>
            ← Back to Home
          </button>
        </div>
      </div>

      {matchedProducts.length > 0 ? (
        <>
          {/* Filter & Sort Controls */}
          <div className="search-controls-bar">
            <div className="search-category-chips" role="tablist" aria-label="Filter results by category">
              <button
                type="button"
                className={`search-cat-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All <span>({matchedProducts.length})</span>
              </button>
              {resultCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  className={`search-cat-chip ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name} <span>({cat.count})</span>
                </button>
              ))}
            </div>

            <div className="search-sort-wrap">
              <label htmlFor="search-sort-select">Sort by:</label>
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="search-sort-select"
              >
                <option value="relevance">Best Match (Relevance)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {displayProducts.length > 0 ? (
            <div className="product-grid">
              {displayProducts.map((product) => (
                <ProductCardComponent
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
            <div className="empty-state search-empty-state">
              <p>No products match the selected category filter.</p>
              <button className="outline-button" onClick={() => setSelectedCategory('all')}>
                Show all {matchedProducts.length} results
              </button>
            </div>
          )}
        </>
      ) : (
        /* No-Results State */
        <div className="empty-state search-empty-state">
          <div className="search-empty-icon">⌕</div>
          <h2>No products found for “{query}”</h2>
          <p>
            We couldn’t find any electronics matching your query. Double-check your spelling, or try searching by brand,
            product category, or feature (e.g. 4K, OLED, Noise Cancelling).
          </p>

          <div className="search-popular-suggestions">
            <span className="search-popular-label">Popular Searches:</span>
            <div className="search-popular-chips">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="search-suggestion-chip"
                  onClick={() => onSearch && onSearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="search-empty-actions">
            <button className="primary" type="button" onClick={onContinueShopping}>
              Explore All Products <b>→</b>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
