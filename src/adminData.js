// ElectroHaven Unified Admin Data Layer & Persistence Engine
// Synchronizes Products, Stores, Inventory, Orders, Users, and Offers across the entire website.

import { products as defaultProducts } from './data.js';
import { ahmedabadStores as defaultStores } from './storesData.js';
import { availableCoupons as defaultCoupons, getStoredOrders, saveStoredOrder } from './cart.js';
import { getStoredUsers, hashPassword, generateSalt } from './auth.js';
import { broadcastAdminChange, REALTIME_EVENT_NAME } from './realtimeSync.js';

// LocalStorage Keys
export const STORAGE_KEYS = {
  PRODUCTS: 'electrohaven_custom_products',
  STORES: 'electrohaven_custom_stores',
  STORE_INVENTORY: 'electrohaven_store_inventory',
  WAREHOUSE_STOCK: 'electrohaven_warehouse_stock',
  COUPONS: 'electrohaven_coupons',
  HOT_DEALS: 'electrohaven_hot_deals_ids',
  ORDERS: 'electrohaven_orders',
  USERS: 'electrohaven_users',
};

// Event dispatched to synchronize components across windows or state hooks
export const ADMIN_DATA_CHANGED_EVENT = REALTIME_EVENT_NAME;

export function notifyAdminDataChanged(entity, payload = null) {
  broadcastAdminChange(entity, payload);
}

/* ==========================================================================
   1. PRODUCTS MANAGEMENT
   ========================================================================== */

export function getAdminProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      // First time initialization: copy default 51 products
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProducts;
  } catch (err) {
    console.warn('Failed to parse products from localStorage:', err);
    return defaultProducts;
  }
}

export function saveAdminProducts(productsList) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
    notifyAdminDataChanged('products', productsList);
  } catch (err) {
    console.error('Failed to save products to localStorage:', err);
  }
}

export function addAdminProduct(newProductData) {
  const products = getAdminProducts();
  const maxId = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  const nextId = maxId + 1;

  const product = {
    id: nextId,
    name: newProductData.name?.trim() || `ElectroHaven Device ${nextId}`,
    description: newProductData.description?.trim() || '',
    price: Number(newProductData.price) || 9999,
    oldPrice: Number(newProductData.oldPrice) || Number(newProductData.price) || 9999,
    discount: newProductData.discount?.trim() || '',
    category: newProductData.category?.trim().toLowerCase() || 'accessories',
    type: newProductData.type?.trim() || 'electronics',
    rating: newProductData.rating ? String(newProductData.rating) : '4.8',
    reviews: newProductData.reviews ? String(newProductData.reviews) : '25+',
    image: newProductData.image || '/products/apple-airpods-pro-2.jpg',
    gallery: Array.isArray(newProductData.gallery) ? newProductData.gallery : [newProductData.image],
    isHotDeal: Boolean(newProductData.isHotDeal),
    specifications: newProductData.specifications || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [product, ...products];
  saveAdminProducts(updated);

  // Set initial stock for all stores
  if (newProductData.initialStock !== undefined) {
    const stockQty = Math.max(0, Number(newProductData.initialStock) || 10);
    const stores = getAdminStores();
    stores.forEach((st) => {
      updateAdminProductStoreStock(product.id, st.id, stockQty, false);
    });
    notifyAdminDataChanged('inventory');
  }

  return product;
}

export function updateAdminProduct(id, updatedFields) {
  const pId = Number(id);
  const products = getAdminProducts();
  const index = products.findIndex((p) => Number(p.id) === pId);
  if (index === -1) return null;

  const current = products[index];
  const updatedProduct = {
    ...current,
    ...updatedFields,
    id: current.id, // Immutable ID
    price: updatedFields.price !== undefined ? Number(updatedFields.price) : current.price,
    oldPrice: updatedFields.oldPrice !== undefined ? Number(updatedFields.oldPrice) : current.oldPrice,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  saveAdminProducts(products);
  return updatedProduct;
}

export function deleteAdminProduct(id) {
  const pId = Number(id);
  const products = getAdminProducts();
  const filtered = products.filter((p) => Number(p.id) !== pId);
  saveAdminProducts(filtered);
  return true;
}

export function toggleAdminProductHotDeal(id, isDeal, customDiscount = null) {
  const pId = Number(id);
  const products = getAdminProducts();
  const product = products.find((p) => Number(p.id) === pId);
  if (!product) return null;

  const updatedDiscount = isDeal
    ? (customDiscount || (product.discount && product.discount.includes('OFF') ? product.discount : '15% OFF'))
    : (product.oldPrice > product.price ? `${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF` : '');

  return updateAdminProduct(pId, {
    isHotDeal: isDeal,
    discount: updatedDiscount,
  });
}

/* ==========================================================================
   2. STORE LOCATIONS MANAGEMENT
   ========================================================================== */

export function getAdminStores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(defaultStores));
      return defaultStores;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultStores;
  } catch {
    return defaultStores;
  }
}

