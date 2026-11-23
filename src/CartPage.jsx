import React, { useState } from 'react';
import { formatINR } from './currency';
import {
  getCartSubtotal,
  calculateCartTotals,
  validateCoupon,
  availableCoupons,
  validateCartStock,
  getProductStock,
} from './cart';
import { handleProductImageError } from './imageUtils';

export function CartItem({ item, onQuantityChange, onViewProduct, onRemoveItem }) {
  const availableStock = getProductStock(item.id);
  const isOutOfStock = availableStock === 0;
  const isStockLimited = item.quantity > availableStock;
  const isLowStock = availableStock <= 3 && !isOutOfStock;

  return (
    <article className={`cart-item ${isStockLimited ? 'cart-item-stock-warning' : ''}`}>
      <img
        className="cart-item-image"
        src={item.image}
        alt={item.name}
        onClick={() => onViewProduct && onViewProduct(item)}
        style={{ cursor: 'pointer' }}
        onError={handleProductImageError}
      />
      <div className="cart-item-details">
        <div className="cart-item-heading">
          <div>
            <h2 onClick={() => onViewProduct && onViewProduct(item)} style={{ cursor: 'pointer' }}>
              {item.name}
            </h2>
            <p>{item.description}</p>
          </div>
          <button
            type="button"
            className="cart-remove-icon-btn"
            title="Remove from cart"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => onRemoveItem(item.id)}
          >
            ✕
          </button>
        </div>

        {/* Stock warning pill */}
        {isOutOfStock ? (
          <div className="cart-stock-alert out-of-stock">
            ⚠ Out of stock. Please remove this item to proceed.
          </div>
        ) : isStockLimited ? (
          <div className="cart-stock-alert limited-stock">
            ⚠ Only {availableStock} unit(s) available in stock.
            <button
              type="button"
              className="text-button adjust-qty-btn"
              onClick={() => onQuantityChange(item.id, availableStock)}
            >
              Adjust to {availableStock}
            </button>
          </div>
        ) : isLowStock ? (
          <div className="cart-stock-alert low-stock">
            ⚡ Hurry! Only {availableStock} left in stock.
          </div>
        ) : null}

        <div className="cart-item-bottom">
          <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
            <button
              type="button"
              aria-label={item.quantity === 1 ? `Remove ${item.name}` : `Decrease ${item.name} quantity`}
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            >
              −
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              disabled={item.quantity >= availableStock}
              aria-label={`Increase ${item.name} quantity`}
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              title={item.quantity >= availableStock ? 'Maximum available stock reached' : ''}
            >
              +
            </button>
          </div>

          <div className="cart-item-prices">
            <strong>{formatINR(item.price * item.quantity)}</strong>
            {item.oldPrice > item.price && (
              <del>{formatINR(item.oldPrice * item.quantity)}</del>
            )}
          </div>
        </div>

        {item.oldPrice > item.price && (
          <p className="cart-item-savings">
            You save {formatINR((item.oldPrice - item.price) * item.quantity)} on this item
          </p>
        )}
      </div>
    </article>
  );
}

