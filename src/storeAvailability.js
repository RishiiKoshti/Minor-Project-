import { ahmedabadStores, calculateDistanceKm } from './storesData.js';

export function getActiveStores() {
  try {
    const raw = localStorage.getItem('electrohaven_custom_stores');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return ahmedabadStores;
}

/**
 * Computes stock quantity and status for any product at any store.
 * First checks for admin inventory overrides in localStorage.
 * Otherwise uses a deterministic stable hash.
 */
export function getProductStoreStock(productId, storeId) {
  const pId = Number(productId) || 1;

  // Check admin inventory override
  try {
    const raw = localStorage.getItem('electrohaven_store_inventory');
    if (raw) {
      const inventory = JSON.parse(raw);
      if (inventory[storeId] !== undefined && typeof inventory[storeId][pId] === 'number') {
        const quantity = inventory[storeId][pId];
        let status = 'In Stock';
        let statusClass = 'in-stock';
        let badgeText = `${quantity} in stock`;

        if (quantity === 0) {
          status = 'Out of Stock';
          statusClass = 'out-of-stock';
          badgeText = 'Out of Stock';
        } else if (quantity <= 3) {
          status = 'Low Stock';
          statusClass = 'low-stock';
          badgeText = `Low Stock (${quantity} left)`;
        }

        return {
          productId: pId,
          storeId,
          quantity,
          status,
          statusClass,
          badgeText,
          isAvailable: quantity > 0,
          canExpressPickup: quantity > 0,
          pickupEstimate: quantity > 0 ? 'Ready for Pickup in 2 Hours' : 'Currently Unavailable for Pickup',
        };
      }
    }
  } catch {}

  const stores = getActiveStores();
  const storeIndex = stores.findIndex((s) => s.id === storeId);
  const idx = storeIndex >= 0 ? storeIndex : 0;

  // Deterministic seed formula: unique per (productId, storeIndex)
  const seed = (pId * 19 + idx * 37 + 11) % 100;

  let quantity = 0;
  if (seed < 14) {
    // 14% chance: Out of Stock
    quantity = 0;
  } else if (seed < 38) {
    // 24% chance: Low Stock (1 - 3 units)
    quantity = ((seed + pId) % 3) + 1;
  } else {
    // 62% chance: In Stock (4 - 18 units)
    quantity = ((seed * 3 + idx * 7) % 15) + 4;
  }

  let status = 'In Stock';
  let statusClass = 'in-stock';
  let badgeText = `${quantity} in stock`;

  if (quantity === 0) {
    status = 'Out of Stock';
    statusClass = 'out-of-stock';
    badgeText = 'Out of Stock';
  } else if (quantity <= 3) {
    status = 'Low Stock';
    statusClass = 'low-stock';
    badgeText = `Low Stock (${quantity} left)`;
  }

  return {
    productId: pId,
    storeId,
    quantity,
    status,
    statusClass,
    badgeText,
    isAvailable: quantity > 0,
    canExpressPickup: quantity > 0,
    pickupEstimate: quantity > 0 ? 'Ready for Pickup in 2 Hours' : 'Currently Unavailable for Pickup',
  };
}

/**
 * Retrieves store-wise product availability across all stores,
 * including computed distance if user coordinates or locality is provided.
 */
export function getProductAvailabilityForAllStores(productId, userCoordinates = null) {
  const stores = getActiveStores();
  return stores.map((store, index) => {
    const stockInfo = getProductStoreStock(productId, store.id);

    let distanceKm = null;
    if (userCoordinates && userCoordinates.lat && userCoordinates.lng) {
      distanceKm = calculateDistanceKm(
        userCoordinates.lat,
        userCoordinates.lng,
        store.coordinates.lat,
        store.coordinates.lng
      );
    }

    return {
      store,
      ...stockInfo,
      distanceKm,
    };
  });
}
