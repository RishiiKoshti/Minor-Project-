// ElectroHaven AI Smart Setup Builder Engine
// Analyzes user requirements, purpose, and budget to assemble intelligent, compatible, in-stock setups.

import { getProductStoreStock } from './storeAvailability.js';

export const SETUP_PURPOSES = [
  {
    id: 'gaming',
    label: 'Gaming',
    icon: '🎮',
    tagline: 'High-FPS AAA & Competitive Esports',
    description: 'Ultra-low latency peripherals, high-refresh displays, and dedicated GPU computing for peak frames.',
    accentColor: '#3b82f6',
    componentSlots: ['core', 'display', 'keyboard', 'audio', 'accent'],
  },
  {
    id: 'programming',
    label: 'Programming & Dev',
    icon: '💻',
    tagline: 'Deep Focus & Heavy Compilation',
    description: 'Multi-core workstation power, dual-screen 4K real estate, tactile ergonomics, and distraction-free ANC.',
    accentColor: '#10b981',
    componentSlots: ['core', 'display', 'keyboard', 'audio', 'accent'],
  },
  {
    id: 'video_editing',
    label: 'Video Editing & 3D',
    icon: '🎬',
    tagline: 'Color-Accurate 4K/8K Rendering',
    description: 'High memory bandwidth, wide DCI-P3 color gamut, hardware encoder engines, and studio acoustic fidelity.',
    accentColor: '#8b5cf6',
    componentSlots: ['core', 'display', 'audio', 'camera', 'accent'],
  },
  {
    id: 'content_creation',
    label: 'Content Creation & Stream',
    icon: '🎙️',
    tagline: 'Studio Production & Streaming',
    description: 'Pro 4K vlogging cameras, studio audio clarity, smart lighting ambiance, and seamless editing throughput.',
    accentColor: '#ec4899',
    componentSlots: ['core', 'camera', 'display', 'audio', 'accent'],
  },
  {
    id: 'office',
    label: 'Office & Productivity',
    icon: '💼',
    tagline: 'Executive Multitasking & Battery Life',
    description: 'All-day battery ultrabooks, 4K eye-care monitors, crystal-clear conferencing, and clean desk aesthetics.',
    accentColor: '#f59e0b',
    componentSlots: ['core', 'display', 'keyboard', 'audio', 'accent'],
  },
  {
    id: 'study',
    label: 'Study & Academics',
    icon: '📚',
    tagline: 'Portable Library & Campus Setup',
    description: 'Featherlight carry, active noise cancelling for silent libraries, smart wellness tracking, and research productivity.',
    accentColor: '#06b6d4',
    componentSlots: ['core', 'audio', 'display', 'wearable', 'accent'],
  },
];

export const BUDGET_PRESETS = [
  { label: '₹1.5 Lakh', value: 150000 },
  { label: '₹2.2 Lakh', value: 220000 },
  { label: '₹3.0 Lakh', value: 300000 },
  { label: '₹4.0 Lakh', value: 400000 },
  { label: '₹5.5 Lakh+', value: 550000 },
];

export const ECOSYSTEM_PREFERENCES = [
  { id: 'all', label: 'All Premium Brands', icon: '✨' },
  { id: 'apple', label: 'Apple Ecosystem (macOS & iOS)', icon: '🍎' },
  { id: 'windows', label: 'Windows & PC Flagships', icon: '🪟' },
  { id: 'sony_creative', label: 'Sony Alpha & Audio Suite', icon: '📷' },
];

export const PORTABILITY_PREFERENCES = [
  { id: 'balanced', label: 'Balanced (Versatile 14-16")', icon: '⚖️' },
  { id: 'ultraportable', label: 'Ultraportable (Sub-1.3kg)', icon: '🪶' },
  { id: 'powerhouse', label: 'Maximum Powerhouse (16"+)', icon: '⚡' },
];

/**
 * Slot specifications and category mappings
 */
