// ElectroHaven Client-Side Router & State Persistence Engine
// Preserves active page, product details, category filters, search queries, and history across page refreshes.

const ROUTE_STORAGE_KEY = 'electrohaven_current_route';

export const VALID_PAGES = [
  'Home',
  'Phones',
  'Laptops',
  'Audio',
  'Cameras',
  'Gaming',
  'Wearables',
  'Smart Home',
  'Deals',
  'Build Setup',
  'Wishlist',
  'Cart',
  'Checkout',
  'Orders',
  'OrderConfirmation',
  'Comparison',
  'Stores',
  'Profile',
  'Auth',
  'Admin',
  'Search',
  'Product',
];

/**
 * Normalizes page names to canonical route identifiers
 */
export function normalizePageName(rawPage) {
  if (!rawPage) return 'Home';
  const clean = rawPage.trim().toLowerCase();

  switch (clean) {
    case 'home':
      return 'Home';
    case 'phones':
    case 'smartphones':
      return 'Phones';
    case 'laptops':
      return 'Laptops';
    case 'audio':
    case 'headphones':
      return 'Audio';
    case 'cameras':
      return 'Cameras';
    case 'gaming':
      return 'Gaming';
    case 'wearables':
    case 'smartwatches':
      return 'Wearables';
    case 'smart-home':
    case 'smarthome':
    case 'smart home':
      return 'Smart Home';
    case 'deals':
    case 'hot-deals':
      return 'Deals';
    case 'build-setup':
    case 'buildsetup':
    case 'build setup':
    case 'setup-builder':
    case 'setupbuilder':
    case 'setup':
    case 'builder':
      return 'Build Setup';
    case 'wishlist':
      return 'Wishlist';
    case 'cart':
      return 'Cart';
    case 'checkout':
      return 'Checkout';
    case 'orders':
    case 'order-history':
      return 'Orders';
    case 'orderconfirmation':
    case 'order-confirmation':
      return 'OrderConfirmation';
    case 'comparison':
    case 'compare':
      return 'Comparison';
    case 'stores':
    case 'store-locator':
      return 'Stores';
    case 'profile':
    case 'account':
      return 'Profile';
    case 'auth':
    case 'login':
    case 'signin':
    case 'signup':
      return 'Auth';
    case 'admin':
    case 'dashboard':
      return 'Admin';
    case 'search':
      return 'Search';
    case 'product':
      return 'Product';
    default:
      return 'Home';
  }
}

/**
 * Parses the current URL location (pathname, hash, search) and restores exact state
 */
export function parseCurrentRoute() {
  if (typeof window === 'undefined') {
    return { page: 'Home', category: 'all', productId: null, query: '' };
  }

  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '/';
  const search = window.location.search || '';

  // 1. Check Product Route: /product/12 or #/product/12 or #product/12
  const productMatch =
    hash.match(/^#\/?product\/(\d+)/i) ||
    pathname.match(/^\/?product\/(\d+)/i);
  if (productMatch) {
    const productId = Number(productMatch[1]);
    return {
      page: 'Product',
      productId,
      category: 'all',
      query: '',
    };
  }

  // 2. Check Search Route: /search?q=XYZ or #/search?q=XYZ or #/search/XYZ
  const searchParamMatch = (hash + search).match(/[?&]q=([^&]+)/i);
  const searchPathMatch =
    hash.match(/^#\/?search\/(.+)/i) ||
    pathname.match(/^\/?search\/(.+)/i);

  if (searchParamMatch || searchPathMatch || hash.startsWith('#/search') || pathname === '/search') {
    const rawQuery = searchParamMatch
      ? decodeURIComponent(searchParamMatch[1].replace(/\+/g, ' '))
      : searchPathMatch
      ? decodeURIComponent(searchPathMatch[1])
      : '';
    return {
      page: 'Search',
      query: rawQuery,
      category: 'all',
      productId: null,
    };
  }

  // 3. Check Category Route on Home: #/category/phones or ?category=phones
  const categoryMatch =
    hash.match(/^#\/?category\/([a-z0-9-]+)/i) ||
    (hash + search).match(/[?&]category=([a-z0-9-]+)/i);
  if (categoryMatch) {
    return {
      page: 'Home',
      category: categoryMatch[1].toLowerCase(),
      productId: null,
      query: '',
    };
  }

  // 4. Check Named Page Routes: #/cart, #/admin, #/phones, etc.
  // Extract path from hash (preferred for SPA) or pathname
  let routePath = '';
  if (hash && hash !== '#top' && hash !== '#' && hash !== '#/') {
    routePath = hash.replace(/^#\/?/, '').split('?')[0].split('/')[0];
  } else if (pathname && pathname !== '/' && pathname !== '/index.html') {
    routePath = pathname.replace(/^\//, '').split('?')[0].split('/')[0];
  }

  if (routePath) {
    const normalized = normalizePageName(routePath);
    if (VALID_PAGES.includes(normalized)) {
      return {
        page: normalized,
        category: 'all',
        productId: null,
        query: '',
      };
    }
  }

  // 5. Fallback: Check persisted route in sessionStorage
  try {
    const saved = sessionStorage.getItem(ROUTE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.page && VALID_PAGES.includes(parsed.page)) {
        return {
          page: parsed.page,
          category: parsed.category || 'all',
          productId: parsed.productId || null,
          query: parsed.query || '',
        };
      }
    }
  } catch {}

  // Default to Home
  return { page: 'Home', category: 'all', productId: null, query: '' };
}

/**
 * Builds the canonical hash URL for any route
 */
export function buildRouteUrl(route) {
  const { page, productId, category, query } = route;

  if (page === 'Product' && productId) {
    return `#/product/${productId}`;
  }
  if (page === 'Search') {
    return query ? `#/search?q=${encodeURIComponent(query)}` : '#/search';
  }
  if (page === 'Home') {
    if (category && category !== 'all') {
      return `#/category/${category}`;
    }
    return '#/';
  }

  const slug = page.toLowerCase().replace(/\s+/g, '-');
  return `#/${slug}`;
}

/**
 * Updates browser history, URL hash, and session persistence
 */
export function persistRoute(route, replace = false) {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(route));
  } catch {}

  const targetUrl = buildRouteUrl(route);

  // If hash is already up to date, avoid duplicate history entries
  if (window.location.hash === targetUrl) {
    return;
  }

  if (replace) {
    window.history.replaceState({ route }, '', targetUrl);
  } else {
    window.history.pushState({ route }, '', targetUrl);
  }
}