export function saveAdminStores(storesList) {
  try {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(storesList));
    notifyAdminDataChanged('stores', storesList);
  } catch (err) {
    console.error('Failed to save stores to localStorage:', err);
  }
}

export function addAdminStore(storeData) {
  const stores = getAdminStores();
  const count = stores.length + 1;
  const newId = storeData.id || `eh-store-amd-0${count > 9 ? count : '0' + count}`;

  const newStore = {
    id: newId,
    name: storeData.name?.trim() || `ElectroHaven Hub, ${storeData.locality || 'Ahmedabad'}`,
    locality: storeData.locality?.trim() || 'Ahmedabad',
    city: storeData.city?.trim() || 'Ahmedabad',
    state: storeData.state?.trim() || 'Gujarat',
    pincode: storeData.pincode?.trim() || '380001',
    address: storeData.address?.trim() || '',
    coordinates: {
      lat: Number(storeData.lat) || 23.0225,
      lng: Number(storeData.lng) || 72.5714,
    },
    contact: storeData.contact?.trim() || '+91 79 4000 0000',
    altContact: storeData.altContact?.trim() || '+91 98250 00000',
    email: storeData.email?.trim() || 'support@electrohaven.in',
    openingHours: {
      days: storeData.days || 'Monday – Sunday (All 7 Days)',
      timing: storeData.timing || '10:00 AM – 9:00 PM',
      note: storeData.note || 'Official ElectroHaven Store',
    },
    status: storeData.status || 'Open Now',
    tag: storeData.tag || 'Retail Store',
    amenities: Array.isArray(storeData.amenities) && storeData.amenities.length > 0
      ? storeData.amenities
      : [
          'In-Store Order Pickup',
          'Demo & Experience Lounge',
          'Express Device Repair Hub',
          'Instant Phone & Laptop Exchange',
        ],
    createdAt: new Date().toISOString(),
  };

  const updated = [...stores, newStore];
  saveAdminStores(updated);
  return newStore;
}

export function updateAdminStore(storeId, updatedFields) {
  const stores = getAdminStores();
  const index = stores.findIndex((s) => s.id === storeId);
  if (index === -1) return null;

  const current = stores[index];
  const updatedStore = {
    ...current,
    ...updatedFields,
    id: current.id,
    coordinates: {
      ...current.coordinates,
      ...(updatedFields.coordinates || {}),
    },
    openingHours: {
      ...current.openingHours,
      ...(updatedFields.openingHours || {}),
    },
  };

  stores[index] = updatedStore;
  saveAdminStores(stores);
  return updatedStore;
}

export function deleteAdminStore(storeId) {
  const stores = getAdminStores();
  if (stores.length <= 1) {
    return { success: false, error: 'Cannot delete the only remaining store location.' };
  }
  const filtered = stores.filter((s) => s.id !== storeId);
  saveAdminStores(filtered);
  return { success: true };
}

/* ==========================================================================
   3. INVENTORY & STOCK MANAGEMENT (STORE-WISE & WAREHOUSE)
   ========================================================================== */