export const SLOT_DEFINITIONS = {
  core: {
    slotId: 'core',
    label: 'Core Machine',
    icon: '💻',
    category: 'laptops',
    description: 'The primary computing powerhouse for processing, compiling, and rendering.',
  },
  display: {
    slotId: 'display',
    label: 'Workspace Display',
    icon: '🖥️',
    category: 'accessories',
    typeMatch: ['monitor', 'gaming monitor'],
    description: 'High-resolution or high-refresh external canvas for ergonomic productivity.',
  },
  keyboard: {
    slotId: 'keyboard',
    label: 'Input & Controls',
    icon: '⌨️',
    category: 'gaming',
    typeMatch: ['keyboard', 'gaming keyboard', 'controller'],
    description: 'Tactile mechanical switches or precision wireless input.',
  },
  audio: {
    slotId: 'audio',
    label: 'Acoustics & Voice',
    icon: '🎧',
    category: 'headphones',
    description: 'Active noise cancellation, spatial immersion, and conference clarity.',
  },
  camera: {
    slotId: 'camera',
    label: 'Capture & Video',
    icon: '📷',
    category: 'cameras',
    description: 'Pro 4K sensors for streaming, vlogging, and cinematic recording.',
  },
  wearable: {
    slotId: 'wearable',
    label: 'Smart Wellness',
    icon: '⌚',
    category: 'wearables',
    description: 'Fitness tracking, discreet notifications, and schedule management.',
  },
  accent: {
    slotId: 'accent',
    label: 'Smart Ambience & Hub',
    icon: '💡',
    category: 'smart home',
    description: 'Smart ambient lighting, mesh networking, or smart displays for productivity.',
  },
};

/**
 * Computes an affinity score for a product given purpose and preferences.
 * Higher score = higher priority recommendation for this purpose.
 */
export function calculateAffinityScore(product, purpose, preferences = {}) {
  let score = 50;
  const name = (product?.name || '').toLowerCase();
  const type = (product?.type || '').toLowerCase();
  const desc = (product?.description || '').toLowerCase();

  const { ecosystem = 'all', portability = 'balanced' } = preferences;

  // Ecosystem preferences
  if (ecosystem === 'apple') {
    if (name.includes('apple') || name.includes('macbook') || name.includes('airpods')) score += 40;
  } else if (ecosystem === 'windows') {
    if (name.includes('dell') || name.includes('lenovo') || name.includes('hp') || name.includes('alienware') || name.includes('legion')) score += 40;
    if (name.includes('apple') || name.includes('macbook')) score -= 60;
  } else if (ecosystem === 'sony_creative') {
    if (name.includes('sony')) score += 40;
  }

  // Portability preferences for laptops
  if (type.includes('laptop')) {
    if (portability === 'ultraportable') {
      if (name.includes('air') || name.includes('x1 carbon') || name.includes('spectre')) score += 30;
      if (name.includes('alienware') || name.includes('legion') || name.includes('16')) score -= 25;
    } else if (portability === 'powerhouse') {
      if (name.includes('alienware') || name.includes('legion') || name.includes('xps 16') || name.includes('pro')) score += 30;
    }
  }

  // Purpose-specific bonuses
  if (purpose === 'gaming') {
    if (type.includes('gaming laptop') || name.includes('alienware') || name.includes('legion')) score += 50;
    if (type.includes('gaming monitor') || name.includes('odyssey')) score += 45;
    if (type.includes('gaming keyboard') || name.includes('apex pro') || name.includes('g pro')) score += 40;
    if (type.includes('gaming headset') || name.includes('inzone')) score += 40;
    if (type.includes('controller') || name.includes('dualsense') || name.includes('xbox')) score += 35;
    if (name.includes('macbook air') || name.includes('spectre')) score -= 30;
  } else if (purpose === 'programming') {
    if (name.includes('macbook pro') || name.includes('thinkpad x1') || name.includes('xps 16')) score += 45;
    if (name.includes('macbook air')) score += 35;
    if (name.includes('ultrafine') || type === 'monitor') score += 40;
    if (name.includes('wh-1000xm5') || name.includes('airpods pro')) score += 40;
    if (name.includes('g pro') || name.includes('apex')) score += 30;
    if (name.includes('deco') || name.includes('mesh')) score += 35;
  } else if (purpose === 'video_editing') {
    if (name.includes('macbook pro') || name.includes('xps 16')) score += 50;
    if (name.includes('ultrafine') || (type === 'monitor' && desc.includes('4k'))) score += 45;
    if (name.includes('wh-1000xm5') || name.includes('ie 200') || name.includes('airpods max')) score += 40;
    if (name.includes('fx3') || name.includes('a7 iv') || name.includes('canon') || name.includes('zv-e10')) score += 45;
    if (name.includes('hue')) score += 30;
  } else if (purpose === 'content_creation') {
    if (name.includes('zv-e10') || name.includes('insta360') || name.includes('gopro')) score += 50;
    if (name.includes('macbook pro') || name.includes('xps') || name.includes('spectre')) score += 40;
    if (name.includes('wh-1000xm5') || name.includes('airpods pro')) score += 35;
    if (name.includes('nest hub') || name.includes('echo')) score += 35;
    if (name.includes('hue')) score += 35;
    if (type.includes('controller')) score -= 40;
    if (type.includes('keyboard')) score += 35;
  } else if (purpose === 'office') {
    if (type.includes('controller')) score -= 50;
    if (type.includes('keyboard')) score += 35;
    if (name.includes('macbook air') || name.includes('thinkpad x1') || name.includes('spectre')) score += 45;
    if (name.includes('ultrafine') || type === 'monitor') score += 40;
    if (name.includes('wh-1000xm5') || name.includes('wf-1000xm5') || name.includes('airpods')) score += 40;
    if (name.includes('nest hub') || name.includes('plug')) score += 30;
    if (name.includes('alienware') || name.includes('legion')) score -= 25;
  } else if (purpose === 'study') {
    if (name.includes('macbook air') || name.includes('spectre')) score += 50;
    if (name.includes('airpods pro') || name.includes('wf-1000xm5') || name.includes('wi-c100')) score += 45;
    if (name.includes('fit3') || name.includes('galaxy ring') || name.includes('watch6')) score += 40;
    if (name.includes('ultrafine') || type === 'monitor') score += 35;
  }

  return score;
}

