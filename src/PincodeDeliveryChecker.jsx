import React, { useState, useEffect } from 'react';
import {
  checkPincodeDelivery,
  getSavedPincode,
  savePincode,
  QUICK_DEMO_PINCODES,
} from './pincodeData';

export default function PincodeDeliveryChecker({
  savedPincode,
  onPincodeChange,
  onScrollToStores,
}) {
  const currentPin = savedPincode || getSavedPincode();
  const [inputVal, setInputVal] = useState(currentPin);
  const [result, setResult] = useState(() => checkPincodeDelivery(currentPin));
  const [selectedOptionType, setSelectedOptionType] = useState('Standard Delivery');
  const [showDemoChips, setShowDemoChips] = useState(false);

  // Sync state if savedPincode changes externally (e.g. navigation across products)
  useEffect(() => {
    if (savedPincode && savedPincode !== inputVal) {
      setInputVal(savedPincode);
      setResult(checkPincodeDelivery(savedPincode));
    }
  }, [savedPincode]);

  const handleCheck = (e, pinToCheck = inputVal) => {
    if (e) e.preventDefault();
    const cleanPin = (pinToCheck || '').trim();
    const res = checkPincodeDelivery(cleanPin);
    setResult(res);

    if (res.isValid && res.isServiceable) {
      savePincode(cleanPin);
      if (onPincodeChange) {
        onPincodeChange(cleanPin);
      }
    }
  };

  const handleQuickDemoClick = (pin) => {
    setInputVal(pin);
    handleCheck(null, pin);
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setInputVal(val);
  };

  return (
    <div className="pdp-delivery-checker-box" id="delivery-checker">
      <div className="pdp-delivery-header">
        <div className="pdp-delivery-title-row">
          <span className="pdp-delivery-icon">🚚</span>
          <div>
            <h3>Check Delivery Availability</h3>
            <p className="pdp-delivery-subtitle">
              Enter your PIN code to verify serviceability, shipping rates, and estimated delivery dates.
            </p>
          </div>
        </div>
      </div>

      {/* Pincode Input Form */}
      <form className="pdp-pincode-form-wrap" onSubmit={handleCheck}>
        <div className="pdp-pincode-input-container">
          <span className="pdp-pin-prefix-icon">📍</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter 6-digit PIN code"
            value={inputVal}
            onChange={handleInputChange}
            aria-label="Enter 6-digit Delivery PIN code"
            className="pdp-pincode-input"
          />
          {inputVal && (
            <button
              type="button"
              className="pdp-pincode-clear"
              onClick={() => {
                setInputVal('');
              }}
              title="Clear input"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="pdp-pincode-submit-btn"
          disabled={!inputVal || inputVal.length < 6}
        >
          Check
        </button>
      </form>

      {/* Quick Demo Selector Chips */}
      <div className="pdp-demo-pincodes">
        <button
          type="button"
          className="pdp-demo-toggle-btn"
          onClick={() => setShowDemoChips(!showDemoChips)}
        >
          {showDemoChips ? 'Hide test PIN codes ▴' : 'Try sample PIN codes ▾'}
        </button>

        {showDemoChips && (
          <div className="pdp-demo-chips-list">
            {QUICK_DEMO_PINCODES.map((item) => (
              <button
                key={item.pin}
                type="button"
                className={`pdp-demo-chip ${inputVal === item.pin ? 'active' : ''}`}
                onClick={() => handleQuickDemoClick(item.pin)}
              >
                <b>{item.pin}</b> <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Rendering */}
      {result && (
        <div className="pdp-delivery-result-card">
          {!result.isValid ? (
            /* Format / Length / Zero Error */
            <div className="pdp-delivery-error-banner" role="alert">
              <span className="error-icon">⚠</span>
              <p>{result.error}</p>
            </div>
          ) : result.isServiceable ? (
            /* Serviceable Location State */
            <div className="pdp-delivery-success-content">
              {/* Serviceable Header Badge */}
              <div className="pdp-serviceable-status-bar">
                <span className="pdp-status-pill available">✓ Delivery Available</span>
                <span className="pdp-location-dest">
                  To <strong>{result.locality ? `${result.locality}, ` : ''}{result.city}</strong> ({result.pincode})
                </span>
              </div>

              {/* Delivery Options & Charges (Standard & Express) */}
              <div className="pdp-shipping-options-grid">
                {/* Standard Delivery Option */}
                {result.standardOption && (
                  <div
                    className={`pdp-shipping-card ${selectedOptionType === result.standardOption.type ? 'selected' : ''}`}
                    onClick={() => setSelectedOptionType(result.standardOption.type)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="shipping-card-head">
                      <span className="shipping-radio">
                        {selectedOptionType === result.standardOption.type ? '◉' : '○'}
                      </span>
                      <strong>{result.standardOption.type}</strong>
                      <span className="shipping-charge-pill free">
                        {result.standardOption.chargeLabel}
                      </span>
                    </div>
                    <div className="shipping-date-line">
                      <span>Estimated Arrival:</span>
                      <b>{result.standardOption.dateFormatted}</b>
                    </div>
                    <small className="shipping-desc">{result.standardOption.description}</small>
                  </div>
                )}

                {/* Express Delivery Option */}
                {result.expressOption && (
                  <div
                    className={`pdp-shipping-card express ${selectedOptionType === result.expressOption.type ? 'selected' : ''}`}
                    onClick={() => setSelectedOptionType(result.expressOption.type)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="shipping-card-head">
                      <span className="shipping-radio">
                        {selectedOptionType === result.expressOption.type ? '◉' : '○'}
                      </span>
                      <strong>⚡ {result.expressOption.type}</strong>
                      <span className="shipping-charge-pill paid">
                        {result.expressOption.chargeLabel}
                      </span>
                    </div>
                    <div className="shipping-date-line">
                      <span>Estimated Arrival:</span>
                      <b className="express-date">{result.expressOption.dateFormatted}</b>
                    </div>
                    <small className="shipping-desc">{result.expressOption.description}</small>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pdp-delivery-trust-chips">
                <span>{result.codAvailable ? '✓ Cash on Delivery Available' : 'Online Payment Only'}</span>
                <span>✓ 7-Day Replacement Policy</span>
                <span>✓ Verified ElectroHaven Delivery</span>
              </div>
            </div>
          ) : (
            /* Unserviceable Location State */
            <div className="pdp-delivery-unserviceable-banner" role="alert">
              <div className="unserviceable-icon-col">✕</div>
              <div className="unserviceable-info-col">
                <span className="pdp-status-pill unavailable">Delivery Not Available</span>
                <strong>PIN Code {result.pincode} is currently not serviceable</strong>
                <p>{result.reason}</p>
                <div className="unserviceable-actions">
                  <span className="unserviceable-hint">You can still reserve this item for in-store pickup:</span>
                  <button
                    type="button"
                    className="outline-button pdp-unserv-store-btn"
                    onClick={onScrollToStores}
                  >
                    Check In-Store Pickup in Ahmedabad ↓
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
