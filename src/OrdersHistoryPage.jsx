import React, { useState, useEffect } from 'react';
import { formatINR } from './currency';
import { getStoredOrders } from './cart';
import { subscribeToRealtimeSync } from './realtimeSync';
import { handleProductImageError } from './imageUtils';
import { isOrderCancellable, cancelCustomerOrder } from './adminData';
import OrderTrackingModal from './OrderTrackingModal';

const CANCELLATION_REASONS = [
  'Found a better price / deal elsewhere',
  'Delivery time is longer than expected',
  'Need to change delivery address or phone number',
  'Ordered duplicate items or by mistake',
  'Want to choose a different brand or model variant',
  'Other reason',
];

export default function OrdersHistoryPage({
  user,
  onContinueShopping,
  onReorderItems,
  onViewOrderDetails,
  onPromptLogin,
}) {
  const [orders, setOrders] = useState([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelComment, setCancelComment] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadOrders = () => {
    const userOrders = getStoredOrders(user?.id);
    setOrders(userOrders);
  };

  useEffect(() => {
    if (!user && onPromptLogin) {
      onPromptLogin('Orders');
      return;
    }
    loadOrders();

    const unsubscribe = subscribeToRealtimeSync((msg) => {
      if (msg.entity === 'orders') {
        loadOrders();
      }
    });
    return () => unsubscribe();
  }, [user, onPromptLogin]);

  if (!user) {
    return (
      <div className="section empty-state">
        <h2>Please Sign In</h2>
        <p>You need to be signed in to view your order history.</p>
        <button
          className="primary"
          type="button"
          onClick={() => onPromptLogin && onPromptLogin('Orders')}
        >
          Sign In / Register <b>→</b>
        </button>
      </div>
    );
  }

  const handleOpenCancelDialog = (order) => {
    setCancelModalOrder(order);
    setCancelReason(CANCELLATION_REASONS[0]);
    setCancelComment('');
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsCancelling(true);

    const fullReason = cancelComment.trim()
      ? `${cancelReason} - ${cancelComment.trim()}`
      : cancelReason;

    setTimeout(() => {
      const orderId = cancelModalOrder.orderId || cancelModalOrder.id;
      const result = cancelCustomerOrder(orderId, fullReason, 'Customer');
      setIsCancelling(false);

      if (result.success) {
        setCancelModalOrder(null);
        loadOrders();
        setToastMessage(`Order #${orderId} was cancelled successfully. Reserved inventory restored.`);
        setTimeout(() => setToastMessage(''), 4500);
      } else {
        alert(result.message || 'Failed to cancel order.');
      }
    }, 500);
  };

  const getStatusClass = (rawStatus) => {
    const s = (rawStatus || 'Order Placed').toLowerCase();
    if (s.includes('cancel')) return 'status-cancelled';
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('out for delivery')) return 'status-out-for-delivery';
    if (s.includes('shipped')) return 'status-shipped';
    if (s.includes('packed') || s.includes('processing')) return 'status-packed';
    if (s.includes('confirmed')) return 'status-confirmed';
    return 'status-placed';
  };

  // Helper to determine step index for mini progress bar (0 to 5)
  const getStepProgressIndex = (rawStatus) => {
    const s = (rawStatus || 'Order Placed').toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('delivered')) return 5;
    if (s.includes('out for delivery')) return 4;
    if (s.includes('shipped')) return 3;
    if (s.includes('packed') || s.includes('processing')) return 2;
    if (s.includes('confirmed')) return 1;
    return 0; // Order Placed
  };

  return (
    <section className="section orders-history-page">
      <div className="section-head">
        <div>
          <p className="kicker">MY ACCOUNT</p>
          <h1>Order History &amp; Live Tracking</h1>
          <p className="catalog-description">
            Track active shipments in real-time, view past tax invoices, cancel orders before shipment, and reorder favourite tech.
          </p>
        </div>
        <button className="text-button" type="button" onClick={onContinueShopping}>
          ← Continue Shopping
        </button>
      </div>

      {toastMessage && (
        <div className="order-tracking-alert-banner success" style={{ marginBottom: 20 }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">📦</div>
          <h2>No orders placed yet</h2>
          <p>When you purchase electronics from ElectroHaven, your orders, live tracking timeline, and invoices will appear here.</p>
          <button className="primary" type="button" onClick={onContinueShopping}>
            Explore Flagship Tech <b>→</b>
          </button>
        </div>
      ) : (
        <div className="orders-list-wrap">
          {orders.map((order) => {
            const rawStatus = order.orderStatus || order.status || 'Order Placed';
            const isCancelled = rawStatus.toLowerCase() === 'cancelled';
            const cancellable = isOrderCancellable(rawStatus) && !isCancelled;
            const progressIdx = getStepProgressIndex(rawStatus);

            return (
              <article key={order.id || order.orderId} className={`order-history-card ${isCancelled ? 'card-cancelled' : ''}`}>
                <div className="order-history-header">
                  <div className="order-id-meta">
                    <span className="order-tag">ORDER</span>
                    <strong>{order.id || order.orderId}</strong>
                    <span className="order-date">Placed on {order.formattedDate}</span>
                  </div>
                  <div className="order-header-right">
                    <span className={`order-status-pill ${getStatusClass(rawStatus)}`}>
                      ● {rawStatus}
                    </span>
                    <b className="order-total-amount">
                      {formatINR(order.pricing?.totalPaid || order.total || 0)}
                    </b>
                  </div>
                </div>

                {/* Visual Mini Tracking Progress Bar */}
                {!isCancelled ? (
                  <div className="order-card-mini-progress">
                    <div className="mini-progress-bar-track">
                      <div
                        className="mini-progress-bar-fill"
                        style={{ width: `${Math.min(100, Math.max(12, ((progressIdx + 1) / 6) * 100))}%` }}
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
                  <div className="order-card-cancelled-callout">
                    <span>✕ Order Cancelled</span>
                    <small>
                      {order.cancellationReason || 'Cancelled by customer'} · Reserved stock restored
                    </small>
                  </div>
                )}

                <div className="order-history-body">
                  {/* Items strip */}
                  <div className="order-items-strip">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-strip-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-strip-img"
                          onError={handleProductImageError}
                        />
                        <div className="order-strip-meta">
                          <strong>{item.name}</strong>
                          <span>
                            Qty: {item.quantity} · {formatINR(item.price)} each
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery and payment mini info */}
                  <div className="order-details-meta">
                    <div className="order-meta-col">
                      <small>SHIPPED TO</small>
                      <strong>{order.shippingAddress?.fullName}</strong>
                      <span>
                        {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                      </span>
                    </div>
                    <div className="order-meta-col">
                      <small>TRACKING PARTNER</small>
                      <strong>{order.tracking?.carrier || 'ElectroHaven Express'}</strong>
                      <span>AWB: {order.tracking?.awbNumber || 'EH-AWB-PENDING'}</span>
                    </div>
                    <div className="order-meta-col">
                      <small>ESTIMATED ARRIVAL</small>
                      <strong style={{ color: isCancelled ? '#e53e3e' : '#68d391' }}>
                        {isCancelled ? 'Order Cancelled' : order.deliveryEstimate}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="order-history-footer">
                  <div className="order-footer-left">
                    <button
                      type="button"
                      className="primary order-track-cta-btn"
                      onClick={() => setActiveTrackingOrder(order)}
                    >
                      ⚡ Track Order &amp; Milestones
                    </button>
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => onViewOrderDetails && onViewOrderDetails(order)}
                    >
                      Tax Invoice &amp; Receipt
                    </button>
                  </div>

                  <div className="order-footer-right">
                    {cancellable && (
                      <button
                        type="button"
                        className="text-button cancel-order-link"
                        onClick={() => handleOpenCancelDialog(order)}
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-button reorder-link"
                      onClick={() => onReorderItems && onReorderItems(order.items)}
                    >
                      ↻ Reorder Items
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Standalone Interactive Order Tracking Modal */}
      {activeTrackingOrder && (
        <OrderTrackingModal
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
          onOrderUpdated={(updated) => {
            setActiveTrackingOrder(updated);
            loadOrders();
          }}
        />
      )}

      {/* Direct Order Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="cancel-order-dialog-overlay" onClick={() => setCancelModalOrder(null)}>
          <div
            className="cancel-order-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cancel-dialog-head">
              <h3>Cancel Order #{cancelModalOrder.orderId || cancelModalOrder.id}?</h3>
              <button
                type="button"
                className="order-tracking-close-btn"
                onClick={() => setCancelModalOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="cancel-dialog-body">
              <div className="cancel-warning-banner">
                <span>⚠️</span>
                <div>
                  <strong>Order cancellation is immediate.</strong>
                  <p>
                    All reserved stock will be returned to ElectroHaven store inventory automatically, and a 100% refund of{' '}
                    <b>{formatINR(cancelModalOrder.pricing?.totalPaid || cancelModalOrder.total || 0)}</b> will be credited back to{' '}
                    {cancelModalOrder.payment?.methodTitle || 'your payment source'}.
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmCancel}>
                <label className="cancel-form-label">
                  Reason for cancellation:
                </label>
                <select
                  className="cancel-reason-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <label className="cancel-form-label">
                  Additional note (optional):
                </label>
                <textarea
                  className="cancel-comment-area"
                  rows={3}
                  placeholder="Tell us what went wrong..."
                  value={cancelComment}
                  onChange={(e) => setCancelComment(e.target.value)}
                />

                <div className="cancel-dialog-buttons">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setCancelModalOrder(null)}
                    disabled={isCancelling}
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    className="danger-button"
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling & Restoring Stock...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
