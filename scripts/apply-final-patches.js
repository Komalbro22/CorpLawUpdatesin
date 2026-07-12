const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/penalty-provisions.json');
let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

// 1. Strip stale caps and dynamic vars from root to start fresh
data = data.map(d => {
  delete d.dynamic_variable;
  delete d.company_custom_multiplier;
  delete d.company_custom_cap;
  delete d.officer_custom_multiplier;
  delete d.officer_custom_cap;
  return d;
});

// 2. Split 147(1) & (2)
// sec-147-1 is currently 147(1) & (2). We'll make it 147(1) only.
const sec147Index = data.findIndex(d => d.id === 'sec-147-1');
if (sec147Index !== -1) {
  data[sec147Index].section = "147(1)";
  
  // Clone to make 147(2) Base Tier
  const sec147_2_base = JSON.parse(JSON.stringify(data[sec147Index]));
  sec147_2_base.id = 'sec-147-2-base';
  sec147_2_base.section = "147(2) [Base Tier]";
  sec147_2_base.company_liability = null;
  sec147_2_base.officer_liability = {
    base_amount_min: 25000,
    base_amount_max: 500000,
    per_day_continuing: null,
    max_cap: null,
    notes: "Auditor fine: min 25000, max 500000 or four times remuneration, whichever is less"
  };
  deepMerge(sec147_2_base, {
    custom_role: "Auditor",
    dynamic_variable: {
      custom_amount_label: "Auditor Remuneration (₹)",
      custom_amount_type: "currency",
      custom_operator: "lower",
      officer_custom_multiplier: 4,
      custom_absolute_floor: 25000,
      custom_absolute_ceiling: 500000
    }
  });
  data.splice(sec147Index + 1, 0, sec147_2_base);
}

// 3. Apply exact structural patches
const patches = {
  "42(10)": {
    custom_role: "Promoters & Directors",
    custom_note: "Note: The statute imposes this penalty on the company, promoters, and directors, but does not explicitly state whether the liability is joint and several. Furthermore, the company carries a separate statutory obligation to refund the monies with interest within 30 days.",
    dynamic_variable: {
      custom_amount_label: "Amount Raised (₹)",
      custom_amount_type: "currency",
      custom_operator: "lower",
      company_custom_multiplier: 1,
      officer_custom_multiplier: 1,
      custom_absolute_ceiling: 20000000 
    }
  },
  "46(5)": {
    dynamic_variable: {
      custom_amount_label: "Face Value of Shares (₹)",
      custom_amount_type: "currency",
      custom_operator: "higher",
      company_floor_multiplier: 5,
      company_ceiling_multiplier: 10,
      custom_absolute_ceiling: 100000000 
    }
  },
  "53(3)": {
    dynamic_variable: {
      custom_amount_label: "Amount Raised (₹)",
      custom_amount_type: "currency",
      custom_operator: "lower",
      company_custom_multiplier: 1,
      officer_custom_multiplier: 1,
      custom_absolute_ceiling: 500000
    }
  },
  "102(5)": {
    dynamic_variable: {
      custom_amount_label: "Benefit Accruing (₹)",
      custom_amount_type: "currency",
      custom_operator: "higher",
      officer_custom_multiplier: 5,
      custom_absolute_floor: 50000
    }
  },
  "140(3)": {
    custom_role: "Auditor",
    dynamic_variable: {
      custom_amount_label: "Auditor Remuneration (₹)",
      custom_amount_type: "currency",
      custom_operator: "lower",
      officer_custom_multiplier: 1,
      custom_absolute_ceiling: 50000
    }
  },
  "147(2)": { // Fraud tier
    custom_role: "Auditor",
    dynamic_variable: {
      custom_amount_label: "Auditor Remuneration (₹)",
      custom_amount_type: "currency",
      custom_operator: "lower",
      officer_custom_multiplier: 8,
      custom_absolute_floor: 50000,
      custom_absolute_ceiling: 2500000
    }
  },
  "182(4)": {
    dynamic_variable: {
      custom_amount_label: "Amount Contributed (₹)",
      custom_amount_type: "currency",
      custom_operator: "fixed",
      company_custom_multiplier: 5,
      officer_custom_multiplier: 5
    }
  },
  "378ZM(2)": {
    dynamic_variable: {
      custom_amount_label: "Turnover (₹)",
      custom_amount_type: "currency",
      custom_operator: "fixed",
      officer_custom_multiplier: 0.05
    }
  },
  "378ZS(6)": {
    dynamic_variable: {
      custom_amount_label: "Number of Copies",
      custom_amount_type: "count",
      custom_operator: "fixed",
      company_custom_multiplier: 100,
      officer_custom_multiplier: 100 
    }
  },
  "447": { // Just to flag for special UI, but actually we will handle 447 UI differently. 
    // We'll set a custom flag so UI knows it's 447
    is_sec_447_special: true
  },
  "441(5)": {
    computed_from_related_section: true
  },
  "451": {
    computed_from_related_section: true
  }
};

data.forEach(d => {
  if (patches[d.section]) {
    deepMerge(d, patches[d.section]);
  }
});

// For 182(4) there are two rows. `forEach` will apply it to both!

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log("Successfully patched data and stripped stale caps!");
