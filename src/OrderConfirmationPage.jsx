import React, { useState, useEffect } from 'react';
import { formatINR } from './currency';
import { handleProductImageError } from './imageUtils';
import {
  ORDER_STATUS_FLOW,
  PICKUP_STATUS_FLOW,
  isOrderCancellable,
  cancelCustomerOrder,
  getAdminOrders,
} from './adminData';
import { getGoogleMapsDirectionsUrl } from './storesData';
import { subscribeToRealtimeSync } from './realtimeSync';
import OrderTrackingModal from './OrderTrackingModal';

const CANCELLATION_REASONS = [
  'Found a better price / deal elsewhere',
  'Delivery time is longer than expected',
  'Need to change delivery address or phone number',
  'Ordered duplicate items or by mistake',
  'Want to choose a different brand or model variant',
  'Other reason',
];

export default function OrderConfirmationPage({
  order: initialOrder,
  onContinueShopping,
  onNavigateOrders,
}) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelComment, setCancelComment] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const orderId = currentOrder?.orderId || currentOrder?.id;
  const isStorePickup = currentOrder?.fulfillmentType === 'store_pickup';

  // Real-time synchronization: listen for admin changes to this order
  useEffect(() => {
    if (!orderId) return;
    const reloadOrder = () => {
      const allOrders = getAdminOrders();
      const fresh = allOrders.find((o) => (o.orderId || o.id) === orderId);
      if (fresh) {
        setCurrentOrder(fresh);
      }
    };

    const unsubscribe = subscribeToRealtimeSync((msg) => {
      if (msg.entity === 'orders') {
        reloadOrder();
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (!currentOrder) {
    return (
      <div className="section empty-state">
        <h2>No Recent Order Found</h2>
        <p>You can browse our electronics catalogue to start an order.</p>
        <button className="primary" type="button" onClick={onContinueShopping}>
          Browse Products <b>→</b>
        </button>
      </div>
    );
  }

  const status = currentOrder.orderStatus || currentOrder.status || (isStorePickup ? 'Preparing' : 'Order Placed');
  const isCancelled = status.toLowerCase() === 'cancelled';
  const cancellable = isOrderCancellable(status, currentOrder.fulfillmentType) && !isCancelled;

  // Active step index
  let activeStepIndex = 0;
  if (!isCancelled) {
    const cleanStatus = status.toLowerCase();
    if (isStorePickup) {
      if (cleanStatus === 'order placed') activeStepIndex = 0;
      else if (cleanStatus === 'preparing') activeStepIndex = 1;
      else if (cleanStatus === 'ready for pickup') activeStepIndex = 2;
      else if (cleanStatus === 'collected') activeStepIndex = 3;
    } else {
      if (cleanStatus === 'order placed') activeStepIndex = 0;
      else if (cleanStatus === 'confirmed') activeStepIndex = 1;
      else if (cleanStatus === 'packed' || cleanStatus === 'processing') activeStepIndex = 2;
      else if (cleanStatus === 'shipped') activeStepIndex = 3;
      else if (cleanStatus === 'out for delivery') activeStepIndex = 4;
      else if (cleanStatus === 'delivered') activeStepIndex = 5;
    }
  }

  const handleCopyCode = (code) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleConfirmCancellation = (e) => {
    e.preventDefault();
    setIsCancelling(true);

    const fullReason = cancelComment.trim()
      ? `${cancelReason} - ${cancelComment.trim()}`
      : cancelReason;

    setTimeout(() => {
      const result = cancelCustomerOrder(orderId, fullReason, 'Customer');
      setIsCancelling(false);

      if (result.success) {
        setCurrentOrder(result.order);
        setShowCancelModal(false);
        setToastMessage(
          isStorePickup
            ? 'Store pickup order has been cancelled and reserved stock restored to the store.'
            : 'Order has been cancelled and reserved inventory restored to store.'
        );
        setTimeout(() => setToastMessage(''), 4500);
      } else {
        alert(result.message || 'Failed to cancel order.');
      }
    }, 500);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const trackingInfo = currentOrder.tracking || {
    carrier: isStorePickup ? 'ElectroHaven Store Counter' : 'ElectroHaven Express (Partner: Delhivery)',
    awbNumber: currentOrder.pickupCode || `EH-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`,
    currentLocation: currentOrder.pickupStore?.name || 'Ahmedabad Warehouse & Logistics Hub, Gujarat',
    estimatedDelivery: currentOrder.deliveryEstimate || 'Ready for Pickup in 2 Hours',
  };

  const pickupStore = currentOrder.pickupStore;

  return (
    <div className="order-confirmation-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="order-tracking-alert-banner success" style={{ marginBottom: 20 }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Celebratory Hero Card */}
      <div className={`confirmation-hero-card ${isCancelled ? 'card-cancelled' : ''}`}>
        <div className={`confirmation-badge-icon ${isCancelled ? 'badge-cancelled' : ''}`}>
          {isCancelled ? '✕' : isStorePickup ? '🏬' : '✓'}
        </div>
        <h1>
          {isCancelled
            ? 'Order Cancelled'
            : isStorePickup
            ? 'Store Pickup Order Confirmed!'
            : 'Order Confirmed!'}
        </h1>
        <p className="confirmation-order-id">
          Order ID: <strong>{orderId}</strong> ·{' '}
          <span className={`order-status-pill ${isCancelled ? 'status-cancelled' : 'status-confirmed'}`}>
            ● {status}
          </span>
          {isStorePickup && (
            <span className="order-status-pill status-packed" style={{ marginLeft: 8 }}>
              🏬 Click &amp; Collect
            </span>
          )}
        </p>
        <p className="confirmation-subtext">
          {isCancelled ? (
            <>
              This order was cancelled. Reserved products have been returned to store stock, and a 100% refund of{' '}
              <b>{formatINR(currentOrder.pricing?.totalPaid || currentOrder.total || 0)}</b> has been initiated to your original payment method.
            </>
          ) : isStorePickup ? (
            <>
              Thank you, <b>{currentOrder.shippingAddress?.fullName || 'Customer'}</b>! Your order has been routed to{' '}
              <strong>{pickupStore?.name}</strong>. Our store associates are preparing your package now.
            </>
          ) : (
            <>
              Thank you, <b>{currentOrder.shippingAddress?.fullName || 'Customer'}</b>! We have received your order and our Ahmedabad warehouse has begun preparing it.
            </>
          )}
        </p>
        <div className="confirmation-quick-meta">
          <span>📅 Date: {currentOrder.formattedDate}</span>
          <span>
            {isStorePickup ? '⚡ Estimated Readiness:' : '🚚 Delivery:'}{' '}
            <b>{isCancelled ? 'Cancelled' : currentOrder.deliveryEstimate}</b>
          </span>
          <span>💳 Payment: <b>{currentOrder.payment?.methodTitle || 'Paid'}</b></span>
        </div>
      </div>

      {/* Visual Tracking Progress Timeline */}
      <div className="confirmation-section-card">
        <div className="confirmation-section-head-with-action">
          <div>
            <h3>{isStorePickup ? 'Live Store Pickup Progress' : 'Live Shipment Progress'}</h3>
            <span className="realtime-live-badge">
              <span className="live-dot" /> Instant Real-Time Sync
            </span>
          </div>

          <div className="confirmation-head-buttons">
            <button
              type="button"
              className="outline-button"
              onClick={() => setShowTrackingModal(true)}
            >
              ⚡ Detailed Tracking Modal
            </button>
            {cancellable && (
              <button
                type="button"
                className="danger-button cancel-order-btn-small"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {isCancelled ? (
          <div className="order-cancelled-banner">
            <div className="cancelled-banner-icon">✕</div>
            <div className="cancelled-banner-content">
              <h4>Order Has Been Cancelled</h4>
              <p>
                <strong>Reason:</strong> {currentOrder.cancellationReason || 'Cancelled upon customer request'}
              </p>
              <div className="cancelled-badges-row">
                <span className="cancelled-chip">✓ Reserved Store Inventory Restored</span>
                <span className="cancelled-chip">✓ 100% Refund Initiated</span>
              </div>
            </div>
          </div>
        ) : isStorePickup ? (
          /* 4-Stage Store Pickup Timeline */
          <div className="croma-tracking-timeline pickup-timeline-4col">
            {PICKUP_STATUS_FLOW.map((stepName, idx) => {
              const isCompleted = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              let stepIcon = '●';
              if (idx === 0) stepIcon = '📝';
              if (idx === 1) stepIcon = '📦';
              if (idx === 2) stepIcon = '⚡';
              if (idx === 3) stepIcon = '✓';

              return (
                <div
                  key={stepName}
                  className={`croma-timeline-step ${
                    isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-upcoming'
                  }`}
                >
                  <div className="timeline-node-circle">
                    {isCompleted ? '✓' : stepIcon}
                  </div>
                  <div className="timeline-label-wrap">
                    <strong className="timeline-step-title">{stepName}</strong>
                    <span className="timeline-step-sub">
                      {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 6-Stage Delivery Timeline */
          <div className="croma-tracking-timeline">
            {ORDER_STATUS_FLOW.map((stepName, idx) => {
              const isCompleted = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              let stepIcon = '●';
              if (idx === 0) stepIcon = '📝';
              if (idx === 1) stepIcon = '✓';
              if (idx === 2) stepIcon = '📦';
              if (idx === 3) stepIcon = '🚚';
              if (idx === 4) stepIcon = '🛵';
              if (idx === 5) stepIcon = '🏠';

              return (
                <div
                  key={stepName}
                  className={`croma-timeline-step ${
                    isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-upcoming'
                  }`}
                >
                  <div className="timeline-node-circle">
                    {isCompleted ? '✓' : stepIcon}
                  </div>
                  <div className="timeline-label-wrap">
                    <strong className="timeline-step-title">{stepName}</strong>
                    <span className="timeline-step-sub">
                      {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Courier / Store Pickup Details Strip */}
        {isStorePickup && pickupStore ? (
          <div className="confirmation-pickup-card">
            <div className="pickup-pass-code-banner">
              <div>
                <small>4-DIGIT PICKUP PASS CODE</small>
                <strong>{currentOrder.pickupCode || 'EH-PASS-7842'}</strong>
              </div>
              <button
                type="button"
                className="copy-btn-inline"
                onClick={() => handleCopyCode(currentOrder.pickupCode || 'EH-PASS-7842')}
              >
                {copiedCode ? '✓ Copied' : '📋 Copy Pass'}
              </button>
            </div>

            <div className="pickup-store-meta-grid">
              <div>
                <small>PICKUP LOCATION</small>
                <strong>{pickupStore.name}</strong>
                <p>{pickupStore.address}</p>
              </div>
              <div>
                <small>STORE TIMINGS &amp; CONTACT</small>
                <strong>🕒 {pickupStore.timing || '10:30 AM – 9:30 PM'}</strong>
                <p>📞 {pickupStore.contact}</p>
              </div>
              <div className="pickup-action-col">
                <a
                  href={getGoogleMapsDirectionsUrl(pickupStore)}
                  target="_blank"
                  rel="noreferrer"
                  className="outline-button store-dir-btn"
                >
                  Get Directions on Maps ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="confirmation-courier-strip">
            <div className="courier-strip-col">
              <small>LOGISTICS PARTNER</small>
              <strong>{trackingInfo.carrier}</strong>
            </div>
            <div className="courier-strip-col">
              <small>AWB / TRACKING NUMBER</small>
              <div className="awb-copy-inline">
                <code>{trackingInfo.awbNumber}</code>
                <button
                  type="button"
                  className="copy-btn-inline"
                  onClick={() => handleCopyCode(trackingInfo.awbNumber)}
                >
                  {copiedCode ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>
            <div className="courier-strip-col">
              <small>CURRENT HUB LOCATION</small>
              <strong>{trackingInfo.currentLocation}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Details Breakdown */}
      <div className="confirmation-details-grid">
        {/* Left Column: Items */}
        <div className="confirmation-items-column">
          <div className="confirmation-section-card">
            <h3>Items in this Order ({currentOrder.items?.length || 0})</h3>
            <div className="confirmation-items-list">
              {currentOrder.items?.map((item) => (
                <div key={item.id} className="confirm-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="confirm-item-img"
                    onError={handleProductImageError}
                  />
                  <div className="confirm-item-meta">
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                    <div className="confirm-item-bottom">
                      <span>Quantity: {item.quantity}</span>
                      <b>{formatINR(item.price * item.quantity)}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address, Payment & Financials */}
        <div className="confirmation-summary-column">
          <div className="confirmation-section-card">
            <h3>{isStorePickup ? 'Pickup Customer Details' : 'Delivery & Contact'}</h3>
            <div className="confirm-meta-block">
              <strong>{currentOrder.shippingAddress?.fullName}</strong>
              {isStorePickup ? (
                <>
                  <p className="pickup-desk-note">
                    🏬 In-Store Pickup at: <b>{pickupStore?.name}</b>
                  </p>
                  <p>{pickupStore?.address}</p>
                </>
              ) : (
                <>
                  <p>
                    {currentOrder.shippingAddress?.addressLine1}
                    {currentOrder.shippingAddress?.addressLine2 ? `, ${currentOrder.shippingAddress?.addressLine2}` : ''}
                  </p>
                  <p>
                    {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} – <b>{currentOrder.shippingAddress?.pincode}</b>
                  </p>
                </>
              )}
              <p className="confirm-phone">📞 +91 {currentOrder.shippingAddress?.phone}</p>
              <p className="confirm-email">✉ {currentOrder.shippingAddress?.email}</p>
            </div>
          </div>

          <div className="confirmation-section-card">
            <h3>Payment &amp; Invoicing</h3>
            <div className="summary-lines">
              <div>
                <span>Items Subtotal</span>
                <strong>{formatINR(currentOrder.pricing?.subtotal)}</strong>
              </div>
              {currentOrder.pricing?.productSavings > 0 && (
                <div className="summary-discount">
                  <span>Product Savings</span>
                  <strong>− {formatINR(currentOrder.pricing?.productSavings)}</strong>
                </div>
              )}
              {currentOrder.pricing?.couponDiscount > 0 && (
                <div className="summary-discount">
                  <span>Coupon ({currentOrder.pricing?.couponCode})</span>
                  <strong>− {formatINR(currentOrder.pricing?.couponDiscount)}</strong>
                </div>
              )}
              <div>
                <span>Estimated GST (18%)</span>
                <strong>{formatINR(currentOrder.pricing?.estimatedGst)}</strong>
              </div>
              <div>
                <span>{isStorePickup ? 'Store Pickup Fee' : 'Delivery Charge'}</span>
                <strong>
                  <span className="delivery-free">FREE</span>
                </strong>
              </div>
            </div>

            <div className="summary-total">
              <span>Total Paid</span>
              <strong>{formatINR(currentOrder.pricing?.totalPaid)}</strong>
            </div>

            <div className="confirm-actions-row">
              <button type="button" className="primary" onClick={onContinueShopping}>
                Continue Shopping <b>→</b>
              </button>
              <button type="button" className="outline-button" onClick={onNavigateOrders}>
                View My Orders
              </button>
              <button type="button" className="text-button" onClick={handlePrintInvoice}>
                🖨 Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Tracking Modal */}
      {showTrackingModal && (
        <OrderTrackingModal
          order={currentOrder}
          onClose={() => setShowTrackingModal(false)}
          onOrderUpdated={(updated) => setCurrentOrder(updated)}
        />
      )}

      {/* Cancellation Dialog */}
      {showCancelModal && (
        <div className="cancel-order-dialog-overlay" onClick={() => setShowCancelModal(false)}>
          <div
            className="cancel-order-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cancel-dialog-head">
              <h3>Cancel Order #{orderId}?</h3>
              <button
                type="button"
                className="order-tracking-close-btn"
                onClick={() => setShowCancelModal(false)}
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
                    All reserved products will be restored to {pickupStore?.name || 'store'} inventory, and a 100% refund of{' '}
                    <b>{formatINR(currentOrder.pricing?.totalPaid || currentOrder.total || 0)}</b> will be credited back to your{' '}
                    {currentOrder.payment?.methodTitle || 'payment method'}.
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmCancellation}>
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
                    onClick={() => setShowCancelModal(false)}
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
    </div>
  );
}
