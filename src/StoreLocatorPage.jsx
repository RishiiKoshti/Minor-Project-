import React, { useState, useMemo, useEffect } from 'react';
import {
  ahmedabadStores,
  ahmedabadLocalities,
  calculateDistanceKm,
  getGoogleMapsUrl,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getStoredStoresList,
} from './storesData';
import { subscribeToRealtimeSync } from './realtimeSync';

export default function StoreLocatorPage({
  preferredStore,
  onSetPreferredStore,
  onContinueShopping,
}) {
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [storesVersion, setStoresVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync((msg) => {
      if (msg.entity === 'stores') {
        setStoresVersion((prev) => prev + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  const allStores = useMemo(() => getStoredStoresList(), [storesVersion]);
  const [activeStoreId, setActiveStoreId] = useState(preferredStore?.id || (allStores[0] && allStores[0].id) || 'eh-store-amd-01');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [savedAlert, setSavedAlert] = useState(null);

  // Active store object
  const activeStore = useMemo(() => {
    return allStores.find((s) => s.id === activeStoreId) || allStores[0];
  }, [allStores, activeStoreId]);

  // Handle Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setGeoLoading(false);
        setSelectedLocality('all');
      },
      (err) => {
        setGeoLoading(false);
        setGeoError('Unable to retrieve your location. Please select a locality manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // If user selects a locality, update reference coordinates for distance calculations
  const handleLocalitySelect = (localityItem) => {
    setSelectedLocality(localityItem.locality);
    if (localityItem.coordinates) {
      setUserCoords(localityItem.coordinates);
    } else {
      setUserCoords(null);
    }
  };

  // Filtered and distance-annotated stores
  const storesWithDistance = useMemo(() => {
    const list = allStores.map((store) => {
      let distance = null;
      if (userCoords) {
        distance = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          store.coordinates.lat,
          store.coordinates.lng
        );
      }
      return {
        ...store,
        distance,
      };
    });

    // Filter by search and locality
    const filtered = list.filter((store) => {
      const matchesLocality =
        selectedLocality === 'all' ||
        store.locality.toLowerCase() === selectedLocality.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        store.name.toLowerCase().includes(query) ||
        store.locality.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query) ||
        store.pincode.includes(query);

      return matchesLocality && matchesQuery;
    });

    // If distances are available, sort by nearest
    if (userCoords) {
      filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return filtered;
  }, [selectedLocality, searchQuery, userCoords]);

  const handleSelectPreferred = (store) => {
    onSetPreferredStore(store);
    setSavedAlert(store.name);
    setTimeout(() => setSavedAlert(null), 3500);
  };

  return (
    <div className="store-locator-page">
      {/* Page Header */}
      <div className="section-head store-head">
        <div>
          <p className="kicker">FIND A STORE NEAR YOU</p>
          <h1>ElectroHaven Store Locator</h1>
          <p className="catalog-description">
            Experience next-gen electronics in person. Explore our 5 official experience stores across Ahmedabad with live demo units, express repair hubs, and in-store order pickup.
          </p>
        </div>

        {preferredStore && (
          <div className="current-preferred-badge">
            <span className="pref-icon">★</span>
            <div>
              <small>My Preferred Store</small>
              <strong>{preferredStore.name}</strong>
            </div>
          </div>
        )}
      </div>

      {savedAlert && (
        <div className="store-saved-alert" role="status">
          ✓ <strong>{savedAlert}</strong> has been saved as your preferred store. Product availability and in-store pickup will default to this location!
        </div>
      )}

      {/* Filter and Location Controls Bar */}
      <div className="store-controls-panel">
        <div className="store-search-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by area, pincode, or landmark (e.g. Satellite, 380009)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search stores"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>

        <button
          className={`primary detect-location-btn ${geoLoading ? 'loading' : ''}`}
          type="button"
          onClick={handleDetectLocation}
          disabled={geoLoading}
        >
          <span>📍</span> {geoLoading ? 'Detecting Location...' : 'Use My Current Location'}
        </button>
      </div>

      {geoError && <p className="store-geo-error">⚠ {geoError}</p>}

      {/* Locality Chips */}
      <div className="store-locality-chips">
        <span className="locality-label">QUICK SELECT AREA:</span>
        <div className="chips-row">
          {ahmedabadLocalities.map((item) => (
            <button
              key={item.locality}
              type="button"
              className={`locality-chip ${selectedLocality === item.locality ? 'active' : ''}`}
              onClick={() => handleLocalitySelect(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Stores List & Live Map View */}
      <div className="store-locator-layout">
        {/* Left Column: Stores List */}
        <div className="store-cards-column">
          <div className="store-list-header">
            <h3>
              Ahmedabad Stores <span>({storesWithDistance.length} locations found)</span>
            </h3>
            {userCoords && <small className="sorted-notice">Sorted by nearest to you</small>}
          </div>

          {storesWithDistance.length === 0 ? (
            <div className="empty-state store-empty">
              <span className="empty-icon">📍</span>
              <h3>No stores match your search</h3>
              <p>Try searching for another locality, or click "All Localities" to see all 5 Ahmedabad stores.</p>
              <button
                className="outline-button"
                type="button"
                onClick={() => {
                  setSelectedLocality('all');
                  setSearchQuery('');
                }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="store-cards-list">
              {storesWithDistance.map((store) => {
                const isSelected = activeStoreId === store.id;
                const isPreferred = preferredStore?.id === store.id;

                return (
                  <article
                    key={store.id}
                    className={`store-card ${isSelected ? 'selected' : ''} ${isPreferred ? 'preferred' : ''}`}
                    onClick={() => setActiveStoreId(store.id)}
                  >
                    <div className="store-card-top">
                      <div className="store-card-title-group">
                        <span className="store-tag-badge">{store.tag}</span>
                        {isPreferred && <span className="store-preferred-pill">★ Preferred Store</span>}
                        <h4>{store.name}</h4>
                      </div>

                      {store.distance != null && (
                        <div className="store-distance-badge" title="Distance from your location">
                          📍 {store.distance} km away
                        </div>
                      )}
                    </div>

                    <div className="store-card-status">
                      <span className="status-indicator"></span>
                      <strong>{store.status}</strong>
                      <span>· {store.openingHours.timing}</span>
                    </div>

                    <p className="store-card-address">{store.address}</p>

                    <div className="store-card-contact-row">
                      <div className="contact-item">
                        <span>📞</span>
                        <a href={`tel:${store.contact}`} onClick={(e) => e.stopPropagation()}>
                          {store.contact}
                        </a>
                      </div>
                      <div className="contact-item">
                        <span>✉</span>
                        <a href={`mailto:${store.email}`} onClick={(e) => e.stopPropagation()}>
                          {store.email}
                        </a>
                      </div>
                    </div>

                    {/* Amenities / Services */}
                    <div className="store-amenities">
                      {store.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">
                          ✓ {amenity}
                        </span>
                      ))}
                      {store.amenities.length > 3 && (
                        <span className="amenity-more">+{store.amenities.length - 3} more</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="store-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`store-set-preferred-btn ${isPreferred ? 'active' : ''}`}
                        onClick={() => handleSelectPreferred(store)}
                        title="Save for future product availability check"
                      >
                        {isPreferred ? '✓ Saved as My Store' : 'Set as My Preferred Store'}
                      </button>

                      <a
                        href={getGoogleMapsDirectionsUrl(store, userCoords)}
                        target="_blank"
                        rel="noreferrer"
                        className="store-directions-link"
                      >
                        Directions ↗
                      </a>

                      <a
                        href={getGoogleMapsUrl(store)}
                        target="_blank"
                        rel="noreferrer"
                        className="store-gmaps-link"
                      >
                        Google Maps ↗
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Store Map & Detailed Showcase */}
        <div className="store-map-column">
          <div className="store-map-card">
            <div className="map-card-head">
              <div>
                <span className="kicker">INTERACTIVE STORE LOCATION</span>
                <h3>{activeStore.name}</h3>
                <p className="map-locality-text">
                  Locality: <strong>{activeStore.locality}</strong> · Pincode: <strong>{activeStore.pincode}</strong>
                </p>
              </div>

              <a
                href={getGoogleMapsUrl(activeStore)}
                target="_blank"
                rel="noreferrer"
                className="primary map-open-btn"
              >
                Open in Google Maps ↗
              </a>
            </div>

            {/* Embedded Live Google Maps View */}
            <div className="store-map-embed-frame">
              <iframe
                title={`Google Map - ${activeStore.name}`}
                src={getGoogleMapsEmbedUrl(activeStore)}
                width="100%"
                height="340"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Detailed Store Amenities & Hours Panel */}
            <div className="store-detail-specs">
              <div className="store-spec-section">
                <h4>Store Hours &amp; Days</h4>
                <div className="spec-line">
                  <span>Days:</span>
                  <strong>{activeStore.openingHours.days}</strong>
                </div>
                <div className="spec-line">
                  <span>Timing:</span>
                  <strong>{activeStore.openingHours.timing}</strong>
                </div>
                <div className="spec-line">
                  <span>Note:</span>
                  <small>{activeStore.openingHours.note}</small>
                </div>
              </div>

              <div className="store-spec-section">
                <h4>GPS Coordinates</h4>
                <div className="spec-line">
                  <span>Latitude:</span>
                  <code>{activeStore.coordinates.lat}° N</code>
                </div>
                <div className="spec-line">
                  <span>Longitude:</span>
                  <code>{activeStore.coordinates.lng}° E</code>
                </div>
              </div>

              <div className="store-spec-section">
                <h4>Available Services &amp; Experience Zones</h4>
                <div className="full-amenities-grid">
                  {activeStore.amenities.map((amenity, idx) => (
                    <span key={idx} className="full-amenity-chip">
                      ✦ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Store Card Actions */}
            <div className="map-footer-actions">
              <button
                className={`primary map-set-pref-btn ${preferredStore?.id === activeStore.id ? 'active' : ''}`}
                type="button"
                onClick={() => handleSelectPreferred(activeStore)}
              >
                {preferredStore?.id === activeStore.id
                  ? '✓ Preferred Store for Product Availability'
                  : '★ Select as My Preferred Store'}
              </button>

              <a
                href={getGoogleMapsDirectionsUrl(activeStore, userCoords)}
                target="_blank"
                rel="noreferrer"
                className="secondary map-dir-btn"
              >
                Get Turn-by-Turn Directions ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Storefront Prompt */}
      <div className="store-bottom-cta">
        <button className="text-button" type="button" onClick={onContinueShopping}>
          ← Return to ElectroHaven Storefront
        </button>
      </div>
    </div>
  );
}