export function getAdminStoreInventoryMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_INVENTORY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAdminStoreInventoryMap(inventoryMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_INVENTORY, JSON.stringify(inventoryMap));
    notifyAdminDataChanged('inventory', inventoryMap);
  } catch (err) {
    console.error('Failed to save store inventory:', err);
  }
}

/**
 * Gets the current stock of a product at a specific store.
 * If explicitly saved in inventory map, uses it.
 * Otherwise uses the initial deterministic calculation.
 */
export function getAdminProductStoreStock(productId, storeId) {
  const pId = Number(productId) || 1;
  const inventoryMap = getAdminStoreInventoryMap();

  if (
    inventoryMap[storeId] !== undefined &&
    typeof inventoryMap[storeId][pId] === 'number'
  ) {
    return inventoryMap[storeId][pId];
  }

  // Fallback to initial formula
  const stores = getAdminStores();
  const storeIndex = stores.findIndex((s) => s.id === storeId);
  const idx = storeIndex >= 0 ? storeIndex : 0;
  const seed = (pId * 19 + idx * 37 + 11) % 100;

  if (seed < 14) return 0;
  if (seed < 38) return ((seed + pId) % 3) + 1;
  return ((seed * 3 + idx * 7) % 15) + 4;
}

export function updateAdminProductStoreStock(productId, storeId, newQuantity, notify = true) {
  const pId = Number(productId);
  const qty = Math.max(0, Math.floor(Number(newQuantity) || 0));
  const inventoryMap = getAdminStoreInventoryMap();

  if (!inventoryMap[storeId]) {
    inventoryMap[storeId] = {};
  }
  inventoryMap[storeId][pId] = qty;

  saveAdminStoreInventoryMap(inventoryMap);
  if (notify) {
    notifyAdminDataChanged('inventory', { productId: pId, storeId, quantity: qty });
  }
  return qty;
}

/**
 * Gets aggregated overall stock for a product across all stores
 */
export function getAdminProductTotalStock(productId) {
  const pId = Number(productId);
  const stores = getAdminStores();
  let total = 0;
  for (const st of stores) {
    total += getAdminProductStoreStock(pId, st.id);
  }
  return total;
}

/* ==========================================================================
   4. ORDER MANAGEMENT
   ========================================================================== */

/* ==========================================================================
   4. ORDERS MANAGEMENT, TRACKING & CANCELLATION
   ========================================================================== */

