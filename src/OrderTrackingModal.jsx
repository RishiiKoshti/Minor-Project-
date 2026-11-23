import React, { useState, useEffect } from 'react';
import { formatINR } from './currency';
import { handleProductImageError } from './imageUtils';
import {
  ORDER_STATUS_FLOW,
  isOrderCancellable,
  cancelCustomerOrder,
  getAdminOrders,
} from './adminData';
import { subscribeToRealtimeSync } from './realtimeSync';

const CANCELLATION_REASONS = [
  'Found a better price / deal elsewhere',
  'Delivery time is longer than expected',
  'Need to change delivery address or phone number',
  'Ordered duplicate items or by mistake',
  'Want to choose a different brand or model variant',
  'Other reason',
];

export default function OrderTrackingModal({
  order: initialOrder,
  onClose,
  onOrderUpdated,
}) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelComment, setCancelComment] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const orderId = currentOrder?.orderId || currentOrder?.id;

  // Real-time synchronization: listen for admin changes to this order across tabs!
  useEffect(() => {
    const reloadOrder = () => {
      const allOrders = getAdminOrders();
      const fresh = allOrders.find((o) => (o.orderId || o.id) === orderId);
      if (fresh) {
        setCurrentOrder(fresh);
        if (onOrderUpdated) onOrderUpdated(fresh);
      }
    };

    const unsubscribe = subscribeToRealtimeSync((msg) => {
      if (msg.entity === 'orders') {
        reloadOrder();
      }
    });

    return () => unsubscribe();
  }, [orderId, onOrderUpdated]);

  if (!currentOrder) return null;

  const status = currentOrder.orderStatus || currentOrder.status || 'Order Placed';
  const isCancelled = status.toLowerCase() === 'cancelled';
  const cancellable = isOrderCancellable(status) && !isCancelled;

  // Determine current timeline active step index (0 to 5)
  let activeStepIndex = 0;
  if (!isCancelled) {
    const cleanStatus = status.toLowerCase();
    if (cleanStatus === 'order placed') activeStepIndex = 0;
    else if (cleanStatus === 'confirmed') activeStepIndex = 1;
    else if (cleanStatus === 'packed' || cleanStatus === 'processing') activeStepIndex = 2;
    else if (cleanStatus === 'shipped') activeStepIndex = 3;
    else if (cleanStatus === 'out for delivery') activeStepIndex = 4;
    else if (cleanStatus === 'delivered') activeStepIndex = 5;
  }

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    try {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2200);
    } catch {
      // Fallback
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2200);
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
        setToastMessage('Order has been successfully cancelled and inventory restored.');
        if (onOrderUpdated) onOrderUpdated(result.order);
        setTimeout(() => setToastMessage(''), 4500);
      } else {
        alert(result.message || 'Failed to cancel order.');
      }
    }, 600);
  };

  const trackingInfo = currentOrder.tracking || {
    carrier: 'ElectroHaven Express (Partner: Delhivery)',
    awbNumber: `EH-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`,
    currentLocation: 'Ahmedabad Warehouse & Logistics Hub, Gujarat',
    estimatedDelivery: currentOrder.deliveryEstimate || 'In 2 - 3 business days',
  };

  return (
    <div className="order-tracking-modal-backdrop" onClick={onClose}>
      <div
        className="order-tracking-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="order-tracking-modal-head">
          <div>
            <div className="order-tracking-head-badge-row">
              <span className="order-tracking-kicker">ORDER TRACKING</span>
              <span className={`order-tracking-status-pill ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                ● {status}
              </span>
            </div>
            <h2>Order #{orderId}</h2>
            <p className="order-tracking-meta-sub">
              Placed on {currentOrder.formattedDate || 'Recent'} · Total: <b>{formatINR(currentOrder.pricing?.totalPaid || currentOrder.total || 0)}</b>
            </p>
          </div>
          <button
            type="button"
            className="order-tracking-close-btn"
            onClick={onClose}
            aria-label="Close tracking details"
          >
            ✕
          </button>
        </div>

        {/* Live Notification Banner */}
        {toastMessage && (
          <div className="order-tracking-alert-banner success">
            <span>✓</span> {toastMessage}
          </div>
        )}

        <div className="order-tracking-modal-body">
          {/* Visual Progress Timeline */}
          <div className="order-tracking-timeline-box">
            <div className="order-tracking-timeline-header">
              <h3>Live Shipment Progress</h3>
              <span className="realtime-live-badge">
                <span className="live-dot" /> Real-Time Updates
              </span>
            </div>

            {isCancelled ? (
              <div className="order-cancelled-banner">
                <div className="cancelled-banner-icon">✕</div>
                <div className="cancelled-banner-content">
                  <h4>Order Cancelled</h4>
                  <p>
                    <strong>Reason:</strong> {currentOrder.cancellationReason || 'Cancelled on request'}
                  </p>
                  <div className="cancelled-badges-row">
                    <span className="cancelled-chip">
                      ✓ Reserved Inventory Restored to Stock
                    </span>
                    <span className="cancelled-chip">
                      ✓ 100% Refund Initiated to {currentOrder.payment?.methodTitle || 'Original Payment Source'}
                    </span>
                  </div>
                  {currentOrder.cancelledAt && (
                    <small>
                      Cancelled on: {new Date(currentOrder.cancelledAt).toLocaleString('en-IN')}
                    </small>
                  )}
                </div>
              </div>
            ) : (
              <div className="croma-tracking-timeline">
                {ORDER_STATUS_FLOW.map((stepName, idx) => {
                  const isCompleted = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  const isUpcoming = idx > activeStepIndex;

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
                          {isCompleted
                            ? 'Completed'
                            : isCurrent
                            ? 'Current Stage'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logistics & Carrier Card */}
          <div className="order-tracking-courier-card">
            <div className="courier-badge-row">
              <div className="courier-partner-info">
                <span className="courier-icon">🚚</span>
                <div>
                  <small>LOGISTICS PARTNER</small>
                  <strong>{trackingInfo.carrier || 'ElectroHaven Express'}</strong>
                </div>
              </div>

              <div className="courier-awb-box">
                <small>TRACKING / AWB NUMBER</small>
                <div className="awb-copy-wrap">
                  <code>{trackingInfo.awbNumber || 'EH-AWB-PENDING'}</code>
                  <button
                    type="button"
                    className="copy-awb-btn"
                    onClick={() => handleCopyAwb(trackingInfo.awbNumber)}
                    title="Copy AWB number"
                  >
                    {copiedAwb ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="courier-status-strip">
              <div className="courier-stat">
                <span className="courier-stat-label">Estimated Delivery</span>
                <strong className="courier-stat-val highlight">
                  {currentOrder.deliveryEstimate || trackingInfo.estimatedDelivery}
                </strong>
              </div>
              <div className="courier-stat">
                <span className="courier-stat-label">Current Hub Location</span>
                <strong className="courier-stat-val">
                  {trackingInfo.currentLocation || 'Ahmedabad Central Logistics Hub'}
                </strong>
              </div>
              <div className="courier-stat">
                <span className="courier-stat-label">Shipping Method</span>
                <strong className="courier-stat-val">
                  {currentOrder.pricing?.deliverySpeed === 'express' ? '⚡ Express Courier' : 'Standard Surface'}
                </strong>
              </div>
            </div>
          </div>

          {/* Detailed Activity Milestone Log */}
          {Array.isArray(currentOrder.statusHistory) && currentOrder.statusHistory.length > 0 && (
            <div className="order-milestone-history-box">
              <h4>Milestone Activity Log</h4>
              <div className="milestones-stream">
                {currentOrder.statusHistory.map((historyItem, idx) => (
                  <div key={idx} className="milestone-stream-item">
                    <div className="milestone-stream-bullet" />
                    <div className="milestone-stream-content">
                      <div className="milestone-meta-row">
                        <strong className="milestone-status-tag">{historyItem.status}</strong>
                        <span className="milestone-time">
                          {new Date(historyItem.date).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="milestone-note">{historyItem.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Summary Strip */}
          <div className="order-tracking-items-section">
            <h4>Items in Shipment ({currentOrder.items?.length || 0})</h4>
            <div className="order-tracking-items-grid">
              {currentOrder.items?.map((item) => (
                <div key={item.id} className="order-tracking-item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-tracking-item-img"
                    onError={handleProductImageError}
                  />
                  <div className="order-tracking-item-meta">
                    <strong>{item.name}</strong>
                    <span>
                      Qty: <b>{item.quantity}</b> · {formatINR(item.price)} each
                    </span>
                    <b className="tracking-item-total">{formatINR(item.price * item.quantity)}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination & Payment Info */}
          <div className="order-tracking-info-grid">
            <div className="tracking-info-box">
              <h4>Delivery Destination</h4>
              <strong>{currentOrder.shippingAddress?.fullName}</strong>
              <p>
                {currentOrder.shippingAddress?.addressLine1}
                {currentOrder.shippingAddress?.addressLine2 ? `, ${currentOrder.shippingAddress?.addressLine2}` : ''}
              </p>
              <p>
                {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} –{' '}
                <b>{currentOrder.shippingAddress?.pincode}</b>
              </p>
              <small>📞 +91 {currentOrder.shippingAddress?.phone}</small>
            </div>

            <div className="tracking-info-box">
              <h4>Payment & Invoicing</h4>
              <strong>{currentOrder.payment?.methodTitle || 'Paid Online'}</strong>
              <p>{currentOrder.payment?.details || 'Demo Transaction'}</p>
              <div className="tracking-pricing-mini">
                <span>Subtotal: {formatINR(currentOrder.pricing?.subtotal || 0)}</span>
                <span>Delivery: {currentOrder.pricing?.deliveryFee === 0 ? 'FREE' : formatINR(currentOrder.pricing?.deliveryFee || 0)}</span>
                <strong>Total Paid: {formatINR(currentOrder.pricing?.totalPaid || currentOrder.total || 0)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="order-tracking-modal-footer">
          {cancellable && (
            <button
              type="button"
              className="order-cancel-trigger-btn"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </button>
          )}

          {!cancellable && !isCancelled && (
            <span className="non-cancellable-note">
              🔒 Order has been dispatched. Cancellation is unavailable after dispatch.
            </span>
          )}

          <button type="button" className="primary" onClick={onClose}>
            Close Tracking
          </button>
        </div>

        {/* Cancellation Sub-Modal Dialog */}
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
                    <strong>Cancellation is immediate and irreversible.</strong>
                    <p>
                      All reserved items will be released back into ElectroHaven store inventory, and a 100% refund of{' '}
                      <b>{formatINR(currentOrder.pricing?.totalPaid || currentOrder.total || 0)}</b> will be credited to your{' '}
                      {currentOrder.payment?.methodTitle || 'payment method'}.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleConfirmCancellation}>
                  <label className="cancel-form-label">
                    Please select a reason for cancellation:
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
                    Additional feedback or comments (optional):
                  </label>
                  <textarea
                    className="cancel-comment-area"
                    rows={3}
                    placeholder="Tell us what went wrong so we can improve..."
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
                      Keep My Order
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
    </div>
  );
}
