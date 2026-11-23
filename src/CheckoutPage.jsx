import React, { useState, useEffect, useMemo } from 'react';
import { formatINR } from './currency';
import {
  calculateCartTotals,
  validateCartStock,
  getStoredAddresses,
  saveStoredAddress,
  saveStoredOrder,
  generateOrderId,
} from './cart';
import { KNOWN_PINCODES } from './pincodeData';
import { handleProductImageError } from './imageUtils';
import {
  deductAdminProductStockForOrder,
  getStoreCartStockAvailability,
  getAdminStores,
} from './adminData';
import { subscribeToRealtimeSync } from './realtimeSync';

export default function CheckoutPage({
  cart = [],
  user,
  appliedCoupon = '',
  onOrderSuccess,
  onBackToCart,
  onPromptLogin,
  initialFulfillmentType = 'delivery',
  initialPickupStore = null,
  preferredStore = null,
  onSetPreferredStore = null,
}) {
  // If not logged in, prompt user to login
  useEffect(() => {
    if (!user && onPromptLogin) {
      onPromptLogin('Checkout');
    }
  }, [user, onPromptLogin]);

  // Fulfillment Mode: 'delivery' (Home Delivery) | 'store_pickup' (Click & Collect)
  const [fulfillmentType, setFulfillmentType] = useState(initialFulfillmentType || 'delivery');

  // Stores List & Selection
  const storesList = useMemo(() => getAdminStores(), []);
  const [selectedPickupStoreId, setSelectedPickupStoreId] = useState(
    initialPickupStore?.id || preferredStore?.id || (storesList[0] && storesList[0].id) || 'eh-store-amd-01'
  );
  const [realtimeKey, setRealtimeKey] = useState(0);

  // Subscribe to real-time inventory and store updates
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync((msg) => {
      if (msg.entity === 'inventory' || msg.entity === 'stores' || msg.entity === 'products') {
        setRealtimeKey((k) => k + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute store-wise cart availability across all stores
  const storeAvailabilities = useMemo(() => {
    const map = {};
    storesList.forEach((store) => {
      map[store.id] = getStoreCartStockAvailability(store.id, cart);
    });
    return map;
  }, [storesList, cart, realtimeKey]);

  const selectedStore = useMemo(() => {
    return storesList.find((s) => s.id === selectedPickupStoreId) || storesList[0];
  }, [storesList, selectedPickupStoreId]);

  const selectedStoreStock = useMemo(() => {
    return storeAvailabilities[selectedStore?.id] || { isAvailable: false, outOfStockItems: [] };
  }, [storeAvailabilities, selectedStore]);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState(() => getStoredAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const addresses = getStoredAddresses();
    return addresses.length > 0 ? addresses[0].id : 'new';
  });

  // Contact details
  const [fullName, setFullName] = useState(user?.name || 'Alex Sharma');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [email, setEmail] = useState(user?.email || 'alex.sharma@example.com');

  // Address fields (Home delivery)
  const [addressLine1, setAddressLine1] = useState('Flat 402, Shivalik High Street');
  const [addressLine2, setAddressLine2] = useState('Near Panjrapole Cross Roads, Navrangpura');
  const [landmark, setLandmark] = useState('Opposite Ahmedabad University');
  const [pincode, setPincode] = useState('380009');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [addressType, setAddressType] = useState('Home');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Delivery Speed (Home Delivery only)
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'express'

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'

  // UPI sub-options
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'id'
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Card sub-options
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alex Sharma');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Net banking sub-options
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate totals
  const rawTotals = calculateCartTotals(cart, appliedCoupon, deliverySpeed);
  const totals = useMemo(() => {
    if (fulfillmentType === 'store_pickup') {
      return {
        ...rawTotals,
        delivery: 0,
        total: Math.max(0, rawTotals.subtotal - rawTotals.couponDiscount + rawTotals.estimatedGst),
      };
    }
    return rawTotals;
  }, [rawTotals, fulfillmentType]);

  const stockCheck = validateCartStock(cart);

  // Auto-fill address when switching saved address
  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    if (addr.email) setEmail(addr.email);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setPincode(addr.pincode);
    setCity(addr.city);
    setState(addr.state);
    setAddressType(addr.addressType || 'Home');
  };

  // Lookup pincode automatically from KNOWN_PINCODES
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 6);
    setPincode(val);
    if (val.length === 6) {
      const info = KNOWN_PINCODES[val];
      if (info && info.city && info.state) {
        setCity(info.city);
        setState(info.state);
      }
    }
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').substring(0, 16);
    const parts = clean.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : clean);
  };

  // Format Card Expiry (MM/YY)
  const handleCardExpiryChange = (e) => {
    let clean = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (clean.length > 2) {
      clean = `${clean.substring(0, 2)}/${clean.substring(2)}`;
    }
    setCardExpiry(clean);
  };

  // Handle Place Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Pre-validate stock
    const freshStockCheck = validateCartStock(cart);
    if (!freshStockCheck.isValid) {
      setErrorMessage(
        freshStockCheck.issues[0]?.message || 'Stock limits exceeded for items in your cart.'
      );
      return;
    }

    // Validation for Store Pickup
    if (fulfillmentType === 'store_pickup') {
      if (!selectedStoreStock.isAvailable) {
        const outItems = selectedStoreStock.outOfStockItems.map((i) => i.name).join(', ');
        setErrorMessage(
          `Insufficient stock at ${selectedStore.name} for: ${outItems}. Please choose a store with full availability.`
        );
        return;
      }

      if (!fullName.trim()) {
        setErrorMessage('Please enter the full name of the person picking up the order.');
        return;
      }

      if (!phone || phone.replace(/\D/g, '').length !== 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number for pickup SMS & OTP verification.');
        return;
      }

      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage('Please enter a valid email address for digital pickup receipts.');
        return;
      }
    } else {
      // Validation for Home Delivery
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (!phone || phone.replace(/\D/g, '').length !== 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return;
      }

      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      if (!addressLine1.trim() || !city.trim() || !pincode || pincode.length !== 6) {
        setErrorMessage('Please complete your delivery address and 6-digit PIN code.');
        return;
      }
    }

    // Validate payment input
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMessage('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMessage('Please enter a valid 3-digit CVV.');
        return;
      }
    }

    setIsSubmitting(true);

    // Save shipping address if checkbox checked and delivery mode
    if (fulfillmentType === 'delivery' && saveAddressForFuture) {
      const addressToSave = {
        id: selectedAddressId !== 'new' ? selectedAddressId : `addr_${Date.now()}`,
        fullName,
        phone,
        email,
        addressLine1,
        addressLine2,
        landmark,
        pincode,
        city,
        state,
        addressType,
        isDefault: true,
      };
      saveStoredAddress(addressToSave);
    }

    // Determine payment description
    let paymentTitle = 'Cash on Delivery';
    let paymentDetails = 'Pay upon doorstep delivery';
    if (fulfillmentType === 'store_pickup' && paymentMethod === 'cod') {
      paymentTitle = 'Pay at Store Counter';
      paymentDetails = 'Cash, UPI, or Card at Store Cashier';
    } else if (paymentMethod === 'upi') {
      paymentTitle = 'UPI Payment';
      paymentDetails =
        upiApp === 'gpay'
          ? 'Google Pay UPI'
          : upiApp === 'phonepe'
          ? 'PhonePe UPI'
          : upiApp === 'paytm'
          ? 'Paytm UPI'
          : `UPI ID (${customUpiId || 'verified'})`;
    } else if (paymentMethod === 'card') {
      paymentTitle = 'Credit / Debit Card';
      paymentDetails = `Card ending in ${cardNumber.replace(/\s/g, '').slice(-4) || '4242'}`;
    } else if (paymentMethod === 'netbanking') {
      paymentTitle = 'Net Banking';
      paymentDetails = `${selectedBank}`;
    }

    // Build authentic order object
    const newOrderId = generateOrderId();
    const isPickup = fulfillmentType === 'store_pickup';
    const pickupPassCode = `EH-PASS-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderRecord = {
      id: newOrderId,
      orderId: newOrderId,
      userId: user?.id || 'usr_guest',
      fulfillmentType, // 'store_pickup' | 'delivery'
      createdAt: new Date().toISOString(),
      formattedDate: new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
      deliveryEstimate: isPickup
        ? 'Ready for Pickup in 2 Hours (Today)'
        : deliverySpeed === 'express'
        ? 'Tomorrow, Guaranteed by 8 PM'
        : 'In 2 - 3 business days',
      pickupStore: isPickup
        ? {
            id: selectedStore.id,
            name: selectedStore.name,
            locality: selectedStore.locality,
            address: selectedStore.address,
            contact: selectedStore.contact,
            timing: selectedStore.openingHours?.timing || selectedStore.timing || '10:30 AM – 9:30 PM',
            openingHours: selectedStore.openingHours?.days || 'Mon – Sun',
          }
        : null,
      pickupCode: isPickup ? pickupPassCode : null,
      shippingAddress: {
        fullName,
        phone,
        email,
        addressLine1: isPickup ? `Pickup Counter: ${selectedStore.name}` : addressLine1,
        addressLine2: isPickup ? selectedStore.address : addressLine2,
        landmark: isPickup ? selectedStore.locality : landmark,
        pincode: isPickup ? selectedStore.pincode : pincode,
        city: isPickup ? selectedStore.city : city,
        state: isPickup ? selectedStore.state : state,
        addressType: isPickup ? 'Store Pickup' : addressType,
      },
      payment: {
        method: paymentMethod,
        methodTitle: paymentTitle,
        details: paymentDetails,
        status: 'Confirmed (Demo)',
      },
      pricing: {
        subtotal: totals.subtotal,
        productSavings: totals.productSavings,
        couponCode: appliedCoupon,
        couponDiscount: totals.couponDiscount,
        estimatedGst: totals.estimatedGst,
        deliveryFee: totals.delivery,
        deliverySpeed: isPickup ? 'store_pickup' : deliverySpeed,
        totalPaid: totals.total,
      },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        oldPrice: item.oldPrice,
        quantity: item.quantity,
        image: item.image,
        description: item.description,
        totalPrice: item.price * item.quantity,
      })),
      status: isPickup ? 'Preparing' : 'Order Placed',
      orderStatus: isPickup ? 'Preparing' : 'Order Placed',
      tracking: isPickup
        ? {
            carrier: 'ElectroHaven In-Store Logistics',
            awbNumber: pickupPassCode,
            currentLocation: selectedStore.name,
            estimatedDelivery: 'Ready for Pickup in 2 Hours (Today)',
          }
        : {
            carrier: 'ElectroHaven Express (Partner: Delhivery)',
            awbNumber: `EH-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`,
            currentLocation: 'Ahmedabad Warehouse & Logistics Hub, Gujarat',
            estimatedDelivery:
              deliverySpeed === 'express'
                ? 'Tomorrow, Guaranteed by 8 PM'
                : 'In 2 - 3 business days',
          },
      statusHistory: [
        {
          status: 'Order Placed',
          date: new Date().toISOString(),
          note: isPickup
            ? `Store pickup order placed at ${selectedStore.name}. Store team assembling items.`
            : 'Order successfully placed and verified at Ahmedabad Fulfilment Center',
        },
      ],
    };

    // Simulate authentic checkout transaction delay
    setTimeout(() => {
      saveStoredOrder(orderRecord, user?.id);
      deductAdminProductStockForOrder(orderRecord);
      setIsSubmitting(false);
      if (onOrderSuccess) {
        onOrderSuccess(orderRecord);
      }
    }, 1200);
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="section empty-state">
        <h2>Your Cart is Empty</h2>
        <p>There are no items to checkout.</p>
        <button className="primary" type="button" onClick={onBackToCart}>
          Return to Cart <b>→</b>
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      {/* Checkout Breadcrumb Steps */}
      <nav className="checkout-step-tracker" aria-label="Checkout Progress">
        <div className="step-item completed">
          <span className="step-num">✓</span>
          <span className="step-label">1. Shopping Cart</span>
        </div>
        <div className="step-divider" />
        <div className="step-item active">
          <span className="step-num">2</span>
          <span className="step-label">2. Fulfillment &amp; Contact</span>
        </div>
        <div className="step-divider" />
        <div className="step-item active">
          <span className="step-num">3</span>
          <span className="step-label">3. Payment Options</span>
        </div>
      </nav>

      {/* Main Checkout Form & Summary Grid */}
      <div className="checkout-grid">
        {/* Left Column: Forms */}
        <div className="checkout-forms-column">
          {errorMessage && <div className="auth-error-banner">{errorMessage}</div>}

          {/* Section 0: Fulfillment Method Selector (Croma-Style) */}
          <div className="checkout-section-card fulfillment-selector-card">
            <div className="checkout-section-head">
              <span className="checkout-step-badge">★</span>
              <div>
                <h2>Choose Fulfillment Method</h2>
                <p>Select between doorstep home delivery or instant store pickup in Ahmedabad.</p>
              </div>
            </div>

            <div className="fulfillment-segmented-control" role="radiogroup">
              <button
                type="button"
                className={`fulfillment-opt-btn ${fulfillmentType === 'delivery' ? 'active' : ''}`}
                onClick={() => setFulfillmentType('delivery')}
              >
                <span className="fulfillment-icon">🚚</span>
                <div className="fulfillment-btn-text">
                  <strong>Home Delivery</strong>
                  <small>Express doorstep delivery to your address</small>
                </div>
              </button>

              <button
                type="button"
                className={`fulfillment-opt-btn ${fulfillmentType === 'store_pickup' ? 'active' : ''}`}
                onClick={() => setFulfillmentType('store_pickup')}
              >
                <span className="fulfillment-icon">🏬</span>
                <div className="fulfillment-btn-text">
                  <strong>Pick Up from Store (Click &amp; Collect)</strong>
                  <small>FREE · Ready for pickup in 2 hours at an ElectroHaven Store</small>
                </div>
                <span className="fulfillment-free-pill">FREE</span>
              </button>
            </div>
          </div>

          {/* STORE PICKUP FLOW */}
          {fulfillmentType === 'store_pickup' ? (
            <>
              {/* Store Selector Section */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-badge">1</span>
                  <div>
                    <h2>Select Pickup Store in Ahmedabad</h2>
                    <p>Real-time stock availability verified for all items in your cart.</p>
                  </div>
                </div>

                <div className="checkout-store-selection-grid">
                  {storesList.map((store) => {
                    const avail = storeAvailabilities[store.id] || { isAvailable: false, outOfStockItems: [] };
                    const isSelected = selectedPickupStoreId === store.id;

                    return (
                      <div
                        key={store.id}
                        className={`chk-store-card ${isSelected ? 'selected' : ''} ${
                          avail.isAvailable ? 'available' : 'disabled'
                        }`}
                        onClick={() => {
                          if (avail.isAvailable) {
                            setSelectedPickupStoreId(store.id);
                            if (onSetPreferredStore) onSetPreferredStore(store);
                          }
                        }}
                      >
                        <div className="chk-store-card-head">
                          <div className="chk-store-radio">
                            <span className={`chk-radio-circle ${isSelected ? 'checked' : ''}`} />
                            <strong>{store.name}</strong>
                          </div>
                          <span
                            className={`status-pill ${
                              avail.isAvailable ? 'status-delivered' : 'status-cancelled'
                            }`}
                          >
                            {avail.isAvailable
                              ? '✓ All Items In Stock'
                              : '✕ Insufficient Stock'}
                          </span>
                        </div>

                        <p className="chk-store-address">{store.address}</p>

                        <div className="chk-store-details-strip">
                          <span>🕒 {store.openingHours?.timing || '10:30 AM – 9:30 PM'}</span>
                          <span>📞 {store.contact}</span>
                          <span className="chk-store-ready-pill">⚡ Ready in 2 Hours</span>
                        </div>

                        {!avail.isAvailable && (
                          <div className="chk-store-out-warning">
                            Unavailable: {avail.outOfStockItems.map((i) => i.name).join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Store Highlights Box */}
                {selectedStore && (
                  <div className="selected-pickup-store-box">
                    <div className="selected-store-title-row">
                      <span className="selected-store-icon">📍</span>
                      <div>
                        <small>CONFIRMED PICKUP LOCATION</small>
                        <h3>{selectedStore.name}</h3>
                      </div>
                    </div>
                    <p className="selected-store-full-addr">{selectedStore.address}</p>
                    <div className="selected-store-instructions">
                      <span>✓ Ready for pickup in 2 hours</span>
                      <span>✓ Please bring a Government ID &amp; your Order Confirmation Pass</span>
                      <span>✓ Free parking &amp; unboxing assistance available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Pickup Contact Info */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-badge">2</span>
                  <div>
                    <h2>Customer Pickup Details</h2>
                    <p>Enter the details of the person collecting this order from the store.</p>
                  </div>
                </div>

                <div className="checkout-fields-row">
                  <div className="auth-field">
                    <label htmlFor="chk-pickup-name">Full Name of Person Picking Up *</label>
                    <input
                      id="chk-pickup-name"
                      type="text"
                      placeholder="e.g. Alex Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-pickup-phone">Mobile Number (For Pickup Pass &amp; OTP SMS) *</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-prefix">+91</span>
                      <input
                        id="chk-pickup-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="chk-pickup-email">Email Address (For Tax Invoice &amp; Pickup Pass) *</label>
                  <input
                    id="chk-pickup-email"
                    type="email"
                    placeholder="alex.sharma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* HOME DELIVERY FLOW */}
              {/* Section 1: Contact Information */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-badge">1</span>
                  <div>
                    <h2>Contact Information</h2>
                    <p>Order invoice and tracking SMS will be delivered here.</p>
                  </div>
                </div>

                <div className="checkout-fields-row">
                  <div className="auth-field">
                    <label htmlFor="chk-name">Full Name *</label>
                    <input
                      id="chk-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-phone">Mobile Number *</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-prefix">+91</span>
                      <input
                        id="chk-phone"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="chk-email">Email Address *</label>
                  <input
                    id="chk-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-badge">2</span>
                  <div>
                    <h2>Shipping &amp; Delivery Address</h2>
                    <p>Select a saved address or enter a new doorstep address.</p>
                  </div>
                </div>

                {/* Saved addresses selector */}
                {savedAddresses.length > 0 && (
                  <div className="checkout-saved-addresses-strip">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        className={`chk-address-chip ${selectedAddressId === addr.id ? 'active' : ''}`}
                        onClick={() => handleSelectSavedAddress(addr)}
                      >
                        <strong>{addr.fullName} ({addr.addressType || 'Home'})</strong>
                        <small>{addr.addressLine1}, {addr.city} – {addr.pincode}</small>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`chk-address-chip new-chip ${selectedAddressId === 'new' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAddressId('new');
                        setAddressLine1('');
                        setAddressLine2('');
                        setLandmark('');
                      }}
                    >
                      <strong>+ Enter New Address</strong>
                      <small>Deliver to a different location</small>
                    </button>
                  </div>
                )}

                <div className="checkout-fields-row">
                  <div className="auth-field">
                    <label htmlFor="chk-pincode">6-Digit PIN Code *</label>
                    <input
                      id="chk-pincode"
                      type="text"
                      maxLength={6}
                      placeholder="380009"
                      value={pincode}
                      onChange={handlePincodeChange}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-city">City *</label>
                    <input
                      id="chk-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-state">State *</label>
                    <input
                      id="chk-state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="chk-addr1">Flat, House no., Building, Apartment *</label>
                  <input
                    id="chk-addr1"
                    type="text"
                    placeholder="e.g. Flat 402, Shivalik High Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                  />
                </div>

                <div className="checkout-fields-row">
                  <div className="auth-field">
                    <label htmlFor="chk-addr2">Area, Colony, Street, Sector</label>
                    <input
                      id="chk-addr2"
                      type="text"
                      placeholder="e.g. Near Panjrapole Cross Roads, Navrangpura"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-landmark">Landmark (Optional)</label>
                    <input
                      id="chk-landmark"
                      type="text"
                      placeholder="e.g. Opposite Ahmedabad University"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>
                </div>

                {/* Address type pills */}
                <div className="address-type-selector">
                  <span className="address-type-label">Address Type:</span>
                  {['Home', 'Office', 'Commercial'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`address-type-pill ${addressType === type ? 'active' : ''}`}
                      onClick={() => setAddressType(type)}
                    >
                      {type === 'Home' ? '🏠 Home' : type === 'Office' ? '🏢 Office' : '🏬 Commercial'}
                    </button>
                  ))}
                </div>

                <label className="save-address-checkbox">
                  <input
                    type="checkbox"
                    checked={saveAddressForFuture}
                    onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                  />
                  <span>Save this address for future 1-click checkout</span>
                </label>
              </div>

              {/* Section 3: Delivery Speed Options */}
              <div className="checkout-section-card">
                <div className="checkout-section-head">
                  <span className="checkout-step-badge">3</span>
                  <div>
                    <h2>Delivery Speed</h2>
                    <p>Choose your preferred doorstep fulfillment option.</p>
                  </div>
                </div>

                <div className="delivery-speed-grid">
                  <div
                    className={`delivery-speed-card ${deliverySpeed === 'standard' ? 'selected' : ''}`}
                    onClick={() => setDeliverySpeed('standard')}
                  >
                    <div className="delivery-speed-head">
                      <strong>Standard Pan-India Shipping</strong>
                      <span className="delivery-free-badge">FREE</span>
                    </div>
                    <p>Estimated arrival in 2 - 3 business days.</p>
                  </div>

                  <div
                    className={`delivery-speed-card ${deliverySpeed === 'express' ? 'selected' : ''}`}
                    onClick={() => setDeliverySpeed('express')}
                  >
                    <div className="delivery-speed-head">
                      <strong>⚡ Express Next-Day Delivery</strong>
                      <span className="delivery-express-price">+ ₹99</span>
                    </div>
                    <p>Guaranteed doorstep arrival tomorrow by 8 PM across Ahmedabad &amp; Metro cities.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Options Section */}
          <div className="checkout-section-card">
            <div className="checkout-section-head">
              <span className="checkout-step-badge">{fulfillmentType === 'store_pickup' ? '3' : '4'}</span>
              <div>
                <h2>Payment Method</h2>
                <p>Choose how you would like to complete your order (Demo Mode).</p>
              </div>
            </div>

            {/* Payment method tabs */}
            <div className="payment-tabs-bar" role="tablist">
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <span>📱</span> UPI / QR
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span>💳</span> Credit / Debit Card
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <span>🏛</span> Net Banking
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <span>💵</span> {fulfillmentType === 'store_pickup' ? 'Pay at Store' : 'Cash on Delivery'}
              </button>
            </div>

            {/* UPI Tab */}
            {paymentMethod === 'upi' && (
              <div className="payment-body">
                <div className="upi-apps-row">
                  {[
                    { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                    { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                    { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
                    { id: 'id', name: 'Other UPI ID', icon: '🆔' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className={`upi-app-btn ${upiApp === app.id ? 'selected' : ''}`}
                      onClick={() => setUpiApp(app.id)}
                    >
                      <span>{app.icon}</span>
                      <strong>{app.name}</strong>
                    </button>
                  ))}
                </div>

                {upiApp === 'id' && (
                  <div className="custom-upi-input-row">
                    <div className="auth-field">
                      <label htmlFor="chk-upi-id">Enter UPI ID (e.g. mobile@upi)</label>
                      <div className="auth-input-wrap">
                        <input
                          id="chk-upi-id"
                          type="text"
                          placeholder="username@okhdfcbank"
                          value={customUpiId}
                          onChange={(e) => {
                            setCustomUpiId(e.target.value);
                            setUpiVerified(false);
                          }}
                        />
                        <button
                          type="button"
                          className="upi-verify-btn"
                          disabled={!customUpiId.includes('@')}
                          onClick={() => setUpiVerified(true)}
                        >
                          {upiVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card Tab */}
            {paymentMethod === 'card' && (
              <div className="payment-body">
                <div className="auth-field">
                  <label htmlFor="chk-card-num">Card Number *</label>
                  <input
                    id="chk-card-num"
                    type="text"
                    maxLength={19}
                    placeholder="4532 8920 1234 5678"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div className="checkout-fields-row">
                  <div className="auth-field">
                    <label htmlFor="chk-card-holder">Name on Card *</label>
                    <input
                      id="chk-card-holder"
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-card-expiry">Expiry Date (MM/YY) *</label>
                    <input
                      id="chk-card-expiry"
                      type="text"
                      maxLength={5}
                      placeholder="08/29"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="chk-card-cvv">CVV *</label>
                    <input
                      id="chk-card-cvv"
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking Tab */}
            {paymentMethod === 'netbanking' && (
              <div className="payment-body">
                <div className="bank-select-grid">
                  {[
                    'HDFC Bank',
                    'State Bank of India',
                    'ICICI Bank',
                    'Axis Bank',
                    'Kotak Mahindra',
                    'Bank of Baroda',
                  ].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      className={`bank-card-btn ${selectedBank === bank ? 'selected' : ''}`}
                      onClick={() => setSelectedBank(bank)}
                    >
                      <span>🏛</span>
                      <strong>{bank}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cash on Delivery / Pay at Store Tab */}
            {paymentMethod === 'cod' && (
              <div className="payment-body">
                <div className="cod-info-box">
                  <span className="cod-icon">💵</span>
                  <div>
                    <strong>
                      {fulfillmentType === 'store_pickup'
                        ? 'Pay at ElectroHaven Store Counter'
                        : 'Cash on Delivery (Doorstep Payment)'}
                    </strong>
                    <p>
                      {fulfillmentType === 'store_pickup'
                        ? `You can pay via Cash, Credit/Debit Card, or UPI QR code directly at the ${selectedStore.name} cashier counter when collecting your device.`
                        : 'You can pay via Cash or UPI QR Code directly to the delivery executive when your parcel arrives.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="secure-checkout-note">
              🔒 128-bit SSL encrypted demo checkout. No actual money is debited.
            </p>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <aside className="checkout-summary-column">
          <div className="order-summary">
            <div className="cart-panel-heading">
              <h2>Order Summary</h2>
              <span>({cart.reduce((c, i) => c + i.quantity, 0)} items)</span>
            </div>

            {/* Fulfillment Indicator */}
            <div className="summary-fulfillment-badge-row">
              <span className="fulfillment-type-pill">
                {fulfillmentType === 'store_pickup' ? '🏬 Store Pickup (Free)' : '🚚 Doorstep Delivery'}
              </span>
              {fulfillmentType === 'store_pickup' && (
                <small className="summary-store-name">
                  Store: <strong>{selectedStore.locality}</strong>
                </small>
              )}
            </div>

            {/* Items list */}
            <div className="checkout-items-list">
              {cart.map((item) => (
                <div key={item.id} className="checkout-mini-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="checkout-item-thumb"
                    onError={handleProductImageError}
                  />
                  <div className="checkout-item-meta">
                    <strong>{item.name}</strong>
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                    <b className="checkout-item-price">
                      {formatINR(item.price * item.quantity)}
                    </b>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="summary-lines">
              <div>
                <span>Items Subtotal</span>
                <strong>{formatINR(totals.subtotal)}</strong>
              </div>

              {totals.productSavings > 0 && (
                <div className="summary-discount">
                  <span>Product Savings</span>
                  <strong>− {formatINR(totals.productSavings)}</strong>
                </div>
              )}

              {appliedCoupon && (
                <div className="summary-discount">
                  <span>Coupon ({appliedCoupon})</span>
                  <strong>− {formatINR(totals.couponDiscount)}</strong>
                </div>
              )}

              <div>
                <span>Estimated GST (18%)</span>
                <strong>{formatINR(totals.estimatedGst)}</strong>
              </div>

              <div>
                <span>{fulfillmentType === 'store_pickup' ? 'Pickup Fee' : 'Delivery Charge'}</span>
                <strong>
                  {totals.delivery === 0 ? (
                    <span className="delivery-free">FREE</span>
                  ) : (
                    formatINR(totals.delivery)
                  )}
                </strong>
              </div>
            </div>

            <div className="summary-total">
              <span>Total Payable</span>
              <strong>{formatINR(totals.total)}</strong>
            </div>

            <button
              type="button"
              className="primary checkout-button"
              disabled={
                isSubmitting ||
                !stockCheck.isValid ||
                (fulfillmentType === 'store_pickup' && !selectedStoreStock.isAvailable)
              }
              onClick={handlePlaceOrder}
            >
              {isSubmitting
                ? 'Processing Your Order...'
                : fulfillmentType === 'store_pickup'
                ? `Confirm Store Pickup (${formatINR(totals.total)}) →`
                : paymentMethod === 'cod'
                ? `Confirm COD Order (${formatINR(totals.total)}) →`
                : `Pay & Place Order (${formatINR(totals.total)}) →`}
            </button>

            <button
              type="button"
              className="text-button"
              style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
              onClick={onBackToCart}
            >
              ← Back to Shopping Cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