export const ORDER_STATUS_FLOW = [
  'Order Placed',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const PICKUP_STATUS_FLOW = [
  'Order Placed',
  'Preparing',
  'Ready for Pickup',
  'Collected',
];

/**
 * Checks real-time stock availability for an entire cart at a given store location.
 * Validates whether each product has sufficient stock for the requested quantity.
 */
export function getStoreCartStockAvailability(storeId, cart) {
  if (!cart || cart.length === 0) {
    return { isAvailable: true, outOfStockItems: [], items: [] };
  }

  const items = cart.map((item) => {
    const availableQty = getAdminProductStoreStock(item.id, storeId);
    const hasEnough = availableQty >= item.quantity;
    return {
      id: item.id,
      name: item.name,
      requestedQuantity: item.quantity,
      availableQuantity: availableQty,
      hasEnough,
    };
  });

  const outOfStockItems = items.filter((i) => !i.hasEnough);
  const isAvailable = outOfStockItems.length === 0;

  return {
    storeId,
    isAvailable,
    outOfStockItems,
    items,
  };
}

/**
 * Checks if an order status is eligible for cancellation.
 * For store pickup: allowed while Preparing or Ready for Pickup (before customer Collection).
 * For delivery: allowed before dispatch (Order Placed, Confirmed, Packed).
 */
export function isOrderCancellable(status, fulfillmentType = 'delivery') {
  if (!status) return true;
  const s = status.trim().toLowerCase();
  if (s === 'cancelled' || s === 'delivered' || s === 'collected' || s === 'shipped' || s === 'out for delivery') {
    return false;
  }
  if (fulfillmentType === 'store_pickup') {
    return s === 'order placed' || s === 'preparing' || s === 'ready for pickup';
  }
  return s === 'order placed' || s === 'confirmed' || s === 'packed' || s === 'processing';
}

/**
 * Automatically reserves/deducts stock for items in a newly placed order
 */
export function deductAdminProductStockForOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return false;
  try {
    const products = getAdminProducts();
    const inventoryMap = getAdminStoreInventoryMap();
    const storeId = order.pickupStore?.id || order.storeId || 'eh-store-amd-01';
    if (!inventoryMap[storeId]) inventoryMap[storeId] = {};

    let productsChanged = false;

    order.items.forEach((item) => {
      const pId = Number(item.id);
      const qty = Number(item.quantity) || 1;

      // 1. Deduct catalog stock
      const prodIndex = products.findIndex((p) => p.id === pId);
      if (prodIndex !== -1) {
        const currentStock = typeof products[prodIndex].stock === 'number' ? products[prodIndex].stock : 25;
        products[prodIndex].stock = Math.max(0, currentStock - qty);
        productsChanged = true;
      }

      // 2. Deduct store stock
      const currentStoreStock = typeof inventoryMap[storeId][pId] === 'number'
        ? inventoryMap[storeId][pId]
        : getAdminProductStoreStock(pId, storeId);
      inventoryMap[storeId][pId] = Math.max(0, currentStoreStock - qty);
    });

    if (productsChanged) {
      saveAdminProducts(products);
    }
    saveAdminStoreInventoryMap(inventoryMap);
    return true;
  } catch (err) {
    console.error('Failed to deduct order stock:', err);
    return false;
  }
}

/**
 * Automatically restores reserved inventory when an order is cancelled
 */
export function restoreAdminProductStockForOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return false;
  if (order.inventoryRestored) return false; // Avoid double restoration

  try {
    const products = getAdminProducts();
    const inventoryMap = getAdminStoreInventoryMap();
    const storeId = order.pickupStore?.id || order.storeId || 'eh-store-amd-01';
    if (!inventoryMap[storeId]) inventoryMap[storeId] = {};

    let productsChanged = false;

    order.items.forEach((item) => {
      const pId = Number(item.id);
      const qty = Number(item.quantity) || 1;

      // 1. Restore catalog stock
      const prodIndex = products.findIndex((p) => p.id === pId);
      if (prodIndex !== -1) {
        const currentStock = typeof products[prodIndex].stock === 'number' ? products[prodIndex].stock : 0;
        products[prodIndex].stock = currentStock + qty;
        productsChanged = true;
      }

      // 2. Restore store stock
      const currentStoreStock = typeof inventoryMap[storeId][pId] === 'number'
        ? inventoryMap[storeId][pId]
        : getAdminProductStoreStock(pId, storeId);
      inventoryMap[storeId][pId] = currentStoreStock + qty;
    });

    if (productsChanged) {
      saveAdminProducts(products);
    }
    saveAdminStoreInventoryMap(inventoryMap);
    return true;
  } catch (err) {
    console.error('Failed to restore order stock:', err);
    return false;
  }
}

export function getAdminOrders() {
  return getStoredOrders(); // From cart.js, reads 'electrohaven_orders'
}

/**
 * Cancels an order (Customer or Admin initiated), restoring inventory automatically
 */
