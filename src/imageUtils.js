// ElectroHaven Product Image Reliability Utilities

export const DEFAULT_PRODUCT_PLACEHOLDER = '/products/placeholder.svg';

/**
 * Handles image load errors gracefully by switching to the ElectroHaven branded SVG placeholder
 * without causing layout thrashing or infinite error loops.
 */
export function handleProductImageError(event) {
  const target = event.currentTarget;
  if (!target) return;
  // Prevent infinite loop if placeholder itself fails
  if (target.dataset.hasFallback === 'true') return;

  target.dataset.hasFallback = 'true';
  target.onerror = null;
  target.src = DEFAULT_PRODUCT_PLACEHOLDER;
  target.classList.add('product-img-fallback');
}

/**
 * Validates whether an image path is a local product asset or valid URL
 */
export function getProductImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') {
    return DEFAULT_PRODUCT_PLACEHOLDER;
  }
  return imagePath;
}
