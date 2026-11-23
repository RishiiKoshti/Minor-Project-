import { categories } from './data.js';

// Map product to recognized brand
export function getProductBrand(product) {
  if (!product) return 'ElectroHaven';
  if (product.brand) return product.brand;
  const name = product.name || '';
  if (name.startsWith('Samsung')) return 'Samsung';
  if (name.startsWith('Apple')) return 'Apple';
  if (name.startsWith('Sony')) return 'Sony';
  if (name.startsWith('Dell')) return 'Dell';
  if (name.startsWith('HP')) return 'HP';
  if (name.startsWith('Lenovo')) return 'Lenovo';
  if (name.startsWith('LG')) return 'LG';
  if (name.startsWith('Logitech')) return 'Logitech';
  if (name.startsWith('SteelSeries')) return 'SteelSeries';
  if (name.startsWith('Nintendo')) return 'Nintendo';
  if (name.startsWith('Xbox') || name.startsWith('Microsoft')) return 'Microsoft';
  if (name.startsWith('Canon')) return 'Canon';
  if (name.startsWith('GoPro')) return 'GoPro';
  if (name.startsWith('Insta360')) return 'Insta360';
  if (name.startsWith('Bose')) return 'Bose';
  if (name.startsWith('Sennheiser')) return 'Sennheiser';
  if (name.startsWith('Amazon')) return 'Amazon';
  if (name.startsWith('Google')) return 'Google';
  if (name.startsWith('TP-Link')) return 'TP-Link';
  if (name.startsWith('Xiaomi')) return 'Xiaomi';
  if (name.startsWith('Philips')) return 'Philips';
  if (name.startsWith('Ray-Ban')) return 'Ray-Ban Meta';
  if (name.startsWith('Fitbit')) return 'Fitbit';
  if (name.startsWith('OPPO')) return 'OPPO';
  if (name.startsWith('vivo')) return 'vivo';
  return name.split(' ')[0] || 'ElectroHaven';
}

export const categoryDisplayMap = {
  phones: 'Smartphones',
  laptops: 'Laptops',
  headphones: 'Headphones & Audio',
  cameras: 'Cameras',
  gaming: 'Gaming',
  wearables: 'Wearables & Watches',
  'smart home': 'Smart Home',
  accessories: 'Accessories',
  tablets: 'Tablets',
};

export const POPULAR_SEARCHES = [
  'iPhone 16 Pro',
  'Samsung Galaxy S24',
  'MacBook Pro 14',
  'Sony WH-1000XM5',
  'Alienware Laptop',
  'PS5 Controller',
  'Nintendo Switch OLED',
  'Apple Watch Ultra 2',
];

/**
 * High-precision product search matching across Name, Brand, Category, Type, and Keywords
 */
export function searchProducts(productList, query) {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) return [];

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  return productList
    .map((product) => {
      const brand = getProductBrand(product).toLowerCase();
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const categoryDisplay = (categoryDisplayMap[category] || '').toLowerCase();
      const type = (product.type || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();

      // Combined searchable text corpus
      const corpus = `${name} ${brand} ${category} ${categoryDisplay} ${type} ${desc}`;

      // Every word token in the query must match somewhere in the product corpus
      const matchesAllTokens = tokens.every((token) => corpus.includes(token));
      if (!matchesAllTokens) return null;

      // Calculate relevance score
      let score = 0;

      // Exact phrase matches
      if (name === cleanQuery) score += 120;
      else if (name.startsWith(cleanQuery)) score += 60;
      else if (name.includes(cleanQuery)) score += 35;

      // Brand matches
      if (brand === cleanQuery) score += 70;
      else if (brand.startsWith(cleanQuery)) score += 40;
      else if (brand.includes(cleanQuery)) score += 20;

      // Category matches
      if (category === cleanQuery || categoryDisplay === cleanQuery) score += 50;
      else if (category.includes(cleanQuery) || categoryDisplay.includes(cleanQuery)) score += 25;

      // Type / Feature matches
      if (type.includes(cleanQuery)) score += 25;
      if (desc.includes(cleanQuery)) score += 15;

      // Boost for discounts / reviews
      if (product.oldPrice > product.price) score += 5;
      if (product.rating && parseFloat(product.rating) >= 4.7) score += 5;

      return { product, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

/**
 * Returns structured search suggestions (matching products, matching brands, matching categories)
 */
export function getSearchSuggestions(productList, query, limit = 5) {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) {
    return {
      products: [],
      categories: [],
      brands: [],
      totalMatches: 0,
    };
  }

  const allMatches = searchProducts(productList, cleanQuery);

  // Detect matching categories
  const matchedCategories = [];
  Object.entries(categoryDisplayMap).forEach(([slug, displayName]) => {
    if (slug.includes(cleanQuery) || displayName.toLowerCase().includes(cleanQuery)) {
      const count = productList.filter((p) => p.category === slug).length;
      if (count > 0) {
        matchedCategories.push({ slug, displayName, count });
      }
    }
  });

  // Detect matching brands
  const uniqueBrands = Array.from(new Set(productList.map(getProductBrand)));
  const matchedBrands = uniqueBrands
    .filter((b) => b.toLowerCase().includes(cleanQuery))
    .map((brand) => ({
      name: brand,
      count: productList.filter((p) => getProductBrand(p) === brand).length,
    }));

  return {
    products: allMatches.slice(0, limit),
    categories: matchedCategories.slice(0, 3),
    brands: matchedBrands.slice(0, 3),
    totalMatches: allMatches.length,
  };
}