export default function CartPage({
  cart = [],
  lastRemovedProduct,
  onQuantityChange,
  onRemoveItem,
  onViewProduct,
  onContinueShopping,
  onProceedToCheckout,
  user,
  onPromptLogin,
}) {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = getCartSubtotal(cart);
  const totals = calculateCartTotals(cart, appliedCoupon);
  const stockCheck = validateCartStock(cart);

  const couponStillValid = !appliedCoupon || totals.appliedCoupon?.valid;
  const couponMessage =
    couponError ||
    (appliedCoupon
      ? couponStillValid
        ? `${appliedCoupon} applied. You save ${formatINR(totals.couponDiscount)}.`
        : totals.appliedCoupon?.message
      : '');
  const couponMessageIsError = Boolean(couponError || !couponStillValid);

  const applyCoupon = (event, selectedCode = couponInput) => {
    event?.preventDefault();
    const normalizedCode = selectedCode.trim().toUpperCase();
    const result = validateCoupon(normalizedCode, subtotal);

    if (!result.valid) {
      setCouponError(result.message);
      return;
    }

    setAppliedCoupon(result.coupon.code);
    setCouponInput(result.coupon.code);
    setCouponError('');
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
    setCouponError('');
  };

  const handleCheckoutClick = () => {
    if (!stockCheck.isValid) {
      alert('Please resolve the stock issues in your cart before proceeding to checkout.');
      return;
    }

    if (!user) {
      if (onPromptLogin) {
        onPromptLogin('Checkout');
      }
      return;
    }

    if (onProceedToCheckout) {
      onProceedToCheckout(appliedCoupon);
    }
  };

  return (
    <section className="section cart-page">
      <div className="section-head cart-page-heading">
        <div>
          <p className="kicker">YOUR ELECTROHAVEN ORDER</p>
          <h1>
            Shopping Cart{' '}
            <span>
              ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>
        {cart.length > 0 && (
          <button className="text-button" type="button" onClick={onContinueShopping}>
            ← Continue shopping
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is waiting for something great</h2>
          <p>Explore the latest authentic electronics and add your favourite items to get started.</p>
          <button className="primary" type="button" onClick={onContinueShopping}>
            Continue Shopping <b>→</b>
          </button>

          {lastRemovedProduct && (
            <div className="recently-removed">
              <p>Recently removed</p>
              <button
                className="recently-removed-product"
                type="button"
                onClick={() => onViewProduct(lastRemovedProduct)}
              >
                <img src={lastRemovedProduct.image} alt="" onError={handleProductImageError} />
                <span className="recently-removed-details">
                  <strong>{lastRemovedProduct.name}</strong>
                  <small>{lastRemovedProduct.description}</small>
                  <b>{formatINR(lastRemovedProduct.price)}</b>
                </span>
                <span className="recently-removed-link">View product →</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left Column: Cart items */}
          <div className="cart-items-panel">
            <div className="cart-panel-heading">
              <h2>Cart items</h2>
              <span>{cart.reduce((count, item) => count + item.quantity, 0)} total units</span>
            </div>

            {/* Global stock issues warning if any */}
            {!stockCheck.isValid && (
              <div className="cart-global-stock-warning">
                <strong>⚠ Inventory Notice:</strong> Some items in your cart exceed available stock. Please adjust quantities before checkout.
              </div>
            )}

            <div className="cart-item-list">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={onQuantityChange}
                  onRemoveItem={onRemoveItem}
                  onViewProduct={onViewProduct}
                />
              ))}
            </div>

            <button
              className="text-button cart-continue-link"
              type="button"
              onClick={onContinueShopping}
            >
              ← Continue shopping
            </button>
          </div>

          {/* Right Column: Order summary */}
          <aside className="order-summary">
            <div className="cart-panel-heading">
              <h2>Order summary</h2>
              <span>INR</span>
            </div>

            <div className="summary-lines">
              <div>
                <span>Subtotal ({cart.reduce((c, i) => c + i.quantity, 0)} items)</span>
                <strong>{formatINR(totals.subtotal)}</strong>
              </div>

              {totals.productSavings > 0 && (
                <div className="summary-discount">
                  <span>Product savings</span>
                  <strong>− {formatINR(totals.productSavings)}</strong>
                </div>
              )}

              {appliedCoupon && (
                <div className={couponStillValid ? 'summary-discount' : 'summary-error'}>
                  <span>Coupon ({appliedCoupon})</span>
                  <strong>
                    {couponStillValid
                      ? `− ${formatINR(totals.couponDiscount)}`
                      : formatINR(0)}
                  </strong>
                </div>
              )}

              <div>
                <span>Estimated GST (18%)</span>
                <strong>{formatINR(totals.estimatedGst)}</strong>
              </div>

              <div>
                <span>Delivery</span>
                <strong>
                  {totals.delivery === 0 ? (
                    <span className="delivery-free">FREE</span>
                  ) : (
                    formatINR(totals.delivery)
                  )}
                </strong>
              </div>
            </div>

            <p className="tax-estimate-note">
              Inclusive of standard GST and brand warranty coverage.
            </p>

            {totals.delivery > 0 ? (
              <p className="shipping-note">
                Add {formatINR(4747 - totals.subtotal)} more for <b>FREE delivery</b>.
              </p>
            ) : (
              <p className="shipping-note shipping-unlocked">
                ✓ Free delivery unlocked on this order
              </p>
            )}

            {/* Coupons Section */}
            <div className="coupon-section">
              <h3>Have a coupon code?</h3>
              <form className="coupon-form" onSubmit={applyCoupon}>
                <input
                  aria-label="Coupon code"
                  autoComplete="off"
                  placeholder="Enter code (e.g. SAVE10)"
                  value={couponInput}
                  onChange={(event) => {
                    setCouponInput(event.target.value);
                    setCouponError('');
                  }}
                />
                <button
                  className="outline-button"
                  type="submit"
                  disabled={
                    !couponInput.trim() ||
                    Boolean(
                      appliedCoupon &&
                        couponStillValid &&
                        appliedCoupon === couponInput.trim().toUpperCase()
                    )
                  }
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <p
                  className={`coupon-message${
                    couponMessageIsError ? ' coupon-error' : ' coupon-success'
                  }`}
                  role="status"
                >
                  {couponMessage}
                </p>
              )}

              {appliedCoupon && (
                <button className="coupon-remove" type="button" onClick={removeCoupon}>
                  Remove applied coupon
                </button>
              )}

              <div className="available-coupons">
                <span>Available offers</span>
                {availableCoupons.map((coupon) => (
                  <div className="coupon-option" key={coupon.code}>
                    <div>
                      <strong>{coupon.code}</strong>
                      <small>{coupon.description}</small>
                    </div>
                    <button
                      className="text-button"
                      type="button"
                      onClick={(event) => applyCoupon(event, coupon.code)}
                    >
                      {appliedCoupon === coupon.code && couponStillValid ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-total">
              <span>Total Payable</span>
              <strong>{formatINR(totals.total)}</strong>
            </div>

            <button
              className="primary checkout-button"
              type="button"
              onClick={handleCheckoutClick}
              disabled={!stockCheck.isValid}
            >
              {user ? 'Proceed to Checkout' : 'Sign in to Checkout'} <b>→</b>
            </button>

            {!user && (
              <p className="auth-checkout-prompt-note">
                🔒 You will be asked to sign in or create an account to complete your order.
              </p>
            )}

            <div className="pdp-trust-bar" style={{ marginTop: '16px' }}>
              <span>🔒 100% Secure</span>
              <span>🛡 Brand Warranty</span>
              <span>↺ 7-Day Replacement</span>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