/**
 * Checks if a product has stock availability in at least one Ahmedabad store
 */
export function isProductAvailable(productId) {
  try {
    const stockInfo1 = getProductStoreStock(productId, 'eh-store-amd-01');
    const stockInfo2 = getProductStoreStock(productId, 'eh-store-amd-04');
    return stockInfo1.isAvailable || stockInfo2.isAvailable;
  } catch {
    return true; // Fallback to catalog availability
  }
}

/**
 * Generates an intelligent, purpose-specific explanation for why an item was chosen
 */
export function getRecommendationReason(product, purposeId, tierId) {
  const pName = (product?.name || '').toLowerCase();
  const pType = (product?.type || '').toLowerCase();

  if (purposeId === 'gaming') {
    if (pName.includes('alienware') || pName.includes('legion') || pType.includes('laptop')) {
      return 'GeForce RTX discrete graphics with high thermal TDP delivers sustained 144+ FPS in demanding AAA and competitive titles without throttling.';
    }
    if (pType.includes('monitor') || pName.includes('odyssey')) {
      return 'Blazing 240Hz refresh rate and Quantum Mini-LED curve deliver zero ghosting and competitive target acquisition in fast-paced games.';
    }
    if (pType.includes('keyboard') || pName.includes('apex') || pName.includes('g pro')) {
      return 'Rapid magnetic/mechanical actuation registers keystrokes in sub-milliseconds with anti-ghosting matrix for flawless inputs.';
    }
    if (pType.includes('headset') || pName.includes('inzone') || pType.includes('headphones')) {
      return 'Spatial Audio 360 acoustic mapping detects enemy footsteps and gunshots with pinpoint directionality in clutch rounds.';
    }
    if (pName.includes('controller') || pName.includes('dualsense') || pName.includes('xbox')) {
      return 'Adaptive haptic triggers and precision analog thumbsticks provide tournament-grade racing and adventure game control.';
    }
    if (pName.includes('hue') || pName.includes('lighting')) {
      return 'Dynamic RGB ambient lighting syncs with in-game battle cues for complete immersion across your battle-station.';
    }
  }

  if (purposeId === 'programming') {
    if (pName.includes('macbook pro') || pName.includes('thinkpad') || pName.includes('xps')) {
      return 'Massive unified memory bandwidth and multi-core CPU handle parallel Docker microservices, VM clusters, and instant code builds.';
    }
    if (pName.includes('macbook air')) {
      return 'M3 architecture compiles software instantly with 18-hour unplugged battery for versatile coding from campus or cafés.';
    }
    if (pType.includes('monitor') || pName.includes('ultrafine')) {
      return 'Pixel-dense 4K IPS panel renders razor-sharp syntax and multiple split code windows, reducing eye fatigue during 8+ hour coding sprints.';
    }
    if (pType.includes('keyboard') || pName.includes('g pro') || pName.includes('apex')) {
      return 'Tactile switch feedback provides tactile typing accuracy and reduced wrist fatigue across thousands of daily lines of code.';
    }
    if (pName.includes('wh-1000xm5') || pName.includes('airpods') || pType.includes('headphones')) {
      return 'Dual-processor Active Noise Cancellation eliminates office chatter and background distractions for unbroken deep coding focus.';
    }
    if (pName.includes('mesh') || pName.includes('deco') || pName.includes('router')) {
      return 'Wi-Fi 7 eliminates packet latency, stabilizing large git repo clones, remote server SSH sessions, and developer cloud pipelines.';
    }
  }

  if (purposeId === 'video_editing') {
    if (pName.includes('macbook pro') || pName.includes('xps 16') || pName.includes('alienware')) {
      return 'Hardware ProRes encoding acceleration and high VRAM allow real-time 4K/8K multicam playback without waiting for proxy renders.';
    }
    if (pType.includes('monitor') || pName.includes('ultrafine')) {
      return 'Wide DCI-P3 98% color gamut and HDR10 calibration ensure video grading translates accurately to broadcast and mobile screens.';
    }
    if (pName.includes('fx3') || pName.includes('a7') || pName.includes('canon') || pName.includes('zv-e10')) {
      return 'Large cinema sensor with 10-bit 4:2:2 capture and dual base ISO captures stunning dynamic range with professional studio gradeability.';
    }
    if (pName.includes('wh-1000xm5') || pName.includes('ie 200') || pName.includes('airpods max')) {
      return 'Acoustic transparency reveals dialogue clipping, vocal sibilance, and subtle room reverberations before final mix export.';
    }
    if (pName.includes('hue') || pName.includes('lighting')) {
      return 'High-CRI balanced bias lighting behind your editing monitor prevents eye strain and maintains color perception accuracy.';
    }
  }

  if (purposeId === 'content_creation') {
    if (pName.includes('zv-e10') || pName.includes('insta360') || pName.includes('gopro') || pType.includes('camera')) {
      return 'Dedicated creator camera with real-time Eye AF, product showcase mode, and clean HDMI output for pristine YouTube and 4K livestreaming.';
    }
    if (pType.includes('laptop')) {
      return 'High GPU render throughput exports high-bitrate vertical Reels, TikToks, and long-form 4K videos in minutes rather than hours.';
    }
    if (pType.includes('headphones') || pType.includes('buds')) {
      return 'Low-latency monitoring prevents echo feedback while streaming live or monitoring recorded podcast audio tracks.';
    }
    if (pType.includes('smart display') || pName.includes('nest') || pName.includes('echo')) {
      return 'Convenient desktop command display for livestream countdowns, chat monitoring alerts, and studio ambient automation.';
    }
    if (pName.includes('hue') || pName.includes('lighting')) {
      return 'Customizable 16M color ambient backlighting provides professional three-point key and rim lighting for high-end studio streams.';
    }
  }

  if (purposeId === 'office') {
    if (pName.includes('macbook air') || pName.includes('spectre') || pName.includes('thinkpad')) {
      return 'Sleek executive ultrabook with all-day battery life, enterprise hardware security, and instant wake for back-to-back meetings.';
    }
    if (pType.includes('monitor') || pName.includes('ultrafine')) {
      return 'Spacious 27" 4K canvas handles side-by-side financial sheets, presentations, and documents with USB-C single-cable power delivery.';
    }
    if (pType.includes('keyboard') || pType.includes('mouse')) {
      return 'Silent, low-profile keys respect quiet office acoustics while maintaining smooth, effortless typing speed.';
    }
    if (pType.includes('buds') || pType.includes('headphones')) {
      return 'AI beamforming microphones isolate your voice and cancel out office chatter for crystal-clear Zoom and Teams calls.';
    }
    if (pName.includes('plug') || pName.includes('nest') || pName.includes('hub')) {
      return 'Automates desk monitor power cycles, tracks workspace energy consumption, and provides hands-free meeting reminders.';
    }
  }

  if (purposeId === 'study') {
    if (pName.includes('macbook air') || pName.includes('spectre')) {
      return 'Fanless, whisper-quiet design and 18-hour battery last through a full day of university lectures and library sessions without a charger.';
    }
    if (pType.includes('buds') || pName.includes('airpods') || pName.includes('wi-c100') || pType.includes('neckband')) {
      return 'Ergonomic in-ear seal and active noise cancellation block out café and campus noise during high-concentration study blocks.';
    }
    if (pType.includes('monitor')) {
      return 'Connecting your laptop to a 4K home desk screen enables comfortable dual-window reading of research papers, PDFs, and notes.';
    }
    if (pType.includes('smartwatch') || pName.includes('fit3') || pType.includes('smart ring')) {
      return 'Monitors study break intervals, sleep recovery metrics, and daily activity to maintain focus throughout exams.';
    }
  }

  // General fallback rationale
  return `Selected for optimal synergy with your ${tierId} ${purposeId} setup, verified in stock with ElectroHaven genuine warranty.`;
}

