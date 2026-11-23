// ElectroHaven Real-Time Synchronization Engine
// Uses Web standard BroadcastChannel API, cross-tab StorageEvent pub/sub,
// and WebSocket event relays to instantly reflect admin changes across all open pages without refresh.

export const REALTIME_SYNC_CHANNEL_NAME = 'electrohaven_realtime_sync';
export const REALTIME_EVENT_NAME = 'electrohaven_realtime_update';

// BroadcastChannel instance (singleton per tab)
let broadcastChannel = null;
if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(REALTIME_SYNC_CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel not available, falling back to StorageEvent sync:', err);
  }
}

// Active subscribers in the current tab
const subscribers = new Set();

/**
 * Dispatches an event to all local subscribers in this window
 */
function notifyLocalSubscribers(message) {
  subscribers.forEach((callback) => {
    try {
      callback(message);
    } catch (err) {
      console.error('Error in realtime sync subscriber:', err);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: message }));
  }
}

// Listen for incoming cross-tab messages via BroadcastChannel
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event && event.data) {
      notifyLocalSubscribers(event.data);
    }
  };
}

// Listen for cross-tab StorageEvents as robust fallback
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (!event.key) return;

    let entity = null;
    switch (event.key) {
      case 'electrohaven_custom_products':
        entity = 'products';
        break;
      case 'electrohaven_store_inventory':
        entity = 'inventory';
        break;
      case 'electrohaven_custom_stores':
        entity = 'stores';
        break;
      case 'electrohaven_coupons':
        entity = 'coupons';
        break;
      case 'electrohaven_orders':
        entity = 'orders';
        break;
      case 'electrohaven_users':
        entity = 'users';
        break;
      default:
        break;
    }

    if (entity) {
      notifyLocalSubscribers({
        type: 'STORAGE_EVENT',
        entity,
        key: event.key,
        timestamp: Date.now(),
      });
    }
  });

  // Optional Vite Dev Server WebSocket bridge if available
  try {
    if (import.meta && import.meta.hot) {
      import.meta.hot.on('electrohaven:admin-update', (data) => {
        if (data) {
          notifyLocalSubscribers(data);
        }
      });
    }
  } catch {}
}

/**
 * Broadcasts an admin data modification to ALL open tabs/windows
 * @param {string} entity - 'products' | 'inventory' | 'stores' | 'coupons' | 'orders' | 'users'
 * @param {any} payload - optional updated entity data
 */
export function broadcastAdminChange(entity, payload = null) {
  const message = {
    type: 'ADMIN_UPDATE',
    entity,
    payload,
    timestamp: Date.now(),
  };

  // 1. Notify current window/tab immediately
  notifyLocalSubscribers(message);

  // 2. Broadcast across tabs via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (err) {
      console.warn('Failed to post message on BroadcastChannel:', err);
    }
  }

  // 3. Relay across Vite dev server WebSocket if active
  try {
    if (import.meta && import.meta.hot) {
      import.meta.hot.send('electrohaven:admin-update', message);
    }
  } catch {}
}

/**
 * Subscribes a React component or hook to real-time administrative updates.
 * @param {Function} callback - invoked on any real-time update
 * @returns {Function} unsubscribe function
 */
export function subscribeToRealtimeSync(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Synchronizes cart items with latest product prices, titles, images, and availability.
 * Automatically recalculates when an admin edits any product details.
 */
export function synchronizeCartWithLatestProducts(cart, latestProducts) {
  if (!Array.isArray(cart) || cart.length === 0) return [];
  if (!Array.isArray(latestProducts) || latestProducts.length === 0) return cart;

  let changed = false;
  const updatedCart = cart.map((item) => {
    const product = latestProducts.find((p) => p.id === item.id);
    if (!product) return item;

    // Check if price, oldPrice, name, or image changed
    const priceChanged = product.price !== item.price;
    const oldPriceChanged = product.oldPrice !== item.oldPrice;
    const nameChanged = product.name !== item.name;
    const imageChanged = product.image !== item.image;
    const descChanged = product.description !== item.description;

    if (priceChanged || oldPriceChanged || nameChanged || imageChanged || descChanged) {
      changed = true;
      return {
        ...item,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        description: product.description,
        discount: product.discount,
        category: product.category,
      };
    }
    return item;
  });

  return changed ? updatedCart : cart;
}
