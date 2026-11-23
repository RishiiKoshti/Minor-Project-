// ElectroHaven Ahmedabad Stores Dataset & Store Locator Utilities

export const ahmedabadStores = [
  {
    id: 'eh-store-amd-01',
    name: 'ElectroHaven Flagship Store, Navrangpura',
    locality: 'Navrangpura',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
    address: 'Shop 101-104, Ground Floor, CG Square Mall, CG Road, Navrangpura, Ahmedabad, Gujarat 380009',
    coordinates: {
      lat: 23.0336,
      lng: 72.5562,
    },
    contact: '+91 79 4001 2281',
    altContact: '+91 98250 11021',
    email: 'navrangpura@electrohaven.in',
    openingHours: {
      days: 'Monday – Sunday (All 7 Days)',
      timing: '10:30 AM – 9:30 PM',
      note: 'Open on public holidays',
    },
    status: 'Open Now',
    tag: 'Flagship Store',
    amenities: [
      'In-Store Order Pickup',
      'Demo & Experience Lounge',
      'Express Device Repair Hub',
      'Instant Phone & Laptop Exchange',
      'Wheelchair Accessible',
      'Free Customer Parking',
    ],
  },
  {
    id: 'eh-store-amd-02',
    name: 'ElectroHaven Experience Store, Satellite',
    locality: 'Satellite',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    address: 'Unit 12-15, Titanium City Center, 100 Feet Anand Nagar Road, Satellite, Ahmedabad, Gujarat 380015',
    coordinates: {
      lat: 23.0125,
      lng: 72.5245,
    },
    contact: '+91 79 4002 8842',
    altContact: '+91 98250 22032',
    email: 'satellite@electrohaven.in',
    openingHours: {
      days: 'Monday – Sunday (All 7 Days)',
      timing: '10:30 AM – 9:30 PM',
      note: 'Specialist advice desk available',
    },
    status: 'Open Now',
    tag: 'Experience Zone',
    amenities: [
      'Gaming Battle Rig Lounge',
      'In-Store Order Pickup',
      'Personal Tech Advisory',
      'Acoustic Hi-Fi Audio Booth',
      'No-Cost EMI Assistance Desk',
    ],
  },
  {
    id: 'eh-store-amd-03',
    name: 'ElectroHaven Retail Hub, Maninagar',
    locality: 'Maninagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380008',
    address: 'Ground Floor, Kankaria Road, Near Maninagar Railway Station, Maninagar, Ahmedabad, Gujarat 380008',
    coordinates: {
      lat: 22.9978,
      lng: 72.6026,
    },
    contact: '+91 79 4003 5519',
    altContact: '+91 98250 33043',
    email: 'maninagar@electrohaven.in',
    openingHours: {
      days: 'Monday – Sunday (All 7 Days)',
      timing: '10:00 AM – 9:00 PM',
      note: 'Near Kankaria Lake',
    },
    status: 'Open Now',
    tag: 'Retail Hub',
    amenities: [
      'Fast In-Store Pickup',
      'Smart Home Demo Pods',
      'Laser Screen Protection Lab',
      'Quick Accessories Kiosk',
      'Senior Citizen Assistance',
    ],
  },
  {
    id: 'eh-store-amd-04',
    name: 'ElectroHaven Mega Store, Vastrapur',
    locality: 'Vastrapur',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
    address: 'Lower Ground Floor, Ahmedabad One Mall (Alpha One), Vastrapur Lake Road, Vastrapur, Ahmedabad, Gujarat 380054',
    coordinates: {
      lat: 23.0396,
      lng: 72.5306,
    },
    contact: '+91 79 4004 6630',
    altContact: '+91 98250 44054',
    email: 'vastrapur@electrohaven.in',
    openingHours: {
      days: 'Monday – Sunday (All 7 Days)',
      timing: '11:00 AM – 10:00 PM',
      note: 'Mall hours applicable',
    },
    status: 'Open Now',
    tag: 'Mega Store',
    amenities: [
      'Official Brand Experience Zones',
      'In-Store Order Pickup',
      'Extended Care & Warranty Center',
      'Doorstep Delivery Dispatch Hub',
      'Ample Mall Basement Parking',
    ],
  },
  {
    id: 'eh-store-amd-05',
    name: 'ElectroHaven Tech Hub, SG Highway',
    locality: 'SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
    address: 'Survey 214, Next to Iscon Mega Mall, Sarkhej - Gandhinagar Highway, Bodakdev, Ahmedabad, Gujarat 380054',
    coordinates: {
      lat: 23.0298,
      lng: 72.5074,
    },
    contact: '+91 79 4005 9974',
    altContact: '+91 98250 55065',
    email: 'sghighway@electrohaven.in',
    openingHours: {
      days: 'Monday – Sunday (All 7 Days)',
      timing: '10:30 AM – 9:30 PM',
      note: 'Direct highway frontage',
    },
    status: 'Open Now',
    tag: 'Tech Hub',
    amenities: [
      'Drive-Through Pickup Bay',
      'Large Screen & OLED Display Studio',
      'VIP Tech Concierge',
      'Complimentary Valet Parking',
      'Corporate Purchase Desk',
    ],
  },
];