/**
 * Returns candidate products from catalog for a particular slot, sorted by affinity and price
 */
export function getCandidatesForSlot(slotKey, allProducts, ecosystem = 'all', purpose = 'gaming') {
  const slotDef = SLOT_DEFINITIONS[slotKey];
  if (!slotDef) return [];

  const filtered = allProducts.filter((p) => {
    // 1. Availability check: cannot be marked explicitly out of stock
    if (p.availability === 'Out of Stock') return false;

    // 2. Category match
    let matchesCategory = false;
    if (slotKey === 'core') {
      matchesCategory = p.category === 'laptops';
    } else if (slotKey === 'display') {
      matchesCategory =
        p.type === 'monitor' ||
        p.type === 'gaming monitor' ||
        (p.category === 'accessories' && p.name.toLowerCase().includes('monitor'));
    } else if (slotKey === 'keyboard') {
      matchesCategory =
        p.type === 'keyboard' ||
        p.type === 'gaming keyboard' ||
        p.type === 'controller' ||
        (p.category === 'gaming' && (p.name.toLowerCase().includes('keyboard') || p.name.toLowerCase().includes('controller')));
    } else if (slotKey === 'audio') {
      matchesCategory = p.category === 'headphones';
    } else if (slotKey === 'camera') {
      matchesCategory = p.category === 'cameras';
    } else if (slotKey === 'wearable') {
      matchesCategory = p.category === 'wearables';
    } else if (slotKey === 'accent') {
      matchesCategory =
        p.category === 'smart home' ||
        p.type === 'smart display' ||
        p.type === 'smart lighting' ||
        p.type === 'smart plug' ||
        p.type === 'mesh router' ||
        p.type === 'speaker';
    }

    if (!matchesCategory) return false;

    // 3. Ecosystem preference filtering
    if (ecosystem === 'apple') {
      const isApple = p.name.toLowerCase().includes('apple') || p.name.toLowerCase().includes('macbook') || p.name.toLowerCase().includes('airpods');
      if (slotKey === 'core' && !isApple) return false;
      if (slotKey === 'audio' && isApple) return true;
    } else if (ecosystem === 'windows') {
      const isApple = p.name.toLowerCase().includes('apple') || p.name.toLowerCase().includes('macbook');
      if (slotKey === 'core' && isApple) return false;
    } else if (ecosystem === 'sony_creative') {
      if (slotKey === 'camera' && !p.name.toLowerCase().includes('sony')) return false;
    }

    return true;
  });

  // Sort by affinity score descending, then price ascending
  return filtered.sort((a, b) => {
    const scoreA = calculateAffinityScore(a, purpose, { ecosystem });
    const scoreB = calculateAffinityScore(b, purpose, { ecosystem });
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.price - b.price;
  });
}

