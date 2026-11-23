export const FREE_SHIPPING_THRESHOLD = 4747;
export const STANDARD_DELIVERY_FEE = 99;
export const EXPRESS_DELIVERY_FEE = 149;
export const ESTIMATED_GST_RATE = 0.18;

export const availableCoupons = [
  {
    code: 'SAVE10',
    description: '10% off your order, up to ₹1,000 (No minimum order)',
    minimumSpend: 0,
    type: 'percentage',
    value: 10,
    maximumDiscount: 1000,
  },
  {
    code: 'WELCOME500',
    description: 'Flat ₹500 off on orders of ₹5,000 or more',
    minimumSpend: 5000,
    type: 'fixed',
    value: 500,
  },
  {
    code: 'FESTIVE2000',
    description: 'Flat ₹2,000 off on premium electronics of ₹25,000 or more',
    minimumSpend: 25000,
    type: 'fixed',
    value: 2000,
  },
  {
    code: 'ELECTRO5',
    description: '5% extra discount up to ₹2,500 on orders of ₹10,000 or more',
    minimumSpend: 10000,
    type: 'percentage',
    value: 5,
    maximumDiscount: 2500,
  },
];

export function getCartSubtotal(items) {
  return (items || []).reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
}

export function getActiveCoupons() {
  try {
    const raw = localStorage.getItem('electrohaven_coupons');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return availableCoupons;
}

export function validateCoupon(code, subtotal) {
  if (!code) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  const couponsList = getActiveCoupons();
  const coupon = couponsList.find((item) => item.code === code.trim().toUpperCase());

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code. Try SAVE10, WELCOME500, or FESTIVE2000.' };
  }

  if (coupon.status === 'inactive') {
    return { valid: false, message: `Coupon ${coupon.code} is currently disabled or expired.` };
  }

  if (subtotal < (coupon.minimumSpend || 0)) {
    const remaining = (coupon.minimumSpend || 0) - subtotal;
    const formattedDiff = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(remaining);

    return {
      valid: false,
      coupon,
      message: `Add ${formattedDiff} more to your cart to use ${coupon.code}.`,
    };
  }

  const discount =
    coupon.type === 'percentage'
      ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maximumDiscount || Infinity)
      : coupon.value;

  return { valid: true, coupon, discount };
}

export function calculateCartTotals(items, couponCode = '', deliverySpeed = 'standard') {
  const subtotal = getCartSubtotal(items);
  const productSavings = (items || []).reduce(
    (total, item) => total + ((item.oldPrice || item.price) - item.price) * (item.quantity || 1),
    0
  );

  const appliedCoupon = couponCode ? validateCoupon(couponCode, subtotal) : null;
  const couponDiscount = appliedCoupon && appliedCoupon.valid ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const estimatedGst = Math.round(taxableAmount * ESTIMATED_GST_RATE);

  let delivery = 0;
  if (subtotal > 0) {
    if (deliverySpeed === 'express') {
      delivery = EXPRESS_DELIVERY_FEE;
    } else {
      delivery = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    }
  }

  return {
    subtotal,
    productSavings,
    couponDiscount,
    estimatedGst,
    delivery,
    deliverySpeed,
    total: taxableAmount + estimatedGst + delivery,
    appliedCoupon,
  };
}

/**
 * Stock inventory lookup per product.
 * Respects store inventory overrides saved by the Admin Dashboard.
 * Returns available warehouse quantity.
 */
export function getProductStock(productId) {
  const pId = Number(productId) || 1;
  try {
    const raw = localStorage.getItem('electrohaven_store_inventory');
    if (raw) {
      const inventory = JSON.parse(raw);
      let foundAny = false;
      let totalStock = 0;
      for (const storeId in inventory) {
        if (inventory[storeId] && typeof inventory[storeId][pId] === 'number') {
          foundAny = true;
          totalStock += inventory[storeId][pId];
        }
      }
      if (foundAny) {
        return totalStock;
      }
    }
  } catch {}

  // Deterministic seed formula gives stable stock per product
  const stock = ((pId * 17 + 23) % 15) + 4;
  return stock;
}

/**
 * Validates stock availability for an entire cart before order placement.
 */
export function validateCartStock(cartItems) {
  const issues = [];
  for (const item of cartItems || []) {
    const available = getProductStock(item.id);
    if (available === 0) {
      issues.push({
        id: item.id,
        name: item.name,
        type: 'out_of_stock',
        available: 0,
        requested: item.quantity,
        message: `"${item.name}" is currently out of stock.`,
      });
    } else if (item.quantity > available) {
      issues.push({
        id: item.id,
        name: item.name,
        type: 'insufficient_stock',
        available,
        requested: item.quantity,
        message: `Only ${available} unit(s) in stock for "${item.name}" (requested: ${item.quantity}).`,
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * LocalStorage Helpers for Cart & Checkout persistence
 */
const CART_STORAGE_KEY = 'electrohaven_cart';
const ORDERS_STORAGE_KEY = 'electrohaven_orders';
const ADDRESSES_STORAGE_KEY = 'electrohaven_saved_addresses';
const SAVED_COUPON_KEY = 'electrohaven_active_coupon';

export function getStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse cart from localStorage:', err);
    return [];
  }
}

export function saveStoredCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart || []));
  } catch (err) {
    console.warn('Failed to save cart to localStorage:', err);
  }
}

export function clearStoredCart() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {}
}

export function getStoredCoupon() {
  try {
    return localStorage.getItem(SAVED_COUPON_KEY) || '';
  } catch {
    return '';
  }
}

export function saveStoredCoupon(code) {
  try {
    if (code) {
      localStorage.setItem(SAVED_COUPON_KEY, code.trim().toUpperCase());
    } else {
      localStorage.removeItem(SAVED_COUPON_KEY);
    }
  } catch {}
}

export function getStoredOrders(userId = null) {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (userId) {
      return parsed.filter((order) => order.userId === userId || !order.userId);
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse orders from localStorage:', err);
    return [];
  }
}

export function saveStoredOrder(order, userId = null) {
  try {
    const current = getStoredOrders();
    const orderWithUser = {
      ...order,
      userId: userId || order.userId || 'usr_demo_alex_sharma',
    };
    const updated = [orderWithUser, ...current];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save order to localStorage:', err);
    return [];
  }
}

export const DEFAULT_DEMO_ADDRESS = {
  id: 'addr_default_1',
  fullName: 'Alex Sharma',
  phone: '9876543210',
  email: 'alex.sharma@example.com',
  addressLine1: 'Flat 402, Shivalik High Street',
  addressLine2: 'Near Panjrapole Cross Roads, Navrangpura',
  landmark: 'Opposite Ahmedabad University',
  pincode: '380009',
  city: 'Ahmedabad',
  state: 'Gujarat',
  addressType: 'Home',
  isDefault: true,
};

export function getStoredAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (!raw) return [DEFAULT_DEMO_ADDRESS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_DEMO_ADDRESS];
  } catch {
    return [DEFAULT_DEMO_ADDRESS];
  }
}

export function saveStoredAddress(address) {
  try {
    const current = getStoredAddresses();
    const updated = [address, ...current.filter((a) => a.id !== address.id)];
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [address];
  }
}

/**
 * Generates an authentic Croma-style order identifier (e.g. EH-2026-583921)
 */
export function generateOrderId() {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `EH-2026-${randomPart}`;
}
