import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatINR } from './currency';
import {
  getAdminProducts,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  toggleAdminProductHotDeal,
  getAdminStores,
  addAdminStore,
  updateAdminStore,
  deleteAdminStore,
  getAdminStoreInventoryMap,
  getAdminProductStoreStock,
  updateAdminProductStoreStock,
  getAdminProductTotalStock,
  getAdminOrders,
  updateAdminOrderStatus,
  cancelAdminOrder,
  getAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
  createAdminUser,
  getAdminCoupons,
  addAdminCoupon,
  updateAdminCoupon,
  toggleAdminCouponStatus,
  deleteAdminCoupon,
  seedAdminUserIfNeeded,
  DEFAULT_ADMIN_EMAIL,
  ADMIN_DATA_CHANGED_EVENT,
} from './adminData';
import { loginUser, isAdminUser } from './auth';
import { handleProductImageError } from './imageUtils';
import './AdminDashboard.css';

export default function AdminDashboard({
  currentUser,
  onLoginSuccess,
  onExitToStore,
  theme = 'dark',
  onToggleTheme,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState(null);

  // Core Data States
  const [products, setProducts] = useState(() => getAdminProducts());
  const [stores, setStores] = useState(() => getAdminStores());
  const [orders, setOrders] = useState(() => getAdminOrders());
  const [users, setUsers] = useState(() => getAdminUsers());
  const [coupons, setCoupons] = useState(() => getAdminCoupons());
  const [inventoryMap, setInventoryMap] = useState(() => getAdminStoreInventoryMap());

  // Security gate state
  const isAuthedAdmin = useMemo(() => isAdminUser(currentUser), [currentUser]);

  // Toast auto-clear
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Synchronize on data change events
  const reloadAllData = () => {
    setProducts(getAdminProducts());
    setStores(getAdminStores());
    setOrders(getAdminOrders());
    setUsers(getAdminUsers());
    setCoupons(getAdminCoupons());
    setInventoryMap(getAdminStoreInventoryMap());
  };

  useEffect(() => {
    seedAdminUserIfNeeded();
    const handleSync = (e) => {
      reloadAllData();
    };
    window.addEventListener(ADMIN_DATA_CHANGED_EVENT, handleSync);
    return () => window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, handleSync);
  }, []);

  if (!isAuthedAdmin) {
    return (
      <AdminSecurityGate
        currentUser={currentUser}
        onLoginSuccess={onLoginSuccess}
        onExitToStore={onExitToStore}
      />
    );
  }

  return (
    <div className="admin-container" data-theme={theme}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`admin-toast ${toastMessage.type}`}>
          <span>{toastMessage.type === 'error' ? '⚠️' : '✓'}</span>
          <p>{toastMessage.message}</p>
          <button type="button" onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-logo-mark">⚡</div>
          <div>
            <h1>ElectroHaven Admin Central</h1>
            <span className="admin-env-pill">● Production Storefront Live</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-header-btn secondary"
            onClick={onToggleTheme}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button
            type="button"
            className="admin-header-btn outline"
            onClick={onExitToStore}
          >
            ← View Storefront
          </button>
          <div className="admin-user-pill">
            <span className="admin-avatar">{currentUser?.avatar || 'AD'}</span>
            <div>
              <strong>{currentUser?.name || 'Administrator'}</strong>
              <small>Master Admin</small>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <nav className="admin-nav-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          📦 Products <span className="tab-count">{products.length}</span>
        </button>
        <button
          className={activeTab === 'stores' ? 'active' : ''}
          onClick={() => setActiveTab('stores')}
        >
          🏬 Stores <span className="tab-count">{stores.length}</span>
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          📋 Inventory
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          🛍️ Orders <span className="tab-count">{orders.length}</span>
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users <span className="tab-count">{users.length}</span>
        </button>
        <button
          className={activeTab === 'offers' ? 'active' : ''}
          onClick={() => setActiveTab('offers')}
        >
          🏷️ Offers &amp; Deals <span className="tab-count">{coupons.length}</span>
        </button>
      </nav>

      {/* Tab Content Panels */}
      <main className="admin-main-content">
        {activeTab === 'overview' && (
          <OverviewTab
            products={products}
            stores={stores}
            orders={orders}
            users={users}
            coupons={coupons}
            onNavigateTab={setActiveTab}
            onUpdateOrderStatus={(id, status) => {
              updateAdminOrderStatus(id, status);
              reloadAllData();
              showToast(`Order ${id} updated to ${status}`);
            }}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            stores={stores}
            onAddProduct={(data) => {
              const created = addAdminProduct(data);
              reloadAllData();
              showToast(`Added product "${created.name}"`);
            }}
            onUpdateProduct={(id, data) => {
              updateAdminProduct(id, data);
              reloadAllData();
              showToast(`Updated product specifications`);
            }}
            onDeleteProduct={(id) => {
              deleteAdminProduct(id);
              reloadAllData();
              showToast(`Product deleted successfully`, 'info');
            }}
            onToggleHotDeal={(id, isDeal, discount) => {
              toggleAdminProductHotDeal(id, isDeal, discount);
              reloadAllData();
              showToast(isDeal ? 'Marked as Hot Deal' : 'Removed from Hot Deals');
            }}
          />
        )}

        {activeTab === 'stores' && (
          <StoresTab
            stores={stores}
            onAddStore={(data) => {
              const created = addAdminStore(data);
              reloadAllData();
              showToast(`Store "${created.name}" added`);
            }}
            onUpdateStore={(id, data) => {
              updateAdminStore(id, data);
              reloadAllData();
              showToast(`Store location updated`);
            }}
            onDeleteStore={(id) => {
              const res = deleteAdminStore(id);
              if (!res.success) {
                showToast(res.error, 'error');
              } else {
                reloadAllData();
                showToast(`Store removed successfully`, 'info');
              }
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            stores={stores}
            onUpdateStock={(pId, sId, qty) => {
              updateAdminProductStoreStock(pId, sId, qty);
              reloadAllData();
              showToast(`Stock updated to ${qty} units`);
            }}
            onQuickRestockAll={(storeId, targetQty) => {
              products.forEach((p) => {
                const cur = getAdminProductStoreStock(p.id, storeId);
                if (cur <= 3) {
                  updateAdminProductStoreStock(p.id, storeId, targetQty, false);
                }
              });
              reloadAllData();
              showToast(`All low-stock items restocked to ${targetQty} units!`);
            }}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onUpdateStatus={(id, status, note, tracking) => {
              updateAdminOrderStatus(id, status, note, tracking);
              reloadAllData();
              showToast(`Order status updated to ${status}`);
            }}
            onCancelOrder={(id, reason) => {
              cancelAdminOrder(id, reason);
              reloadAllData();
              showToast(`Order ${id} cancelled and stock restored`, 'info');
            }}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            currentAdminId={currentUser?.id}
            onToggleStatus={(userId, status) => {
              const res = updateAdminUserStatus(userId, status);
              if (!res.success) {
                showToast(res.error, 'error');
              } else {
                reloadAllData();
                showToast(`User status set to ${status}`);
              }
            }}
            onChangeRole={(userId, role) => {
              const res = updateAdminUserRole(userId, role);
              if (!res.success) {
                showToast(res.error, 'error');
              } else {
                reloadAllData();
                showToast(`User role updated to ${role}`);
              }
            }}
            onDeleteUser={(userId) => {
              const res = deleteAdminUser(userId, currentUser?.id);
              if (!res.success) {
                showToast(res.error, 'error');
              } else {
                reloadAllData();
                showToast(`User account deleted`, 'info');
              }
            }}
            onCreateUser={async (userData) => {
              const res = await createAdminUser(userData);
              if (!res.success) {
                showToast(res.error, 'error');
              } else {
                reloadAllData();
                showToast(`Created user account for ${userData.name}`);
              }
            }}
          />
        )}

        {activeTab === 'offers' && (
          <OffersTab
            products={products}
            coupons={coupons}
            onAddCoupon={(data) => {
              const res = addAdminCoupon(data);
              if (!res.success) {
                showToast(res.error, 'error');
              } else {
                reloadAllData();
                showToast(`Coupon ${data.code} created`);
              }
            }}
            onUpdateCoupon={(code, data) => {
              updateAdminCoupon(code, data);
              reloadAllData();
              showToast(`Coupon ${code} updated`);
            }}
            onToggleCoupon={(code) => {
              toggleAdminCouponStatus(code);
              reloadAllData();
              showToast(`Coupon status toggled`);
            }}
            onDeleteCoupon={(code) => {
              deleteAdminCoupon(code);
              reloadAllData();
              showToast(`Coupon deleted`, 'info');
            }}
            onToggleHotDeal={(id, isDeal, discount) => {
              toggleAdminProductHotDeal(id, isDeal, discount);
              reloadAllData();
              showToast(isDeal ? 'Added to Hot Deals' : 'Removed from Hot Deals');
            }}
          />
        )}
      </main>
    </div>
  );
}

/* ==========================================================================
   TAB 1: OVERVIEW TAB
   ========================================================================== */

function OverviewTab({ products, stores, orders, users, coupons, onNavigateTab, onUpdateOrderStatus }) {
  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => {
      if (o.orderStatus === 'Cancelled') return sum;
      return sum + (o.pricing?.total || o.total || 0);
    }, 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    let count = 0;
    products.forEach((p) => {
      const total = getAdminProductTotalStock(p.id);
      if (total <= 6) count++;
    });
    return count;
  }, [products]);

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  // Category distribution
  const categoryStats = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || 'other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [products]);

  return (
    <div className="admin-overview">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">📦</span>
            <span className="kpi-trend positive">+100% active</span>
          </div>
          <strong className="kpi-value">{products.length}</strong>
          <span className="kpi-label">Total Catalog Products</span>
          <small className="kpi-sub">Across 8 Categories</small>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">💰</span>
            <span className="kpi-trend positive">Live Gross</span>
          </div>
          <strong className="kpi-value">{formatINR(totalRevenue)}</strong>
          <span className="kpi-label">Total Store Revenue</span>
          <small className="kpi-sub">{orders.length} lifetime orders placed</small>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">🛍️</span>
            <span className="kpi-trend positive">Pan-India</span>
          </div>
          <strong className="kpi-value">{orders.length}</strong>
          <span className="kpi-label">Total Orders</span>
          <small className="kpi-sub">
            {orders.filter((o) => o.orderStatus === 'Delivered').length} completed ·{' '}
            {orders.filter((o) => o.orderStatus === 'Processing' || !o.orderStatus).length} in fulfillment
          </small>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">👥</span>
            <span className="kpi-trend">Verified</span>
          </div>
          <strong className="kpi-value">{users.length}</strong>
          <span className="kpi-label">Registered Users</span>
          <small className="kpi-sub">{users.filter((u) => u.role === 'admin').length} Admins · {users.filter((u) => u.role !== 'admin').length} Customers</small>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-header">
            <span className="kpi-icon">⚠️</span>
            <span className="kpi-trend negative">Action Required</span>
          </div>
          <strong className="kpi-value">{lowStockCount}</strong>
          <span className="kpi-label">Low Stock Alerts</span>
          <button
            type="button"
            className="kpi-action-link"
            onClick={() => onNavigateTab('inventory')}
          >
            Review &amp; Restock →
          </button>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="admin-quick-bar">
        <h3>⚡ Quick Admin Operations</h3>
        <div className="quick-buttons">
          <button
            type="button"
            className="quick-btn"
            onClick={() => onNavigateTab('products')}
          >
            <span>➕</span> Add Product
          </button>
          <button
            type="button"
            className="quick-btn"
            onClick={() => onNavigateTab('stores')}
          >
            <span>🏬</span> Add Store Location
          </button>
          <button
            type="button"
            className="quick-btn"
            onClick={() => onNavigateTab('inventory')}
          >
            <span>📋</span> Manage Store Stocks
          </button>
          <button
            type="button"
            className="quick-btn"
            onClick={() => onNavigateTab('offers')}
          >
            <span>🏷️</span> Create Discount Coupon
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Store Network */}
      <div className="overview-split">
        {/* Recent Orders */}
        <div className="admin-panel-box recent-orders-panel">
          <div className="panel-box-header">
            <div>
              <h3>Recent Customer Orders</h3>
              <p>Latest fulfillment requests submitted across India</p>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => onNavigateTab('orders')}
            >
              View all orders ({orders.length}) →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="panel-empty">No orders placed yet. As users shop, orders will populate here.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.orderId}>
                      <td>
                        <strong>{o.orderId}</strong>
                        <br />
                        <small>{new Date(o.orderDate || o.createdAt).toLocaleDateString('en-IN')}</small>
                      </td>
                      <td>
                        {o.shippingAddress?.fullName || 'Customer'}
                        <br />
                        <small>{o.shippingAddress?.phone || '—'}</small>
                      </td>
                      <td>{(o.items || []).length} items</td>
                      <td>
                        <strong>{formatINR(o.pricing?.total || o.total || 0)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${o.orderStatus?.toLowerCase().replace(/\s+/g, '-') || 'order-placed'}`}>
                          {o.orderStatus || 'Order Placed'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-status-select"
                          value={o.orderStatus || 'Order Placed'}
                          onChange={(e) => onUpdateOrderStatus(o.orderId || o.id, e.target.value)}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Breakdown & Network Health */}
        <div className="admin-panel-box category-breakdown-panel">
          <div className="panel-box-header">
            <div>
              <h3>Category Inventory Distribution</h3>
              <p>Product volume across hardware categories</p>
            </div>
          </div>

          <div className="category-bars">
            {categoryStats.map(([category, count]) => {
              const pct = Math.round((count / products.length) * 100);
              return (
                <div key={category} className="cat-bar-item">
                  <div className="cat-bar-meta">
                    <strong className="capitalize">{category}</strong>
                    <span>{count} products ({pct}%)</span>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="store-network-summary">
            <h4>Ahmedabad Physical Retail Network</h4>
            <div className="network-stores-strip">
              {stores.slice(0, 4).map((s) => (
                <div key={s.id} className="network-pill">
                  <span>📍</span>
                  <div>
                    <strong>{s.locality}</strong>
                    <small>{s.status || 'Open Now'}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 2: PRODUCT MANAGEMENT
   ========================================================================== */

function ProductsTab({ products, stores, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleHotDeal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const categories = [
    'all',
    'phones',
    'laptops',
    'headphones',
    'cameras',
    'gaming',
    'wearables',
    'smart home',
    'accessories',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="admin-products-tab">
      <div className="tab-actions-bar">
        <div className="filter-group">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search products by title, model, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => {
            setEditingProduct(null);
            setModalMode('add');
          }}
        >
          <span>➕</span> Add New Product
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Details</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Stock Status</th>
              <th>Hot Deal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const totalStock = getAdminProductTotalStock(p.id);
              return (
                <tr key={p.id}>
                  <td className="product-thumb-cell">
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={handleProductImageError}
                      className="admin-thumb-img"
                    />
                  </td>
                  <td>
                    <strong className="product-title-row">{p.name}</strong>
                    <p className="product-desc-row">{p.description}</p>
                    <small className="product-id-tag">ID: #{p.id} · Type: {p.type}</small>
                  </td>
                  <td>
                    <span className="category-badge">{p.category}</span>
                  </td>
                  <td>
                    <strong>{formatINR(p.price)}</strong>
                    {p.oldPrice > p.price && (
                      <del className="old-price-cell">{formatINR(p.oldPrice)}</del>
                    )}
                    {p.discount && <span className="discount-tag">{p.discount}</span>}
                  </td>
                  <td>
                    <span className={`stock-badge ${totalStock === 0 ? 'out' : totalStock <= 6 ? 'low' : 'in'}`}>
                      {totalStock === 0 ? 'Out of Stock' : `${totalStock} units`}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`deal-toggle-btn ${p.isHotDeal ? 'active' : ''}`}
                      onClick={() => onToggleHotDeal(p.id, !p.isHotDeal)}
                      title="Toggle Hot Deal showcase"
                    >
                      {p.isHotDeal ? '★ Hot Deal' : '☆ Regular'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="action-btn edit"
                      onClick={() => {
                        setEditingProduct(p);
                        setModalMode('edit');
                      }}
                      title="Edit Product"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => setDeleteConfirmId(p.id)}
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal small-modal">
            <h3>Confirm Product Deletion</h3>
            <p>
              Are you sure you want to permanently delete this product? This will remove it from the
              catalog, comparison, and customer recommendations.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => {
                  onDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalMode && (
        <ProductFormModal
          mode={modalMode}
          product={editingProduct}
          stores={stores}
          onClose={() => {
            setModalMode(null);
            setEditingProduct(null);
          }}
          onSave={(data) => {
            if (modalMode === 'add') {
              onAddProduct(data);
            } else {
              onUpdateProduct(editingProduct.id, data);
            }
            setModalMode(null);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ mode, product, stores, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'phones',
    type: product?.type || 'smartphone',
    price: product?.price || 49999,
    oldPrice: product?.oldPrice || 54999,
    discount: product?.discount || '10% OFF',
    rating: product?.rating || '4.8',
    reviews: product?.reviews || '150+',
    description: product?.description || '',
    image: product?.image || '/products/apple-iphone-16-pro.jpg',
    isHotDeal: Boolean(product?.isHotDeal),
    initialStock: 12,
    specs: {
      display: product?.specifications?.display || '6.7" OLED 120Hz',
      processor: product?.specifications?.processor || 'Flagship Octa-Core Processor',
      ram: product?.specifications?.ram || '8GB Unified RAM',
      storage: product?.specifications?.storage || '256GB High-Speed Storage',
      battery: product?.specifications?.battery || '5000 mAh All-Day Battery',
    },
  });

  const [imagePreview, setImagePreview] = useState(formData.image);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a product title.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal large-modal">
        <div className="modal-header">
          <h2>{mode === 'add' ? '➕ Add New Electronics Product' : `✏️ Edit Product #${product?.id}`}</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Product Title / Model Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apple iPhone 16 Pro Max 256GB"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="phones">Phones</option>
                <option value="laptops">Laptops</option>
                <option value="headphones">Audio / Headphones</option>
                <option value="cameras">Cameras</option>
                <option value="gaming">Gaming</option>
                <option value="wearables">Wearables</option>
                <option value="smart home">Smart Home</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div className="form-group">
              <label>Product Type / Form Factor</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g. smartphone, laptop, buds"
              />
            </div>

            <div className="form-group">
              <label>Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Original MRP (₹)</label>
              <input
                type="number"
                min="1"
                value={formData.oldPrice}
                onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Discount Badge Text</label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="e.g. 15% OFF, NEW, OFFICIAL"
              />
            </div>

            <div className="form-group">
              <label>Hot Deal Highlight</label>
              <div className="checkbox-wrap">
                <input
                  type="checkbox"
                  id="dealCheckbox"
                  checked={formData.isHotDeal}
                  onChange={(e) => setFormData({ ...formData, isHotDeal: e.target.checked })}
                />
                <label htmlFor="dealCheckbox">Feature in ElectroHaven Hot Deals section</label>
              </div>
            </div>

            <div className="form-group span-2">
              <label>Short Technical Description *</label>
              <textarea
                rows="2"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key selling points, processor, camera, display highlights..."
              />
            </div>

            {/* Image Uploader & Preview */}
            <div className="form-group span-2 image-upload-box">
              <label>Product Image (File Upload or URL)</label>
              <div className="image-inputs-row">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="/products/filename.jpg or https://..."
                />
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Choose File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              {imagePreview && (
                <div className="modal-img-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    onError={handleProductImageError}
                  />
                  <span>Live Preview</span>
                </div>
              )}
            </div>

            {/* Specifications Box */}
            <div className="form-group span-2 specs-fieldset">
              <h4>Hardware Specifications</h4>
              <div className="specs-grid">
                <div>
                  <label>Display</label>
                  <input
                    type="text"
                    value={formData.specs.display}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, display: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label>Processor</label>
                  <input
                    type="text"
                    value={formData.specs.processor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, processor: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label>RAM</label>
                  <input
                    type="text"
                    value={formData.specs.ram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, ram: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label>Storage</label>
                  <input
                    type="text"
                    value={formData.specs.storage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, storage: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {mode === 'add' && (
              <div className="form-group span-2">
                <label>Initial Stock Allocation per Ahmedabad Store</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                />
                <small className="help-text">Will be applied to each of the {stores.length} store locations.</small>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              {mode === 'add' ? 'Save Product' : 'Update Specifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 3: STORE MANAGEMENT
   ========================================================================== */

function StoresTab({ stores, onAddStore, onUpdateStore, onDeleteStore }) {
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
  const [editingStore, setEditingStore] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  return (
    <div className="admin-stores-tab">
      <div className="tab-actions-bar">
        <div>
          <h2>Ahmedabad Retail Store Network</h2>
          <p>Manage physical storefronts, address coordinates, and customer amenities</p>
        </div>
        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => {
            setEditingStore(null);
            setModalMode('add');
          }}
        >
          <span>➕</span> Add New Store Location
        </button>
      </div>

      <div className="stores-admin-grid">
        {stores.map((s) => (
          <div key={s.id} className="store-admin-card">
            <div className="store-card-head">
              <span className="store-tag-badge">{s.tag || 'Retail Store'}</span>
              <span className={`store-status-pill ${s.status === 'Open Now' ? 'open' : 'closed'}`}>
                {s.status || 'Open Now'}
              </span>
            </div>

            <h3>{s.name}</h3>
            <p className="store-address-text">{s.address}</p>

            <div className="store-meta-list">
              <div>
                <strong>Locality / PIN:</strong> {s.locality}, {s.pincode}
              </div>
              <div>
                <strong>Phone:</strong> {s.contact}
              </div>
              <div>
                <strong>Hours:</strong> {s.openingHours?.timing || '10:00 AM – 9:00 PM'}
              </div>
            </div>

            <div className="store-amenities-tags">
              {(s.amenities || []).map((amenity, i) => (
                <span key={i} className="amenity-chip">✓ {amenity}</span>
              ))}
            </div>

            <div className="store-card-actions">
              <button
                type="button"
                className="admin-btn small secondary"
                onClick={() => {
                  setEditingStore(s);
                  setModalMode('edit');
                }}
              >
                ✏️ Edit Store
              </button>
              <button
                type="button"
                className="admin-btn small danger"
                onClick={() => setDeleteConfirmId(s.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal small-modal">
            <h3>Delete Store Location</h3>
            <p>Are you sure you want to delete this store location? Products linked to this store will no longer show inventory for it.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => {
                  onDeleteStore(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {modalMode && (
        <StoreFormModal
          mode={modalMode}
          store={editingStore}
          onClose={() => {
            setModalMode(null);
            setEditingStore(null);
          }}
          onSave={(data) => {
            if (modalMode === 'add') {
              onAddStore(data);
            } else {
              onUpdateStore(editingStore.id, data);
            }
            setModalMode(null);
            setEditingStore(null);
          }}
        />
      )}
    </div>
  );
}

function StoreFormModal({ mode, store, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: store?.name || '',
    locality: store?.locality || '',
    pincode: store?.pincode || '380009',
    address: store?.address || '',
    city: store?.city || 'Ahmedabad',
    state: store?.state || 'Gujarat',
    contact: store?.contact || '+91 79 4000 0000',
    altContact: store?.altContact || '+91 98250 00000',
    email: store?.email || '',
    tag: store?.tag || 'Retail Store',
    status: store?.status || 'Open Now',
    days: store?.openingHours?.days || 'Monday – Sunday (All 7 Days)',
    timing: store?.openingHours?.timing || '10:30 AM – 9:30 PM',
    note: store?.openingHours?.note || 'Specialist advice desk available',
    lat: store?.coordinates?.lat || 23.0336,
    lng: store?.coordinates?.lng || 72.5562,
    amenities: store?.amenities || [
      'In-Store Order Pickup',
      'Demo & Experience Lounge',
      'Express Device Repair Hub',
      'Instant Phone & Laptop Exchange',
    ],
  });

  const [amenityInput, setAmenityInput] = useState('');

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill in store name and address.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal large-modal">
        <div className="modal-header">
          <h2>{mode === 'add' ? '🏬 Add Ahmedabad Store' : `✏️ Edit Store: ${store?.name}`}</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Store Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. ElectroHaven Flagship Store, Navrangpura"
              />
            </div>

            <div className="form-group">
              <label>Locality / Neighborhood *</label>
              <input
                type="text"
                required
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="e.g. Navrangpura, Satellite, Vastrapur"
              />
            </div>

            <div className="form-group">
              <label>PIN Code (6 digits) *</label>
              <input
                type="text"
                required
                maxLength="6"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>

            <div className="form-group span-2">
              <label>Full Physical Address *</label>
              <textarea
                rows="2"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Building, street, landmark, road..."
              />
            </div>

            <div className="form-group">
              <label>Primary Phone</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Store Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Operating Hours</label>
              <input
                type="text"
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Store Format / Tag</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              >
                <option value="Flagship Store">Flagship Store</option>
                <option value="Experience Zone">Experience Zone</option>
                <option value="Retail Hub">Retail Hub</option>
                <option value="Mega Store">Mega Store</option>
                <option value="Express Outlet">Express Outlet</option>
              </select>
            </div>

            <div className="form-group">
              <label>Latitude (Coordinates)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Longitude (Coordinates)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              />
            </div>

            <div className="form-group span-2">
              <label>Store Amenities</label>
              <div className="amenity-input-row">
                <input
                  type="text"
                  placeholder="e.g. Free Customer Parking, Hi-Fi Lounge"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                />
                <button type="button" className="admin-btn secondary" onClick={handleAddAmenity}>
                  + Add
                </button>
              </div>
              <div className="amenities-chips-list">
                {formData.amenities.map((amenity, idx) => (
                  <span key={idx} className="removable-chip">
                    {amenity}
                    <button type="button" onClick={() => handleRemoveAmenity(idx)}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              {mode === 'add' ? 'Save Location' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 4: INVENTORY MANAGEMENT (PER-STORE & CROSS-STORE)
   ========================================================================== */

function InventoryTab({ products, stores, onUpdateStock, onQuickRestockAll }) {
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || 'eh-store-amd-01');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [searchTerm, setSearchTerm] = useState('');

  const currentStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0];
  }, [stores, selectedStoreId]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = getAdminProductStoreStock(p.id, selectedStoreId);
      if (stockFilter === 'low' && (stock > 3 || stock === 0)) return false;
      if (stockFilter === 'out' && stock > 0) return false;
      if (searchTerm.trim() && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [products, selectedStoreId, stockFilter, searchTerm]);

  return (
    <div className="admin-inventory-tab">
      <div className="tab-actions-bar">
        <div>
          <h2>Store-Specific Inventory &amp; Stock Control</h2>
          <p>
            Manage inventory availability separately for each physical retail location in Ahmedabad
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => onQuickRestockAll(selectedStoreId, 12)}
          title="Restock all items <= 3 units to 12 units"
        >
          ⚡ Restock Low-Stock Items to 12
        </button>
      </div>

      {/* Store Selector Tabs */}
      <div className="store-selector-tabs">
        {stores.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`store-tab-btn ${selectedStoreId === s.id ? 'active' : ''}`}
            onClick={() => setSelectedStoreId(s.id)}
          >
            <span>📍</span>
            <div>
              <strong>{s.locality}</strong>
              <small>{s.name.replace('ElectroHaven', '').trim()}</small>
            </div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="inventory-filter-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Filter inventory by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="stock-filter-buttons">
          <button
            type="button"
            className={`stock-filter-btn ${stockFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStockFilter('all')}
          >
            All Items ({products.length})
          </button>
          <button
            type="button"
            className={`stock-filter-btn low ${stockFilter === 'low' ? 'active' : ''}`}
            onClick={() => setStockFilter('low')}
          >
            ⚠️ Low Stock (1–3)
          </button>
          <button
            type="button"
            className={`stock-filter-btn out ${stockFilter === 'out' ? 'active' : ''}`}
            onClick={() => setStockFilter('out')}
          >
            ⛔ Out of Stock (0)
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-table-container">
        <table className="admin-table inventory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Selling Price</th>
              <th>Store Stock ({currentStore?.locality})</th>
              <th>Total (All Stores)</th>
              <th>Adjust Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const currentStock = getAdminProductStoreStock(p.id, selectedStoreId);
              const totalAllStores = getAdminProductTotalStock(p.id);

              return (
                <tr key={p.id}>
                  <td className="product-thumb-cell">
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={handleProductImageError}
                      className="admin-thumb-img"
                    />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <br />
                    <small>ID: #{p.id} · {p.type}</small>
                  </td>
                  <td>
                    <span className="category-badge">{p.category}</span>
                  </td>
                  <td>
                    <strong>{formatINR(p.price)}</strong>
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${
                        currentStock === 0 ? 'out' : currentStock <= 3 ? 'low' : 'in'
                      }`}
                    >
                      {currentStock === 0
                        ? '0 (Out of Stock)'
                        : currentStock <= 3
                        ? `${currentStock} (Low Stock)`
                        : `${currentStock} in stock`}
                    </span>
                  </td>
                  <td>
                    <strong>{totalAllStores} units</strong>
                  </td>
                  <td>
                    <div className="stock-control-buttons">
                      <button
                        type="button"
                        className="stock-btn"
                        disabled={currentStock <= 0}
                        onClick={() => onUpdateStock(p.id, selectedStoreId, Math.max(0, currentStock - 5))}
                        title="Decrease by 5"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        className="stock-btn"
                        disabled={currentStock <= 0}
                        onClick={() => onUpdateStock(p.id, selectedStoreId, Math.max(0, currentStock - 1))}
                        title="Decrease by 1"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="stock-num-input"
                        value={currentStock}
                        onChange={(e) =>
                          onUpdateStock(p.id, selectedStoreId, Math.max(0, Number(e.target.value) || 0))
                        }
                      />
                      <button
                        type="button"
                        className="stock-btn"
                        onClick={() => onUpdateStock(p.id, selectedStoreId, currentStock + 1)}
                        title="Increase by 1"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="stock-btn"
                        onClick={() => onUpdateStock(p.id, selectedStoreId, currentStock + 5)}
                        title="Increase by 5"
                      >
                        +5
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 5: ORDER MANAGEMENT
   ========================================================================== */

function OrdersTab({ orders, onUpdateStatus, onCancelOrder }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested order cancellation');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const status = o.orderStatus || 'Processing';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchId = (o.orderId || '').toLowerCase().includes(query);
        const matchName = (o.shippingAddress?.fullName || '').toLowerCase().includes(query);
        const matchPhone = (o.shippingAddress?.phone || '').includes(query);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  return (
    <div className="admin-orders-tab">
      <div className="tab-actions-bar">
        <div>
          <h2>Customer Order Management</h2>
          <p>Track status lifecycles, update tracking, and manage fulfillment</p>
        </div>
      </div>

      <div className="order-filter-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by Order ID (e.g. EH-2026-...), customer name, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="status-filter-pills">
          {['all', 'Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? `All (${orders.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="panel-empty">No orders found matching your filter criteria.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID &amp; Date</th>
                <th>Customer Info</th>
                <th>Shipping Address</th>
                <th>Items &amp; Total</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const totalAmt = o.pricing?.totalPaid || o.pricing?.total || o.total || 0;
                const status = o.orderStatus || o.status || 'Order Placed';
                const orderKey = o.orderId || o.id;

                return (
                  <tr key={orderKey}>
                    <td>
                      <strong className="order-id-code">{orderKey}</strong>
                      <br />
                      <small>{new Date(o.orderDate || o.createdAt).toLocaleString('en-IN')}</small>
                    </td>
                    <td>
                      <strong>{o.shippingAddress?.fullName || 'Customer'}</strong>
                      <br />
                      <small>{o.shippingAddress?.email || '—'}</small>
                      <br />
                      <small>{o.shippingAddress?.phone || '—'}</small>
                    </td>
                    <td>
                      <p className="order-address-cell">
                        {o.shippingAddress?.addressLine1}, {o.shippingAddress?.locality || o.shippingAddress?.city} - {o.shippingAddress?.pincode}
                      </p>
                    </td>
                    <td>
                      <strong>{formatINR(totalAmt)}</strong>
                      <br />
                      <small>{(o.items || []).length} items · {o.payment?.methodTitle || 'Prepaid'}</small>
                    </td>
                    <td>
                      <span className={`status-pill ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={status}
                        onChange={(e) => onUpdateStatus(orderKey, e.target.value)}
                        disabled={status === 'Cancelled'}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="action-btn view"
                        onClick={() => setSelectedOrder(o)}
                      >
                        Details
                      </button>
                      {status !== 'Cancelled' && (
                        <button
                          type="button"
                          className="action-btn cancel"
                          onClick={() => setCancelModalOrder(o)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal small-modal">
            <h3>Cancel Order #{cancelModalOrder.orderId}</h3>
            <p>Please enter the administrative cancellation reason. This will be recorded on the customer's order history.</p>
            <textarea
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Stock verification issue, customer requested..."
            />
            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setCancelModalOrder(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => {
                  onCancelOrder(cancelModalOrder.orderId, cancelReason);
                  setCancelModalOrder(null);
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus || order.status || 'Order Placed');
  const [carrier, setCarrier] = useState(order.tracking?.carrier || 'ElectroHaven Express (Partner: Delhivery)');
  const [awbNumber, setAwbNumber] = useState(order.tracking?.awbNumber || '');
  const [currentLocation, setCurrentLocation] = useState(order.tracking?.currentLocation || 'Ahmedabad Logistics Hub, Gujarat');
  const [statusNote, setStatusNote] = useState('');

  const isCancelled = (order.orderStatus || order.status || '').toLowerCase() === 'cancelled';
  const orderKey = order.orderId || order.id;

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(orderKey, selectedStatus, statusNote, {
      carrier,
      awbNumber,
      currentLocation,
    });
    onClose();
  };

  const getStepProgressIndex = (rawStatus) => {
    const s = (rawStatus || '').toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('delivered')) return 5;
    if (s.includes('out for delivery')) return 4;
    if (s.includes('shipped')) return 3;
    if (s.includes('packed') || s.includes('processing')) return 2;
    if (s.includes('confirmed')) return 1;
    return 0; // Order Placed
  };

  const progressIdx = getStepProgressIndex(order.orderStatus || order.status);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal large-modal order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order Details: {orderKey}</h2>
            <small>Placed on {new Date(order.orderDate || order.createdAt).toLocaleString('en-IN')}</small>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="order-details-body">
          {/* Visual Fulfillment Timeline */}
          {!isCancelled ? (
            <div className="admin-order-timeline-card">
              <label>Current Fulfillment Stage:</label>
              <div className="mini-progress-bar-track" style={{ height: 6, margin: '8px 0 12px' }}>
                <div
                  className="mini-progress-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(16, ((progressIdx + 1) / 6) * 100))}%` }}
                />
              </div>
              <div className="mini-progress-labels">
                <span className={progressIdx >= 0 ? 'label-active' : ''}>Order Placed</span>
                <span className={progressIdx >= 1 ? 'label-active' : ''}>Confirmed</span>
                <span className={progressIdx >= 2 ? 'label-active' : ''}>Packed</span>
                <span className={progressIdx >= 3 ? 'label-active' : ''}>Shipped</span>
                <span className={progressIdx >= 4 ? 'label-active' : ''}>Out for Delivery</span>
                <span className={progressIdx >= 5 ? 'label-active' : ''}>Delivered</span>
              </div>
            </div>
          ) : (
            <div className="admin-order-cancelled-callout">
              <strong>✕ Order is Cancelled</strong>
              <p>{order.cancellationReason || 'Cancelled upon request'} · Reserved stock has been restored to catalog &amp; stores.</p>
            </div>
          )}

          {/* Status & Carrier Update Box */}
          <form onSubmit={handleStatusSubmit} className="order-status-quick-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label>Update Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label>Logistics Carrier:</label>
              <input
                type="text"
                placeholder="e.g. Delhivery Express / Blue Dart"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>

            <div>
              <label>Tracking / AWB Number:</label>
              <input
                type="text"
                placeholder="e.g. EH-AWB-9283719"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
              />
            </div>

            <div>
              <label>Current Location:</label>
              <input
                type="text"
                placeholder="e.g. Ahmedabad Hub"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="grow-field" style={{ flex: 1 }}>
                <label>Status Note / Customer Tracking Update:</label>
                <input
                  type="text"
                  placeholder="e.g. Package dispatched from Ahmedabad Hub via Express air"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
              <button type="submit" className="admin-btn primary" style={{ height: 38 }}>
                Save &amp; Broadcast Update
              </button>
            </div>
          </form>

          {/* Customer & Address Details */}
          <div className="order-summary-grid">
            <div className="summary-block">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> {order.shippingAddress?.fullName || 'Customer'}</p>
              <p><strong>Email:</strong> {order.shippingAddress?.email || '—'}</p>
              <p><strong>Phone:</strong> {order.shippingAddress?.phone || '—'}</p>
            </div>

            <div className="summary-block">
              <h4>Delivery Destination</h4>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong></p>
              <p><small>Speed: {order.pricing?.deliverySpeed === 'express' ? '⚡ Express 1-Day' : 'Standard Delivery'}</small></p>
            </div>

            <div className="summary-block">
              <h4>Financial Breakdown</h4>
              <p>Subtotal: {formatINR(order.pricing?.subtotal || order.subtotal || 0)}</p>
              {order.pricing?.couponDiscount > 0 && (
                <p className="green-text">Coupon Discount: −{formatINR(order.pricing.couponDiscount)}</p>
              )}
              <p>Estimated GST (18%): {formatINR(order.pricing?.estimatedGst || 0)}</p>
              <p>Delivery Fee: {order.pricing?.deliveryFee === 0 || order.pricing?.delivery === 0 ? 'FREE' : formatINR(order.pricing?.deliveryFee || order.pricing?.delivery || 0)}</p>
              <p><strong>Final Total: {formatINR(order.pricing?.totalPaid || order.pricing?.total || order.total || 0)}</strong></p>
            </div>
          </div>

          {/* Ordered Products */}
          <h4>Ordered Items ({(order.items || []).length})</h4>
          <div className="ordered-items-list">
            {(order.items || []).map((item, index) => (
              <div key={index} className="order-item-card">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={handleProductImageError}
                />
                <div className="item-meta">
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                  <small>Unit Price: {formatINR(item.price)} · Quantity: {item.quantity}</small>
                </div>
                <div className="item-price">
                  <strong>{formatINR(item.price * item.quantity)}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Tracking History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="order-timeline">
              <h4>Status Timeline History</h4>
              <div className="timeline-items">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="timeline-entry">
                    <span className="dot" />
                    <div>
                      <strong>{h.status}</strong>
                      <p>{h.note}</p>
                      <small>{new Date(h.date).toLocaleString('en-IN')}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 6: USER MANAGEMENT
   ========================================================================== */

function UsersTab({ users, currentAdminId, onToggleStatus, onChangeRole, onDeleteUser, onCreateUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(query);
        const matchEmail = (u.email || '').toLowerCase().includes(query);
        const matchPhone = (u.phone || '').includes(query);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchTerm]);

  return (
    <div className="admin-users-tab">
      <div className="tab-actions-bar">
        <div>
          <h2>User Accounts &amp; Access Controls</h2>
          <p>Manage customer profiles, security status, and administrator privileges</p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => setModalOpen(true)}
        >
          <span>➕</span> Add New User
        </button>
      </div>

      <div className="user-filter-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search users by name, email, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="role-pills">
          <button
            type="button"
            className={`pill-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            All Accounts ({users.length})
          </button>
          <button
            type="button"
            className={`pill-btn ${roleFilter === 'customer' ? 'active' : ''}`}
            onClick={() => setRoleFilter('customer')}
          >
            Customers
          </button>
          <button
            type="button"
            className={`pill-btn ${roleFilter === 'admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Administrators
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact Details</th>
              <th>Role</th>
              <th>Account Status</th>
              <th>Verification</th>
              <th>Registered Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const isMasterAdmin = u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();

              return (
                <tr key={u.id}>
                  <td>
                    <div className="user-profile-cell">
                      <span className="user-avatar-circle">{u.avatar || 'U'}</span>
                      <div>
                        <strong>{u.name}</strong>
                        {isMasterAdmin && <span className="master-badge">Master</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span>{u.email}</span>
                    <br />
                    <small>{u.phone}</small>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'customer'}`}>
                      {u.role === 'admin' ? '🛡️ Administrator' : '👤 Customer'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === 'suspended' ? 'suspended' : 'active'}`}>
                      {u.status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <small>
                      {u.emailVerified ? '✓ Email Verified' : '○ Email Unverified'}
                    </small>
                  </td>
                  <td>
                    <small>{new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN')}</small>
                  </td>
                  <td className="actions-cell">
                    {!isMasterAdmin && (
                      <>
                        <button
                          type="button"
                          className={`action-btn ${u.status === 'suspended' ? 'view' : 'cancel'}`}
                          onClick={() => onToggleStatus(u.id, u.status === 'suspended' ? 'active' : 'suspended')}
                          title={u.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                        >
                          {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        <button
                          type="button"
                          className="action-btn edit"
                          onClick={() => onChangeRole(u.id, u.role === 'admin' ? 'customer' : 'admin')}
                          title="Toggle Admin / Customer Role"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          onClick={() => onDeleteUser(u.id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <CreateUserModal
          onClose={() => setModalOpen(false)}
          onCreate={async (data) => {
            await onCreateUser(data);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('Password@123');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please fill in user details.');
      return;
    }
    onCreate({ name, email, phone, role, password });
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal small-modal">
        <div className="modal-header">
          <h2>➕ Create User Account</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Patel"
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya.patel@example.com"
            />
          </div>

          <div className="form-group">
            <label>Mobile Number (10 digits) *</label>
            <input
              type="tel"
              required
              maxLength="10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
          </div>

          <div className="form-group">
            <label>Account Role *</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer (Standard Access)</option>
              <option value="admin">Administrator (Full Dashboard Access)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Temporary Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 7: OFFERS & COUPONS MANAGEMENT
   ========================================================================== */

function OffersTab({ products, coupons, onAddCoupon, onUpdateCoupon, onToggleCoupon, onDeleteCoupon, onToggleHotDeal }) {
  const [modalOpen, setModalOpen] = useState(false);

  const hotDealsProducts = useMemo(() => {
    return products.filter((p) => p.isHotDeal || (p.discount && p.discount.includes('OFF')));
  }, [products]);

  return (
    <div className="admin-offers-tab">
      <div className="tab-actions-bar">
        <div>
          <h2>Promotional Offers, Coupons &amp; Hot Deals</h2>
          <p>Create cart promo codes and configure homepage Hot Deals drops</p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => setModalOpen(true)}
        >
          <span>➕</span> Create New Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <h3>Active &amp; Available Cart Coupons</h3>
      <div className="coupons-admin-grid">
        {coupons.map((c) => (
          <div key={c.code} className={`coupon-admin-card ${c.status === 'inactive' ? 'disabled' : ''}`}>
            <div className="coupon-card-header">
              <strong className="coupon-code-pill">{c.code}</strong>
              <span className={`status-pill ${c.status === 'inactive' ? 'cancelled' : 'delivered'}`}>
                {c.status === 'inactive' ? 'Disabled' : 'Active'}
              </span>
            </div>

            <p className="coupon-desc">{c.description}</p>

            <div className="coupon-math-details">
              <div>
                <small>Discount</small>
                <strong>{c.type === 'percentage' ? `${c.value}% OFF` : formatINR(c.value)}</strong>
              </div>
              <div>
                <small>Min Order</small>
                <strong>{formatINR(c.minimumSpend || 0)}</strong>
              </div>
              {c.maximumDiscount && (
                <div>
                  <small>Max Cap</small>
                  <strong>{formatINR(c.maximumDiscount)}</strong>
                </div>
              )}
            </div>

            <div className="coupon-card-actions">
              <button
                type="button"
                className="admin-btn small secondary"
                onClick={() => onToggleCoupon(c.code)}
              >
                {c.status === 'inactive' ? 'Enable' : 'Disable'}
              </button>
              <button
                type="button"
                className="admin-btn small danger"
                onClick={() => onDeleteCoupon(c.code)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hot Deals Showcase Configurator */}
      <div className="hot-deals-admin-section">
        <div className="section-head">
          <div>
            <h3>Hot Deals Showcase ({hotDealsProducts.length} items currently featured)</h3>
            <p>Products featured on the homepage Deals marquee and the Deals category page</p>
          </div>
        </div>

        <div className="deals-products-strip">
          {products.slice(0, 16).map((p) => {
            const isDeal = p.isHotDeal || (p.discount && p.discount.includes('OFF'));

            return (
              <div key={p.id} className={`deal-toggle-card ${isDeal ? 'active-deal' : ''}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  onError={handleProductImageError}
                />
                <div className="deal-card-meta">
                  <strong>{p.name}</strong>
                  <span>{formatINR(p.price)} {p.discount && `(${p.discount})`}</span>
                </div>
                <button
                  type="button"
                  className={`deal-action-btn ${isDeal ? 'remove' : 'add'}`}
                  onClick={() => onToggleHotDeal(p.id, !isDeal)}
                >
                  {isDeal ? '✓ Featured in Deals' : '+ Add to Deals'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <CreateCouponModal
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            onAddCoupon(data);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateCouponModal({ onClose, onSave }) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState(15);
  const [minimumSpend, setMinimumSpend] = useState(2000);
  const [maximumDiscount, setMaximumDiscount] = useState(1500);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Please provide a coupon code.');
      return;
    }
    onSave({
      code: code.trim().toUpperCase(),
      description: description.trim() || `${code} discount offer`,
      type,
      value: Number(value),
      minimumSpend: Number(minimumSpend),
      maximumDiscount: type === 'percentage' ? Number(maximumDiscount) : null,
      status: 'active',
    });
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal small-modal">
        <div className="modal-header">
          <h2>🏷️ Create Discount Coupon</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Coupon Code (e.g. FESTIVE25) *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MEGA50"
            />
          </div>

          <div className="form-group">
            <label>Description / Public Offer Note *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="15% off up to ₹1,500 on orders over ₹2,000"
            />
          </div>

          <div className="form-group">
            <label>Discount Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="percentage">Percentage (%) Off</option>
              <option value="fixed">Flat Rupee (₹) Amount Off</option>
            </select>
          </div>

          <div className="form-group">
            <label>{type === 'percentage' ? 'Percentage Discount (%)' : 'Flat Discount Amount (₹)'} *</label>
            <input
              type="number"
              required
              min="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Minimum Order Spend (₹)</label>
            <input
              type="number"
              min="0"
              value={minimumSpend}
              onChange={(e) => setMinimumSpend(e.target.value)}
            />
          </div>

          {type === 'percentage' && (
            <div className="form-group">
              <label>Maximum Cap Discount (₹)</label>
              <input
                type="number"
                min="100"
                value={maximumDiscount}
                onChange={(e) => setMaximumDiscount(e.target.value)}
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   ADMIN SECURITY GATE (ROLE-BASED GUARD)
   ========================================================================== */

function AdminSecurityGate({ currentUser, onLoginSuccess, onExitToStore }) {
  const [identifier, setIdentifier] = useState('admin@electrohaven.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ identifier, password });
      if (!res.success) {
        setError(res.error || 'Authentication failed.');
        setLoading(false);
        return;
      }

      if (res.user.role !== 'admin' && res.user.email?.toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
        setError('Access Denied: This account does not possess administrative privileges.');
        setLoading(false);
        return;
      }

      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setIdentifier('admin@electrohaven.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="admin-security-gate">
      <div className="security-card">
        <div className="security-icon-lock">🔒</div>
        <h2>ElectroHaven Admin Gateway</h2>
        <p className="security-sub">
          Role-Based Access Control: Administrative privileges are required to access store
          inventory, product catalogs, customer orders, and financial data.
        </p>

        {currentUser && (
          <div className="security-alert-box">
            <span>⚠️</span>
            <div>
              <strong>Currently signed in as {currentUser.name} ({currentUser.email})</strong>
              <small>Your account role is "{currentUser.role || 'customer'}". Please sign in with an Administrator account.</small>
            </div>
          </div>
        )}

        {error && <div className="security-error-box">{error}</div>}

        <form onSubmit={handleAdminLogin} className="security-form">
          <div className="security-field">
            <label>Admin Email or Mobile</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@electrohaven.com"
            />
          </div>

          <div className="security-field">
            <label>Admin Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="quick-admin-demo">
            <button
              type="button"
              className="quick-demo-link"
              onClick={handleQuickFillAdmin}
            >
              ⚡ 1-Click Fill Admin Credentials (admin@electrohaven.com / Admin@123)
            </button>
          </div>

          <button
            type="submit"
            className="security-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator →'}
          </button>
        </form>

        <div className="security-footer">
          <button type="button" className="text-link" onClick={onExitToStore}>
            ← Return to ElectroHaven Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