export function cancelCustomerOrder(orderId, cancellationReason = 'Cancelled by Customer', cancelledBy = 'Customer') {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return { success: false, message: 'No orders found' };
    const orders = JSON.parse(raw);
    const index = orders.findIndex((o) => (o.orderId || o.id) === orderId);
    if (index === -1) return { success: false, message: 'Order not found' };

    const currentOrder = orders[index];
    const currentStatus = currentOrder.orderStatus || currentOrder.status || 'Order Placed';

    if (!isOrderCancellable(currentStatus, currentOrder.fulfillmentType)) {
      const lockReason = currentOrder.fulfillmentType === 'store_pickup'
        ? `Store pickup orders cannot be cancelled after customer collection ('${currentStatus}').`
        : `Orders cannot be cancelled after dispatch ('${currentStatus}').`;
      return {
        success: false,
        message: lockReason,
      };
    }

    // Automatically restore reserved inventory!
    restoreAdminProductStockForOrder(currentOrder);

    const timestamp = new Date().toISOString();
    const statusHistory = Array.isArray(currentOrder.statusHistory)
      ? [...currentOrder.statusHistory]
      : [
          {
            status: currentStatus,
            date: currentOrder.createdAt || timestamp,
            note: 'Order placed',
          },
        ];

    statusHistory.push({
      status: 'Cancelled',
      date: timestamp,
      note: `${cancellationReason} (Cancelled by ${cancelledBy})`,
      cancelledBy,
      reason: cancellationReason,
    });

    const updatedOrder = {
      ...currentOrder,
      orderStatus: 'Cancelled',
      status: 'Cancelled',
      inventoryRestored: true,
      cancelledAt: timestamp,
      cancellationReason,
      cancelledBy,
      updatedAt: timestamp,
      statusHistory,
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyAdminDataChanged('orders', updatedOrder);

    return { success: true, order: updatedOrder };
  } catch (err) {
    console.error('Failed to cancel order:', err);
    return { success: false, message: err.message };
  }
}