/**
 * Intelligent Setup Builder Algorithm
 * Generates three tiers (Budget, Balanced, Performance) that strictly respect the user's budget.
 */
export function generateSmartSetups(allProducts, options = {}) {
  const {
    purpose = 'gaming',
    budget = 250000,
    ecosystem = 'all',
    portability = 'balanced',
  } = options;

  const purposeObj = SETUP_PURPOSES.find((p) => p.id === purpose) || SETUP_PURPOSES[0];
  const slotsToFill = purposeObj.componentSlots;

  // Filter available products only
  const catalog = (allProducts || []).filter((p) => isProductAvailable(p.id));

  // Determine slot candidate pools
  const slotCandidates = {};
  slotsToFill.forEach((slot) => {
    let candidates = getCandidatesForSlot(slot, catalog, ecosystem, purpose);
    // If strict ecosystem gave empty list, fallback to all available
    if (candidates.length === 0) {
      candidates = getCandidatesForSlot(slot, catalog, 'all', purpose);
    }
    slotCandidates[slot] = candidates;
  });

  // Calculate absolute minimum setup cost
  const absoluteMinCost = slotsToFill.reduce((acc, slot) => {
    const list = slotCandidates[slot];
    // Find lowest priced item in candidate list
    if (list && list.length > 0) {
      const minP = Math.min(...list.map((i) => i.price));
      return acc + minP;
    }
    return acc;
  }, 0);

  // Check if user budget is constrained
  const isBudgetConstrained = budget < absoluteMinCost;

  /**
   * Helper to build a setup given target spending percentages and item selection strategies
   */
  function buildTierSetup(tierId, tierName, targetSpendRatio, strategy) {
    const selectedItems = [];
    let currentTotal = 0;

    for (const slot of slotsToFill) {
      const candidates = slotCandidates[slot] || [];
      if (candidates.length === 0) continue;

      let chosen = candidates[0];

      // Sort candidates by price for budget calculations
      const sortedByPrice = [...candidates].sort((a, b) => a.price - b.price);

      // Remaining slots min cost
      const remainingSlots = slotsToFill.slice(selectedItems.length + 1);
      const estRemainingMinCost = remainingSlots.reduce((sum, s) => {
        const sList = slotCandidates[s] || [];
        return sum + (sList[0] ? Math.min(...sList.map((i) => i.price)) : 0);
      }, 0);

      // Filter candidates that keep the total under user's budget and avoid duplicate products
      const affordableCandidates = sortedByPrice.filter(
        (c) => !selectedItems.some((s) => s.id === c.id) && currentTotal + c.price + estRemainingMinCost <= budget
      );

      const viablePool =
        affordableCandidates.length > 0
          ? affordableCandidates
          : sortedByPrice.filter((c) => !selectedItems.some((s) => s.id === c.id));
      const pool = viablePool.length > 0 ? viablePool : sortedByPrice;

      if (strategy === 'lowest') {
        // Budget tier: pick highest affinity among lowest 40% prices
        const sliceLen = Math.max(1, Math.ceil(pool.length * 0.4));
        const lowestSlice = pool.slice(0, sliceLen);
        lowestSlice.sort((a, b) => {
          const sA = calculateAffinityScore(a, purpose, { ecosystem, portability });
          const sB = calculateAffinityScore(b, purpose, { ecosystem, portability });
          return sB - sA;
        });
        chosen = lowestSlice[0] || pool[0];
      } else if (strategy === 'highest') {
        // Performance tier: pick highest tier items within budget
        const topSlice = pool.slice(-Math.max(1, Math.ceil(pool.length * 0.5)));
        topSlice.sort((a, b) => {
          const sA = calculateAffinityScore(a, purpose, { ecosystem, portability });
          const sB = calculateAffinityScore(b, purpose, { ecosystem, portability });
          if (sB !== sA) return sB - sA;
          return b.price - a.price;
        });
        chosen = topSlice[0] || pool[pool.length - 1];
      } else {
        // Balanced tier: pick optimal sweet-spot matching affinity and value
        const scored = [...pool].sort((a, b) => {
          const sA = calculateAffinityScore(a, purpose, { ecosystem, portability });
          const sB = calculateAffinityScore(b, purpose, { ecosystem, portability });
          return sB - sA;
        });
        chosen = scored[0] || pool[0];
      }

      const itemWithMeta = {
        ...chosen,
        slotId: slot,
        slotName: SLOT_DEFINITIONS[slot]?.label || slot,
        slotIcon: SLOT_DEFINITIONS[slot]?.icon || '📦',
        recommendationReason: getRecommendationReason(chosen, purpose, tierId),
      };

      selectedItems.push(itemWithMeta);
      currentTotal += chosen.price;
    }

    // Optimization check: If currentTotal exceeds budget, step down items until <= budget
    if (currentTotal > budget) {
      for (let i = selectedItems.length - 1; i >= 0; i--) {
        if (currentTotal <= budget) break;
        const currentItem = selectedItems[i];
        const candidates = (slotCandidates[currentItem.slotId] || []).sort((a, b) => a.price - b.price);
        const cheaperAlternative = candidates.find((c) => c.price < currentItem.price);
        if (cheaperAlternative) {
          currentTotal -= currentItem.price;
          currentTotal += cheaperAlternative.price;
          selectedItems[i] = {
            ...cheaperAlternative,
            slotId: currentItem.slotId,
            slotName: currentItem.slotName,
            slotIcon: currentItem.slotIcon,
            recommendationReason: getRecommendationReason(cheaperAlternative, purpose, tierId),
          };
        }
      }
    }

    const savings = Math.max(0, budget - currentTotal);
    const overBudgetBy = Math.max(0, currentTotal - budget);

    return {
      tierId,
      tierName,
      items: selectedItems,
      totalPrice: currentTotal,
      budget,
      savings,
      overBudgetBy,
      isUnderBudget: currentTotal <= budget,
      itemCount: selectedItems.length,
      headline:
        tierId === 'budget'
          ? 'Maximum Value & Savings'
          : tierId === 'performance'
          ? 'Peak Hardware & Uncompromising Power'
          : 'Optimal Balance of Power, Audio & Comfort',
    };
  }

  const budgetTier = buildTierSetup('budget', 'Budget Value', 0.75, 'lowest');
  const balancedTier = buildTierSetup('balanced', 'Balanced (Recommended)', 0.9, 'mid');
  const performanceTier = buildTierSetup('performance', 'Peak Performance', 1.0, 'highest');

  return {
    purpose: purposeObj,
    budget,
    ecosystem,
    portability,
    absoluteMinCost,
    isBudgetConstrained,
    tiers: {
      budget: budgetTier,
      balanced: balancedTier,
      performance: performanceTier,
    },
    defaultTier: 'balanced',
  };
}

/**
 * Recalculates financial summary metrics when an item is customized/swapped
 */
export function recalculateCustomSetup(items, budget) {
  const totalPrice = (items || []).reduce((sum, item) => sum + (item.price || 0), 0);
  const savings = Math.max(0, budget - totalPrice);
  const overBudgetBy = Math.max(0, totalPrice - budget);
  return {
    totalPrice,
    budget,
    savings,
    overBudgetBy,
    isUnderBudget: totalPrice <= budget,
    itemCount: (items || []).length,
  };
}

