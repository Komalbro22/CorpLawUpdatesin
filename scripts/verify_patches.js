const data = require('../data/penalty-provisions.json');

const s140_3 = data.find(d => d.section === '140(3)');
const s182_4 = data.find(d => d.section === '182(4)' && d.imprisonment.applicable === true);
const s378zm_2 = data.find(d => d.section === '378ZM(2)');
const s147_2 = data.find(d => d.section === '147(2)');

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

const merged_182_4 = JSON.parse(JSON.stringify(s182_4));
deepMerge(merged_182_4, {
  dynamic_variable: {
    custom_amount_label: "Amount Contributed (₹)",
    custom_amount_type: "currency",
    custom_operator: "fixed",
    company_custom_multiplier: 5,
    officer_custom_multiplier: 5
  }
});

const merged_378zm_2 = JSON.parse(JSON.stringify(s378zm_2));
deepMerge(merged_378zm_2, {
  dynamic_variable: {
    custom_amount_label: "Turnover (₹)",
    custom_amount_type: "currency",
    custom_operator: "fixed",
    officer_custom_multiplier: 0.05
  }
});

const merged_147_2 = JSON.parse(JSON.stringify(s147_2));
deepMerge(merged_147_2, {
  custom_role: "Auditor",
  dynamic_variable: {
    custom_amount_label: "Auditor Remuneration (₹)",
    custom_amount_type: "currency",
    custom_operator: "lower",
    officer_custom_multiplier: 8,
    custom_absolute_floor: 50000,
    custom_absolute_ceiling: 2500000
  }
});

console.log("=== MERGED ROWS ===");
console.log(JSON.stringify({ 
  "140(3)": merged_140_3, 
  "182(4)": merged_182_4, 
  "378ZM(2)": merged_378zm_2, 
  "147(2)": merged_147_2 
}, null, 2));


// Section 447 Test Cases
function compute447(amount, isPublicInterest) {
  const threshold = 1000000; // Simplified for test: 10 Lakhs or 1% turnover (assuming 10L is lower here)
  if (amount >= threshold) {
    return {
      tier: "Tier 1 (≥ ₹10 Lakhs or 1% Turnover)",
      imprisonment: isPublicInterest ? "Minimum 3 years, max 10 years" : "Minimum 6 months, max 10 years",
      fine: `Minimum ₹${amount.toLocaleString('en-IN')}, max ₹${(amount * 3).toLocaleString('en-IN')}`
    };
  } else {
    if (isPublicInterest) {
        return {
            tier: "Tier 1 (Fallback due to Public Interest)",
            imprisonment: "Minimum 3 years, max 10 years",
            fine: `Minimum ₹${amount.toLocaleString('en-IN')}, max ₹${(amount * 3).toLocaleString('en-IN')}`
        };
    }
    return {
      tier: "Tier 2 (< ₹10 Lakhs and NO Public Interest)",
      imprisonment: "Up to 5 years (optional/or)",
      fine: "Up to ₹50,00,000 (optional/or)"
    };
  }
}

console.log("\\n=== SECTION 447 TEST CASES ===");
console.log("Test 1: ₹5 lakh fraud, NO public interest:", compute447(500000, false));
console.log("Test 2: ₹15 lakh fraud, WITH public interest:", compute447(1500000, true));
