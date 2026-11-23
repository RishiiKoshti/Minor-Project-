// ElectroHaven AI Smart Setup Builder Verification Suite

import { products } from '../src/data.js';
import {
  SETUP_PURPOSES,
  generateSmartSetups,
  getCandidatesForSlot,
  recalculateCustomSetup,
  getRecommendationReason,
} from '../src/setupBuilderEngine.js';
import { normalizePageName, VALID_PAGES } from '../src/router.js';

console.log('--- STARTING SMART SETUP BUILDER TEST SUITE ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✓ ${message}`);
    passedTests++;
  }
}

// 1. Router & Nav Integration
console.log('\n[1] Testing Router & Navigation Integration:');
assert(VALID_PAGES.includes('Build Setup'), 'VALID_PAGES includes "Build Setup"');
assert(normalizePageName('build-setup') === 'Build Setup', 'normalizePageName("build-setup") returns "Build Setup"');
assert(normalizePageName('setup-builder') === 'Build Setup', 'normalizePageName("setup-builder") returns "Build Setup"');
assert(normalizePageName('builder') === 'Build Setup', 'normalizePageName("builder") returns "Build Setup"');

// 2. Purpose Coverage & Slot Definitions
console.log('\n[2] Testing Setup Purposes:');
const expectedPurposes = ['gaming', 'programming', 'video_editing', 'content_creation', 'office', 'study'];
expectedPurposes.forEach((pid) => {
  const found = SETUP_PURPOSES.find((p) => p.id === pid);
  assert(found !== undefined, `Purpose "${pid}" is registered in SETUP_PURPOSES`);
  assert(found.componentSlots.length >= 4, `Purpose "${pid}" defines at least 4 component slots`);
});

// 3. Setup Generation & Strict Budget Adherence
console.log('\n[3] Testing Setup Generation & Strict Budget Enforcement across Tiers:');
const testBudgets = [200000, 300000, 450000];

expectedPurposes.forEach((purposeId) => {
  testBudgets.forEach((b) => {
    const res = generateSmartSetups(products, { purpose: purposeId, budget: b });
    assert(res.tiers.budget !== undefined, `Budget tier exists for ${purposeId} @ ₹${b}`);
    assert(res.tiers.balanced !== undefined, `Balanced tier exists for ${purposeId} @ ₹${b}`);
    assert(res.tiers.performance !== undefined, `Performance tier exists for ${purposeId} @ ₹${b}`);

    // Verify budget enforcement
    const balanced = res.tiers.balanced;
    assert(balanced.totalPrice <= b, `${purposeId} (Balanced): ₹${balanced.totalPrice} is <= budget ₹${b}`);
    assert(balanced.items.length >= 4, `${purposeId} (Balanced) has ${balanced.items.length} items`);
  });
});

// 4. Recommendation Explanations ("Why this is recommended")
console.log('\n[4] Testing Tailored AI Rationale per Purpose:');
const sampleGamingSetup = generateSmartSetups(products, { purpose: 'gaming', budget: 350000 });
sampleGamingSetup.tiers.balanced.items.forEach((item) => {
  assert(item.recommendationReason && item.recommendationReason.length > 20, `Item "${item.name}" has rationale: "${item.recommendationReason.slice(0, 45)}..."`);
});

// 5. Product Swapping & Recalculation
console.log('\n[5] Testing Product Swapping & Cost Recalculation:');
const initialItems = [...sampleGamingSetup.tiers.balanced.items];
const initialTotal = initialItems.reduce((sum, i) => sum + i.price, 0);

// Get alternative displays
const altDisplays = getCandidatesForSlot('display', products, 'all', 'gaming');
assert(altDisplays.length > 0, 'Found alternative displays');

// Swap in a different display
const newDisplay = altDisplays.find((d) => d.id !== initialItems[1].id) || altDisplays[0];
const swappedItems = initialItems.map((item, idx) => (idx === 1 ? { ...newDisplay, slotId: 'display' } : item));
const recalc = recalculateCustomSetup(swappedItems, 350000);

const expectedNewTotal = initialTotal - initialItems[1].price + newDisplay.price;
assert(recalc.totalPrice === expectedNewTotal, `Swapped total ₹${recalc.totalPrice} matches expected ₹${expectedNewTotal}`);
assert(recalc.isUnderBudget === (recalc.totalPrice <= 350000), `isUnderBudget flag correctly reflects: ${recalc.isUnderBudget}`);

// 6. Ecosystem & Portability Filters
console.log('\n[6] Testing Ecosystem & Portability Filters:');
const appleSetup = generateSmartSetups(products, { purpose: 'programming', budget: 350000, ecosystem: 'apple' });
const appleCore = appleSetup.tiers.balanced.items.find((i) => i.slotId === 'core');
assert(appleCore && appleCore.name.toLowerCase().includes('macbook'), `Apple ecosystem selects MacBook: "${appleCore?.name}"`);

const pcSetup = generateSmartSetups(products, { purpose: 'programming', budget: 350000, ecosystem: 'windows' });
const pcCore = pcSetup.tiers.balanced.items.find((i) => i.slotId === 'core');
assert(pcCore && !pcCore.name.toLowerCase().includes('apple'), `Windows ecosystem selects non-Apple laptop: "${pcCore?.name}"`);

console.log(`\n=== ALL ${passedTests}/${totalTests} TESTS PASSED PERFECTLY ===\n`);