// Reference coordinates for Ahmedabad localities to calculate distances when user selects their area
export const ahmedabadLocalities = [
  { name: 'All Localities', locality: 'all', coordinates: null },
  { name: 'Navrangpura', locality: 'Navrangpura', coordinates: { lat: 23.0336, lng: 72.5562 } },
  { name: 'Satellite', locality: 'Satellite', coordinates: { lat: 23.0125, lng: 72.5245 } },
  { name: 'Maninagar', locality: 'Maninagar', coordinates: { lat: 22.9978, lng: 72.6026 } },
  { name: 'Vastrapur', locality: 'Vastrapur', coordinates: { lat: 23.0396, lng: 72.5306 } },
  { name: 'SG Highway', locality: 'SG Highway', coordinates: { lat: 23.0298, lng: 72.5074 } },
];

// Haversine formula to calculate distance between two coordinates in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

// Generate Google Maps Search URL
export function getGoogleMapsUrl(store) {
  const query = encodeURIComponent(`${store.name}, ${store.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// Generate Google Maps Directions URL
export function getGoogleMapsDirectionsUrl(store, userCoords = null) {
  const destination = `${store.coordinates.lat},${store.coordinates.lng}`;
  if (userCoords && userCoords.lat && userCoords.lng) {
    const origin = `${userCoords.lat},${userCoords.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

// Generate Embedded Map URL (for iframe)
export function getGoogleMapsEmbedUrl(store) {
  return `https://maps.google.com/maps?q=${store.coordinates.lat},${store.coordinates.lng}&hl=en&z=15&output=embed`;
}

// LocalStorage helpers to save preferred store for future product availability integration
const PREFERRED_STORE_KEY = 'electrohaven_preferred_store';

export function getStoredStoresList() {
  try {
    const raw = localStorage.getItem('electrohaven_custom_stores');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return ahmedabadStores;
}

export function getSavedPreferredStore() {
  try {
    const allStores = getStoredStoresList();
    const saved = localStorage.getItem(PREFERRED_STORE_KEY);
    if (!saved) return allStores[0];
    const parsed = JSON.parse(saved);
    const matched = allStores.find((s) => s.id === parsed.id);
    return matched || allStores[0];
  } catch (err) {
    return ahmedabadStores[0];
  }
}

export function savePreferredStore(store) {
  try {
    localStorage.setItem(
      PREFERRED_STORE_KEY,
      JSON.stringify({
        id: store.id,
        name: store.name,
        locality: store.locality,
        pincode: store.pincode,
        savedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error('Could not save preferred store to localStorage', err);
  }
}
