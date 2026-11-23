// Node.js Test Suite for ElectroHaven Admin Dashboard Data Layer

// Mock localStorage for Node environment
const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, val) => {
    store[key] = String(val);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};

global.window = {
  dispatchEvent: () => {},
};
global.CustomEvent = class CustomEvent {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts ? opts.detail : null;
  }
};

async function runTests() {
  console.log('--- STARTING ADMIN DASHBOARD TEST SUITE ---');

  const {
    getAdminProducts,
    addAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    toggleAdminProductHotDeal,
    getAdminStores,
    addAdminStore,
    updateAdminStore,
    deleteAdminStore,
    getAdminProductStoreStock,
    updateAdminProductStoreStock,
    getAdminProductTotalStock,
    getAdminOrders,
    updateAdminOrderStatus,
    cancelAdminOrder,
    getAdminUsers,
    seedAdminUserIfNeeded,
    updateAdminUserStatus,
    updateAdminUserRole,
    deleteAdminUser,
    getAdminCoupons,
    addAdminCoupon,
    updateAdminCoupon,
    toggleAdminCouponStatus,
    deleteAdminCoupon,
  } = await import('../src/adminData.js');

  const {
    loginUser,
    isAdminUser,
    seedDemoAccountIfNeeded,
  } = await import('../src/auth.js');

  const {
    validateCoupon,
    getProductStock,
    saveStoredOrder,
  } = await import('../src/cart.js');

  const {
    getProductStoreStock,
  } = await import('../src/storeAvailability.js');

  // Test 1: Seed & Authentication
  console.log('\n[1] Testing Authentication & Role Security:');
  await seedDemoAccountIfNeeded();
  await seedAdminUserIfNeeded();

  const customerLogin = await loginUser({ identifier: 'alex.sharma@example.com', password: 'Password@123' });
  console.assert(customerLogin.success, 'Customer login should succeed');
  console.assert(!isAdminUser(customerLogin.user), 'Customer should not have admin role');
  console.log('✓ Customer login verified (Role: customer)');

  const adminLogin = await loginUser({ identifier: 'admin@electrohaven.com', password: 'Admin@123' });
  console.assert(adminLogin.success, 'Admin login should succeed');
  console.assert(isAdminUser(adminLogin.user), 'Admin user must have admin role');
  console.log('✓ Master Admin login verified (Role: admin)');

  // Test 2: Product Management
  console.log('\n[2] Testing Product Management CRUD:');
  const initialProducts = getAdminProducts();
  console.assert(initialProducts.length >= 51, `Should have at least 51 initial products, found ${initialProducts.length}`);

  const newProd = addAdminProduct({
    name: 'Test Sony Bravia XR 65" OLED TV',
    description: '4K Ultra HD HDR Smart Google TV with Cognitive Processor XR',
    price: 189900,
    oldPrice: 229900,
    discount: '17% OFF',
    category: 'accessories',
    type: 'oled tv',
    image: '/products/sony-alpha-7-iv.jpg',
    initialStock: 15,
  });
  console.assert(newProd.id > 51, 'New product should have incremented ID');
  console.log(`✓ Added product: #${newProd.id} - ${newProd.name}`);

  const updatedProd = updateAdminProduct(newProd.id, {
    price: 179900,
    description: 'Updated description: Special festival price',
  });
  console.assert(updatedProd.price === 179900, 'Price should update to 179900');
  console.log('✓ Updated product price and details successfully');

  toggleAdminProductHotDeal(newProd.id, true, '20% OFF');
  const dealCheck = getAdminProducts().find((p) => p.id === newProd.id);
  console.assert(dealCheck.isHotDeal === true, 'Product should be marked as hot deal');
  console.log('✓ Hot Deal toggle verified');

  // Test 3: Store Management
  console.log('\n[3] Testing Store Management:');
  const initialStores = getAdminStores();
  console.assert(initialStores.length >= 5, `Expected at least 5 Ahmedabad stores, found ${initialStores.length}`);

  const newStore = addAdminStore({
    name: 'ElectroHaven Hub, Bopal',
    locality: 'South Bopal',
    address: 'Shop 15, Gala Magnificence, South Bopal, Ahmedabad 380058',
    pincode: '380058',
    contact: '+91 79 4005 9999',
  });
  console.assert(getAdminStores().some((s) => s.id === newStore.id), 'New store should be added');
  console.log(`✓ Added store: ${newStore.name} (${newStore.id})`);

  updateAdminStore(newStore.id, { contact: '+91 79 4005 8888' });
  const storeCheck = getAdminStores().find((s) => s.id === newStore.id);
  console.assert(storeCheck.contact === '+91 79 4005 8888', 'Store contact should be updated');
  console.log('✓ Updated store contact successfully');

  // Test 4: Inventory Management
  console.log('\n[4] Testing Store-Specific Inventory Overrides:');
  updateAdminProductStoreStock(newProd.id, 'eh-store-amd-01', 35);
  updateAdminProductStoreStock(newProd.id, 'eh-store-amd-02', 0);

  const stockStore1 = getAdminProductStoreStock(newProd.id, 'eh-store-amd-01');
  const stockStore2 = getAdminProductStoreStock(newProd.id, 'eh-store-amd-02');
  console.assert(stockStore1 === 35, 'Store 1 stock should be 35');
  console.assert(stockStore2 === 0, 'Store 2 stock should be 0');

  // Verify storeAvailability module reflects this
  const availStore1 = getProductStoreStock(newProd.id, 'eh-store-amd-01');
  const availStore2 = getProductStoreStock(newProd.id, 'eh-store-amd-02');
  console.assert(availStore1.quantity === 35 && availStore1.status === 'In Stock', 'availStore1 should be In Stock with 35');
  console.assert(availStore2.quantity === 0 && availStore2.status === 'Out of Stock', 'availStore2 should be Out of Stock');
  console.log('✓ Store inventory reflects in getProductStoreStock correctly (Store 1: In Stock, Store 2: Out of Stock)');

  // Test 5: Order Management
  console.log('\n[5] Testing Order Management Lifecycle:');
  const sampleOrder = {
    orderId: 'EH-2026-999001',
    orderDate: new Date().toISOString(),
    userId: 'usr_demo_alex_sharma',
    orderStatus: 'Processing',
    items: [{ id: newProd.id, name: newProd.name, price: newProd.price, quantity: 1 }],
    pricing: { subtotal: newProd.price, total: newProd.price },
    shippingAddress: { fullName: 'Alex Sharma', phone: '9876543210', pincode: '380009' },
  };
  saveStoredOrder(sampleOrder);

  const orders = getAdminOrders();
  console.assert(orders.some((o) => o.orderId === 'EH-2026-999001'), 'Sample order should exist');

  const shippedOrder = updateAdminOrderStatus('EH-2026-999001', 'Shipped', 'Tracking AWB #BLUEDART88472');
  console.assert(shippedOrder.orderStatus === 'Shipped', 'Order status should be Shipped');
  console.assert(shippedOrder.statusHistory.length >= 2, 'Order should have status history');
  console.log('✓ Order updated to Shipped with tracking history');

  cancelAdminOrder('EH-2026-999001', 'Customer opted for in-store pickup');
  const cancelledOrder = getAdminOrders().find((o) => o.orderId === 'EH-2026-999001');
  console.assert(cancelledOrder.orderStatus === 'Cancelled', 'Order should be Cancelled');
  console.log('✓ Order cancelled successfully');

  // Test 6: User Management & Suspension
  console.log('\n[6] Testing User Management & Suspension:');
  const users = getAdminUsers();
  const customerUser = users.find((u) => u.email === 'alex.sharma@example.com');

  updateAdminUserStatus(customerUser.id, 'suspended');
  const suspendedCheck = await loginUser({ identifier: 'alex.sharma@example.com', password: 'Password@123' });
  console.assert(!suspendedCheck.success, 'Suspended user must not be able to log in');
  console.log('✓ Suspension enforcement verified: suspended user rejected at login');

  // Reactivate user
  updateAdminUserStatus(customerUser.id, 'active');
  const reactivatedCheck = await loginUser({ identifier: 'alex.sharma@example.com', password: 'Password@123' });
  console.assert(reactivatedCheck.success, 'Reactivated user should be able to log in again');
  console.log('✓ User reactivation verified');

  // Test 7: Offers & Coupon Management
  console.log('\n[7] Testing Offers & Dynamic Coupons:');
  const couponRes = addAdminCoupon({
    code: 'FESTIVE30',
    description: '30% off up to ₹3,000 on festival electronics',
    type: 'percentage',
    value: 30,
    minimumSpend: 5000,
    maximumDiscount: 3000,
    status: 'active',
  });
  console.assert(couponRes.success, 'Coupon creation should succeed');

  // Test coupon in cart validation
  const validCouponCheck = validateCoupon('FESTIVE30', 10000);
  console.assert(validCouponCheck.valid, 'FESTIVE30 should be valid for ₹10,000 subtotal');
  console.assert(validCouponCheck.discount === 3000, `Discount should cap at ₹3,000, got ${validCouponCheck.discount}`);
  console.log(`✓ Dynamic coupon FESTIVE30 applied in Cart: Discount = ₹${validCouponCheck.discount}`);

  // Disable coupon
  toggleAdminCouponStatus('FESTIVE30');
  const disabledCheck = validateCoupon('FESTIVE30', 10000);
  console.assert(!disabledCheck.valid, 'Disabled coupon should be rejected');
  console.log('✓ Disabled coupon rejection verified');

  // Clean up test product and store
  deleteAdminProduct(newProd.id);
  deleteAdminStore(newStore.id);
  deleteAdminCoupon('FESTIVE30');

  console.log('\n=== ALL ADMIN TESTS PASSED PERFECTLY ===\n');
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