export function updateAdminOrderStatus(orderId, newStatus, adminNote = '', trackingDetails = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return null;
    const orders = JSON.parse(raw);
    const index = orders.findIndex((o) => (o.orderId || o.id) === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    const timestamp = new Date().toISOString();

    // If order status is being changed to Cancelled, restore reserved stock!
    if (newStatus === 'Cancelled') {
      restoreAdminProductStockForOrder(currentOrder);
    }

    const statusHistory = Array.isArray(currentOrder.statusHistory)
      ? [...currentOrder.statusHistory]
      : [
          {
            status: currentOrder.orderStatus || currentOrder.status || 'Order Placed',
            date: currentOrder.createdAt || timestamp,
            note: 'Order successfully placed',
          },
        ];

    statusHistory.push({
      status: newStatus,
      date: timestamp,
      note: adminNote || `Status updated to ${newStatus} by Administrator`,
    });

    const updatedTracking = trackingDetails
      ? { ...(currentOrder.tracking || {}), ...trackingDetails }
      : currentOrder.tracking;

    const updatedOrder = {
      ...currentOrder,
      orderStatus: newStatus,
      status: newStatus,
      updatedAt: timestamp,
      inventoryRestored: newStatus === 'Cancelled' ? true : currentOrder.inventoryRestored,
      tracking: updatedTracking,
      statusHistory,
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyAdminDataChanged('orders', updatedOrder);
    return updatedOrder;
  } catch (err) {
    console.error('Failed to update order status:', err);
    return null;
  }
}

export function cancelAdminOrder(orderId, cancellationReason = 'Order cancelled by administrator') {
  return cancelCustomerOrder(orderId, cancellationReason, 'Administrator');
}

/* ==========================================================================
   5. USER & ROLE MANAGEMENT
   ========================================================================== */

export const DEFAULT_ADMIN_EMAIL = 'admin@electrohaven.com';

export async function seedAdminUserIfNeeded() {
  const users = getStoredUsers();
  if (!users.some((u) => u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())) {
    const salt = generateSalt();
    const passwordHash = await hashPassword('Admin@123', salt);
    const adminUser = {
      id: 'usr_admin_master_1',
      name: 'ElectroHaven Administrator',
      email: DEFAULT_ADMIN_EMAIL,
      phone: '9898012345',
      passwordHash,
      passwordSalt: salt,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      avatar: 'AD',
      role: 'admin',
      status: 'active',
    };
    users.unshift(adminUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

export function getAdminUsers() {
  const users = getStoredUsers();
  return users.map((u) => {
    const { passwordHash, passwordSalt, ...safe } = u;
    return {
      ...safe,
      role: safe.role || (safe.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer'),
      status: safe.status || 'active',
    };
  });
}

export function updateAdminUserStatus(userId, newStatus) {
  try {
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    if (user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot suspend the primary administrator account.' };
    }

    user.status = newStatus; // 'active' or 'suspended'
    user.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyAdminDataChanged('users', user);
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function updateAdminUserRole(userId, newRole) {
  try {
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    if (user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && newRole !== 'admin') {
      return { success: false, error: 'Cannot change the primary administrator role.' };
    }

    user.role = newRole; // 'admin' or 'customer'
    user.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyAdminDataChanged('users', user);
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function deleteAdminUser(userId, currentAdminUserId) {
  try {
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    if (user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot delete the master admin account.' };
    }

    if (userId === currentAdminUserId) {
      return { success: false, error: 'You cannot delete your own logged-in account.' };
    }

    const filtered = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    notifyAdminDataChanged('users');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createAdminUser({ name, email, phone, role = 'customer', status = 'active', password = 'Password@123' }) {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getStoredUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || '').replace(/\D/g, '') || '9876543210',
      passwordHash,
      passwordSalt: salt,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      avatar: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      role: role || 'customer',
      status: status || 'active',
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyAdminDataChanged('users', newUser);
    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   6. OFFERS, COUPONS & DISCOUNTS MANAGEMENT
   ========================================================================== */

export function getAdminCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(defaultCoupons));
      return defaultCoupons;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCoupons;
  } catch {
    return defaultCoupons;
  }
}

export function saveAdminCoupons(couponsList) {
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(couponsList));
    notifyAdminDataChanged('coupons', couponsList);
  } catch (err) {
    console.error('Failed to save coupons:', err);
  }
}

export function addAdminCoupon(couponData) {
  const coupons = getAdminCoupons();
  const code = (couponData.code || '').trim().toUpperCase();

  if (!code) {
    return { success: false, error: 'Coupon code is required.' };
  }

  if (coupons.some((c) => c.code === code)) {
    return { success: false, error: `Coupon code "${code}" already exists.` };
  }

  const newCoupon = {
    code,
    description: couponData.description?.trim() || `${code} discount offer`,
    minimumSpend: Number(couponData.minimumSpend) || 0,
    type: couponData.type === 'fixed' ? 'fixed' : 'percentage',
    value: Number(couponData.value) || 10,
    maximumDiscount: couponData.maximumDiscount ? Number(couponData.maximumDiscount) : null,
    status: couponData.status || 'active',
    validUntil: couponData.validUntil || '2026-12-31',
    createdAt: new Date().toISOString(),
  };

  const updated = [newCoupon, ...coupons];
  saveAdminCoupons(updated);
  return { success: true, coupon: newCoupon };
}

export function updateAdminCoupon(code, updatedFields) {
  const coupons = getAdminCoupons();
  const index = coupons.findIndex((c) => c.code === code.trim().toUpperCase());
  if (index === -1) return { success: false, error: 'Coupon not found.' };

  const current = coupons[index];
  const updatedCoupon = {
    ...current,
    ...updatedFields,
    code: current.code, // Immutable code
    value: updatedFields.value !== undefined ? Number(updatedFields.value) : current.value,
    minimumSpend: updatedFields.minimumSpend !== undefined ? Number(updatedFields.minimumSpend) : current.minimumSpend,
  };

  coupons[index] = updatedCoupon;
  saveAdminCoupons(coupons);
  return { success: true, coupon: updatedCoupon };
}

export function toggleAdminCouponStatus(code) {
  const coupons = getAdminCoupons();
  const coupon = coupons.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { success: false, error: 'Coupon not found.' };

  const nextStatus = coupon.status === 'inactive' ? 'active' : 'inactive';
  return updateAdminCoupon(code, { status: nextStatus });
}

export function deleteAdminCoupon(code) {
  const coupons = getAdminCoupons();
  const filtered = coupons.filter((c) => c.code !== code.trim().toUpperCase());
  saveAdminCoupons(filtered);
  return { success: true };
}
