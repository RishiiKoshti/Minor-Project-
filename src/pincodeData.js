// Pincode dataset and delivery checker utilities for ElectroHaven (Croma Style)

export const KNOWN_PINCODES = {
  // Ahmedabad & Gujarat (Local Hub)
  '380009': { city: 'Ahmedabad', locality: 'Navrangpura', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380015': { city: 'Ahmedabad', locality: 'Satellite', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380008': { city: 'Ahmedabad', locality: 'Maninagar', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380054': { city: 'Ahmedabad', locality: 'Vastrapur / SG Highway', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380001': { city: 'Ahmedabad', locality: 'Old City / Lal Darwaja', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380006': { city: 'Ahmedabad', locality: 'Ellisbridge', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380013': { city: 'Ahmedabad', locality: 'Naranpura', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '380052': { city: 'Ahmedabad', locality: 'Memnagar', state: 'Gujarat', standardDays: 1, expressDays: 0, expressAvailable: true, codAvailable: true },
  '382001': { city: 'Gandhinagar', locality: 'Sector 1-30', state: 'Gujarat', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '390001': { city: 'Vadodara', locality: 'Alkapuri', state: 'Gujarat', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '395001': { city: 'Surat', locality: 'Ring Road', state: 'Gujarat', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '360001': { city: 'Rajkot', locality: 'Yagnik Road', state: 'Gujarat', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },

  // Metros & Major Indian Cities
  '400001': { city: 'Mumbai', locality: 'Fort / South Mumbai', state: 'Maharashtra', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '400050': { city: 'Mumbai', locality: 'Bandra West', state: 'Maharashtra', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '411001': { city: 'Pune', locality: 'Shivajinagar', state: 'Maharashtra', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '110001': { city: 'New Delhi', locality: 'Connaught Place', state: 'Delhi NCR', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '110016': { city: 'New Delhi', locality: 'Hauz Khas', state: 'Delhi NCR', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '122001': { city: 'Gurugram', locality: 'Cyber City', state: 'Haryana', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '201301': { city: 'Noida', locality: 'Sector 18', state: 'Uttar Pradesh', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '560001': { city: 'Bengaluru', locality: 'MG Road', state: 'Karnataka', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '560038': { city: 'Bengaluru', locality: 'Indiranagar', state: 'Karnataka', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '500001': { city: 'Hyderabad', locality: 'Abids', state: 'Telangana', standardDays: 2, expressDays: 1, expressAvailable: true, codAvailable: true },
  '600001': { city: 'Chennai', locality: 'George Town', state: 'Tamil Nadu', standardDays: 3, expressDays: 2, expressAvailable: true, codAvailable: true },
  '700001': { city: 'Kolkata', locality: 'BBD Bagh', state: 'West Bengal', standardDays: 3, expressDays: 2, expressAvailable: true, codAvailable: true },
  '302001': { city: 'Jaipur', locality: 'MI Road', state: 'Rajasthan', standardDays: 3, expressDays: 2, expressAvailable: true, codAvailable: true },

  // Explicit Non-Serviceable Test Codes
  '999999': { isServiceable: false, reason: 'Remote military/unserviceable sector' },
  '744301': { isServiceable: false, reason: 'Remote island territory without air cargo connectivity' },
  '194101': { isServiceable: false, reason: 'High altitude winter restricted zone' },
  '123456': { isServiceable: false, reason: 'Invalid postal routing zone' },
};

export const QUICK_DEMO_PINCODES = [
  { pin: '380009', label: 'Ahmedabad (Local Same-Day)' },
  { pin: '400001', label: 'Mumbai (Express)' },
  { pin: '110001', label: 'Delhi (Express)' },
  { pin: '560001', label: 'Bangalore (Express)' },
  { pin: '999999', label: 'Unserviceable Zone' },
];

/**
 * Calculates delivery date formatted nicely as: "Monday, 23 Nov"
 */
export function getEstimatedDeliveryDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (daysFromNow === 0) {
    return `Today by 9:00 PM (${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]})`;
  }
  if (daysFromNow === 1) {
    return `Tomorrow by 9:00 PM (${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]})`;
  }
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

const PINCODE_STORAGE_KEY = 'electrohaven_delivery_pincode';

export function getSavedPincode() {
  try {
    const saved = localStorage.getItem(PINCODE_STORAGE_KEY);
    if (saved && /^\d{6}$/.test(saved)) {
      return saved;
    }
    return '380009'; // Default to Ahmedabad flagship
  } catch {
    return '380009';
  }
}

export function savePincode(pin) {
  try {
    if (/^\d{6}$/.test(pin)) {
      localStorage.setItem(PINCODE_STORAGE_KEY, pin);
    }
  } catch {}
}

/**
 * Comprehensive Pincode Checker
 * Returns full availability info, options (Standard/Express), charges, and estimated dates.
 */
export function checkPincodeDelivery(pincodeInput) {
  const raw = (pincodeInput || '').trim();

  // Validate format
  if (!raw) {
    return {
      isValid: false,
      error: 'Please enter a 6-digit Indian PIN code.',
    };
  }

  if (!/^\d+$/.test(raw)) {
    return {
      isValid: false,
      error: 'Invalid PIN code. Please enter numeric digits only (e.g. 380009).',
    };
  }

  if (raw.length !== 6) {
    return {
      isValid: false,
      error: `Invalid PIN code length. Expected 6 digits, received ${raw.length}.`,
    };
  }

  if (raw.startsWith('0')) {
    return {
      isValid: false,
      error: 'Invalid PIN code. Indian PIN codes cannot begin with 0.',
    };
  }

  // Check known dictionary
  if (KNOWN_PINCODES[raw]) {
    const data = KNOWN_PINCODES[raw];
    if (data.isServiceable === false) {
      return {
        isValid: true,
        pincode: raw,
        isServiceable: false,
        reason: data.reason || 'We do not deliver to this location currently.',
      };
    }

    const standardDays = data.standardDays ?? 2;
    const expressDays = data.expressDays ?? 1;

    return {
      isValid: true,
      pincode: raw,
      isServiceable: true,
      city: data.city,
      locality: data.locality,
      state: data.state,
      codAvailable: data.codAvailable ?? true,
      standardOption: {
        type: 'Standard Delivery',
        days: standardDays,
        dateFormatted: getEstimatedDeliveryDate(standardDays),
        charge: 0,
        chargeLabel: 'FREE',
        description: 'Delivered via ElectroHaven Surface Logistics',
      },
      expressOption: data.expressAvailable
        ? {
            type: 'Express Delivery',
            days: expressDays,
            dateFormatted: getEstimatedDeliveryDate(expressDays),
            charge: expressDays === 0 ? 149 : 99,
            chargeLabel: expressDays === 0 ? '₹149' : '₹99',
            description: expressDays === 0 ? 'Same-day express delivery by our local courier' : 'Next-day priority air express',
          }
        : null,
    };
  }

  // Handle generalized Indian postal circles
  const firstDigit = raw.charAt(0);
  if (firstDigit === '9') {
    // 9xxxx is APS (Army Postal Service) or test - mark unserviceable
    return {
      isValid: true,
      pincode: raw,
      isServiceable: false,
      reason: 'Delivery to this designated postal circle is currently unavailable.',
    };
  }

  // Generalized serviceable zone
  const zoneNames = {
    '1': 'North India (Delhi / Punjab / Haryana)',
    '2': 'North India (Uttar Pradesh / Uttarakhand)',
    '3': 'West India (Gujarat / Rajasthan)',
    '4': 'West India (Maharashtra / Madhya Pradesh)',
    '5': 'South India (Karnataka / Andhra Pradesh)',
    '6': 'South India (Tamil Nadu / Kerala)',
    '7': 'East India (West Bengal / Odisha)',
    '8': 'East India (Bihar / Jharkhand)',
  };

  const zone = zoneNames[firstDigit] || 'Pan-India';
  const isGujaratRegion = raw.startsWith('38') || raw.startsWith('39') || raw.startsWith('36');
  const standardDays = isGujaratRegion ? 2 : 3;
  const expressDays = isGujaratRegion ? 1 : 2;

  return {
    isValid: true,
    pincode: raw,
    isServiceable: true,
    city: isGujaratRegion ? 'Gujarat Region' : 'Serviceable Indian Location',
    locality: zone,
    state: isGujaratRegion ? 'Gujarat' : 'India',
    codAvailable: true,
    standardOption: {
      type: 'Standard Delivery',
      days: standardDays,
      dateFormatted: getEstimatedDeliveryDate(standardDays),
      charge: 0,
      chargeLabel: 'FREE',
      description: 'Standard insured delivery to your doorstep',
    },
    expressOption: {
      type: 'Express Delivery',
      days: expressDays,
      dateFormatted: getEstimatedDeliveryDate(expressDays),
      charge: 99,
      chargeLabel: '₹99',
      description: 'Priority courier with fast-track fulfillment',
    },
  };
}
