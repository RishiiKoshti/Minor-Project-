import React, { useState } from 'react';
import { logoutUser } from './auth';
import { getStoredAddresses, saveStoredAddress } from './cart';

export default function UserProfilePage({
  user,
  onLogout,
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateCart,
  onContinueShopping,
}) {
  const [addresses, setAddresses] = useState(() => getStoredAddresses());
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPincode, setNewPincode] = useState('380009');
  const [newCity, setNewCity] = useState('Ahmedabad');
  const [newState, setNewState] = useState('Gujarat');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newAddressLine1 || !newPincode) {
      showToast('Please fill in all required address fields.');
      return;
    }

    const addr = {
      id: `addr_${Date.now()}`,
      fullName: newFullName,
      phone: newPhone,
      email: user?.email || '',
      addressLine1: newAddressLine1,
      addressLine2: newAddressLine2,
      landmark: newLandmark,
      pincode: newPincode,
      city: newCity,
      state: newState,
      addressType: newAddressType,
      isDefault: addresses.length === 0,
    };

    const updated = saveStoredAddress(addr);
    setAddresses(updated);
    setShowAddAddress(false);
    showToast('New shipping address saved successfully!');
  };

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) onLogout();
  };

  if (!user) {
    return (
      <div className="section empty-state">
        <h2>Please Sign In</h2>
        <p>You need to be signed in to view your profile.</p>
        <button className="primary" onClick={onContinueShopping}>
          Go to Storefront <b>→</b>
        </button>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="user-profile-wrapper">
      {toast && <div className="auth-floating-toast">{toast}</div>}

      <div className="profile-hero-card">
        <div className="profile-avatar-circle">{initials}</div>
        <div className="profile-identity">
          <div className="profile-name-row">
            <h1>{user.name}</h1>
            <span className="profile-member-badge">✓ ElectroHaven Member</span>
          </div>
          <div className="profile-contact-chips">
            <span className="profile-chip">
              ✉ {user.email} {user.emailVerified ? <b className="chip-verified">✓ Verified</b> : <b className="chip-pending">Unverified</b>}
            </span>
            <span className="profile-chip">
              📞 +91 {user.phone} <b className="chip-verified">✓ Verified</b>
            </span>
          </div>
        </div>

        <button type="button" className="outline-button profile-logout-btn" onClick={handleLogoutClick}>
          🚪 Sign Out
        </button>
      </div>

      <div className="profile-quick-actions-grid">
        <button type="button" className="profile-quick-card" onClick={onNavigateOrders}>
          <span className="profile-quick-icon">📦</span>
          <div>
            <strong>My Orders &amp; Returns</strong>
            <small>Track packages, view past invoices, reorder</small>
          </div>
          <span className="quick-arrow">→</span>
        </button>

        <button type="button" className="profile-quick-card" onClick={onNavigateWishlist}>
          <span className="profile-quick-icon">♡</span>
          <div>
            <strong>Saved Wishlist</strong>
            <small>View items you saved for later</small>
          </div>
          <span className="quick-arrow">→</span>
        </button>

        <button type="button" className="profile-quick-card" onClick={onNavigateCart}>
          <span className="profile-quick-icon">🛒</span>
          <div>
            <strong>Active Shopping Cart</strong>
            <small>Review items ready for checkout</small>
          </div>
          <span className="quick-arrow">→</span>
        </button>
      </div>

      {/* Saved Delivery Addresses Section */}
      <div className="profile-addresses-section">
        <div className="section-head">
          <div>
            <p className="kicker">DELIVERY PREFERENCES</p>
            <h2>Saved Shipping Addresses</h2>
          </div>
          <button
            type="button"
            className="outline-button"
            onClick={() => setShowAddAddress(!showAddAddress)}
          >
            {showAddAddress ? 'Cancel' : '+ Add New Address'}
          </button>
        </div>

        {showAddAddress && (
          <form className="profile-new-address-form" onSubmit={handleSaveAddress}>
            <h3>Add New Shipping Address</h3>
            <div className="address-form-grid">
              <div className="auth-field">
                <label>Recipient Name *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div className="auth-field full-width">
                <label>Flat, House No., Building, Apartment *</label>
                <input
                  type="text"
                  value={newAddressLine1}
                  onChange={(e) => setNewAddressLine1(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field full-width">
                <label>Area, Street, Sector, Locality</label>
                <input
                  type="text"
                  value={newAddressLine2}
                  onChange={(e) => setNewAddressLine2(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>Landmark (Optional)</label>
                <input
                  type="text"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label>6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>City *</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>State *</label>
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Address Type</label>
                <select
                  value={newAddressType}
                  onChange={(e) => setNewAddressType(e.target.value)}
                >
                  <option value="Home">Home (All Day Delivery)</option>
                  <option value="Work">Work (10 AM - 6 PM)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-action-row">
              <button type="submit" className="primary">
                Save Address
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setShowAddAddress(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="addresses-cards-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className="saved-address-card">
              <div className="addr-card-top">
                <span className="addr-type-pill">{addr.addressType || 'Home'}</span>
                {addr.isDefault && <span className="addr-default-pill">DEFAULT</span>}
              </div>
              <strong>{addr.fullName}</strong>
              <p>
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                {addr.landmark ? `, Near ${addr.landmark}` : ''}
              </p>
              <p>
                {addr.city}, {addr.state} – <b>{addr.pincode}</b>
              </p>
              <span className="addr-phone">📞 +91 {addr.phone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
