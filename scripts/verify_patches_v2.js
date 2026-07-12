const data = require('../data/penalty-provisions.json');

const s140_3 = data.find(d => d.section === '140(3)');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

const merged_140_3 = JSON.parse(JSON.stringify(s140_3));
deepMerge(merged_140_3, {
  custom_role: "Auditor",
  dynamic_variable: {
    custom_amount_label: "Auditor Remuneration (₹)",
    custom_amount_type: "currency",
    custom_operator: "lower",
    officer_custom_multiplier: 1,
    custom_absolute_ceiling: 50000
  }
});

console.log("=== UNABRIDGED SECTION 140(3) OBJECT ===");
console.log(JSON.stringify(merged_140_3, null, 2));


// Section 447 Test Cases
function compute447(fraudAmount, turnover, isPublicInterest) {
  const onePercentTurnover = turnover * 0.01;
  const threshold = Math.min(1000000, onePercentTurnover); 

  if (fraudAmount >= threshold) {
    return {
      tier: "Tier 1 (≥ min(₹10 Lakhs, 1% Turnover))",
      threshold_computed: `₹${threshold.toLocaleString('en-IN')}`,
      imprisonment: isPublicInterest ? "Minimum 3 years, max 10 years" : "Minimum 6 months, max 10 years",
      fine: `Minimum ₹${fraudAmount.toLocaleString('en-IN')}, max ₹${(fraudAmount * 3).toLocaleString('en-IN')}`
    };
  } else {
    if (isPublicInterest) {
        return {
            tier: "Tier 1 (Fallback due to Public Interest)",
            threshold_computed: `₹${threshold.toLocaleString('en-IN')}`,
            imprisonment: "Minimum 3 years, max 10 years",
            fine: `Minimum ₹${fraudAmount.toLocaleString('en-IN')}, max ₹${(fraudAmount * 3).toLocaleString('en-IN')}`
        };
    }
    return {
      tier: "Tier 2 (< min(₹10 Lakhs, 1% Turnover) and NO Public Interest)",
      threshold_computed: `₹${threshold.toLocaleString('en-IN')}`,
      imprisonment: "Up to 5 years (optional/or)",
      fine: "Up to ₹50,00,000 (optional/or)"
    };
  }
}

console.log("\\n=== SECTION 447 TEST CASES (WITH TURNOVER) ===");
console.log("Test 1 (Original): ₹5 lakh fraud, ₹20 Crore turnover, NO public int:", compute447(500000, 200000000, false));
console.log("Test 2: ₹5 lakh fraud, ₹3 Crore turnover, NO public int:", compute447(500000, 30000000, false));
