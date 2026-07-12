const fs = require('fs');

const formatINRCurrency = (amount) => {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const personalSectionsPrefixes = [
  '147', // Auditors
  '159', // DIN
  '165', // Max directorships
  '166', // Director duties
  '167', // Vacation of office
  '184', // Disclosure of interest
  '189', // Register of contracts
  '191', // Loss of office
  '243', // Tribunal order contravention by individual
  '247', // Valuers
  '447'  // Fraud - handled specially anyway
];

const buildSummary = (item) => {
  let lowerSummary = item.plain_summary.toLowerCase();
  let firstChar = lowerSummary.charAt(0).toLowerCase();
  let rest = lowerSummary.slice(1);
  let summaryText = firstChar + rest;
  if (!summaryText.endsWith('.')) summaryText += '.';

  let md = `Under **Section ${item.section}** of the Companies Act, 2013, ${summaryText}\n\n`;
  
  if (item.company_liability || item.officer_liability) {
    md += `### Key Penalties\n`;
  }

  if (item.company_liability) {
    md += `* **Company Liability**: `;
    if (item.company_liability.base_amount_max && item.company_liability.base_amount_max !== item.company_liability.base_amount_min) {
       md += `Up to **${formatINRCurrency(item.company_liability.base_amount_max)}**`;
    } else if (item.company_liability.base_amount_min) {
       md += `Base penalty of **${formatINRCurrency(item.company_liability.base_amount_min)}**`;
    } else if (item.dynamic_variable) {
       md += `Variable penalty based on ${item.dynamic_variable.custom_amount_label}`;
    } else {
       md += `Penalty applicable`;
    }
    
    if (item.company_liability.per_day_continuing) {
       md += ` plus **${formatINRCurrency(item.company_liability.per_day_continuing)} per day** for continuing default`;
    }
    if (item.company_liability.max_cap) {
       md += `, capped at **${formatINRCurrency(item.company_liability.max_cap)}**`;
    }
    md += `.\n`;
  }

  if (item.officer_liability) {
    md += `* **Officer in Default**: `;
    if (item.officer_liability.base_amount_max && item.officer_liability.base_amount_max !== item.officer_liability.base_amount_min) {
       md += `Up to **${formatINRCurrency(item.officer_liability.base_amount_max)}**`;
    } else if (item.officer_liability.base_amount_min) {
       md += `Base penalty of **${formatINRCurrency(item.officer_liability.base_amount_min)}**`;
    } else if (item.officer_liability.base_amount_max) {
       md += `Penalty of **${formatINRCurrency(item.officer_liability.base_amount_max)}**`;
    } else if (item.dynamic_variable) {
       md += `Variable penalty based on ${item.dynamic_variable.custom_amount_label}`;
    } else {
       md += `Penalty applicable`;
    }
    
    if (item.officer_liability.per_day_continuing) {
       md += ` plus **${formatINRCurrency(item.officer_liability.per_day_continuing)} per day** for continuing default`;
    }
    if (item.officer_liability.max_cap) {
       md += `, capped at **${formatINRCurrency(item.officer_liability.max_cap)}**`;
    }
    md += `.\n`;
  }

  if (item.imprisonment && item.imprisonment.applicable) {
    md += `\n### Imprisonment\n`;
    md += `* ⚠ **Warning**: This provision also carries a risk of imprisonment`;
    if (item.imprisonment.max_years) {
       md += ` for up to **${item.imprisonment.max_years} years**`;
    }
    if (item.imprisonment.applies_to) {
       md += ` for ${item.imprisonment.applies_to}`;
    }
    md += `.\n`;
  }

  return md;
};

const run = () => {
  const filePath = './data/penalty-provisions.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let updatedSummaries = 0;
  let false446b = 0;

  data.forEach(item => {
    // 1. Generate detailed_summary if missing
    if (!item.detailed_summary) {
      item.detailed_summary = buildSummary(item);
      updatedSummaries++;
    }

    // 2. Set eligible_for_446b
    const isPersonal = personalSectionsPrefixes.some(prefix => item.section.startsWith(prefix));
    if (isPersonal) {
      item.eligible_for_446b = false;
      false446b++;
    } else {
      if (item.eligible_for_446b === undefined) {
        item.eligible_for_446b = true;
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Successfully generated ${updatedSummaries} missing detailed summaries.`);
  console.log(`Flagged ${false446b} provisions as ineligible for 446B relief.`);
};

run();
