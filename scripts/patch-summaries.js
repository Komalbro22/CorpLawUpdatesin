const fs = require('fs');

const summaries = {
  'sec-92-5': `Under **Section 92(5)** of the Companies Act, 2013, if a company fails to file its annual return (Form MGT-7/MGT-7A) within the specified timeframe (typically within 60 days from the AGM), stringent penalties are levied.

### Key Penalties
* **Initial Penalty**: A flat penalty of **₹10,000** is imposed on both the company and every officer in default.
* **Daily Penalty**: Continued non-compliance attracts an additional penalty of **₹100 per day** during which the failure continues.
* **Maximum Cap**: The penalty is strictly capped at **₹2,00,000 for the company** and **₹50,000 for each officer in default**.

### Additional Consequences
* **Directors' Disqualification**: Continuous failure to file annual returns for three consecutive financial years leads to the disqualification of directors under Section 164(2).
* **Strike Off**: The Registrar of Companies (ROC) may initiate proceedings to strike off the company's name from the register under Section 248 if returns are not filed for two consecutive years.`,

  'sec-137-3': `Under **Section 137(3)** of the Companies Act, 2013, failure to file the financial statements (AOC-4) with the Registrar within 30 days of the AGM attracts severe penalties for the company and its key managerial personnel.

### Key Penalties
* **Initial Penalty**: A flat penalty of **₹10,000** is levied on both the company and every officer in default.
* **Continuing Default**: A further penalty of **₹100 for each day** is applied while the default continues.
* **Statutory Caps**: 
  * For the **Company**: Capped at **₹2,00,000**.
  * For the **Officers**: Capped at **₹50,000** per officer.

*Note: As per Section 446B, startups, OPCs, and small companies may be eligible for a 50% reduction on the above penalties.*`,

  'sec-447-1': `**Section 447** is the primary penal provision for Fraud under the Companies Act, 2013. It is a severe provision that overrides other sections and carries strict non-compoundable consequences.

### Criteria for Severe Fraud
If the fraud involves an amount of **at least ₹10 Lakhs** OR **1% of the turnover of the company**, whichever is lower, the following applies:

* **Imprisonment**: Minimum of **6 months**, extending up to **10 years**. 
* **Fine**: An amount not less than the amount involved in the fraud, extending up to **3 times** the amount involved.
* **Public Interest Clause**: If the fraud involves "public interest", the minimum imprisonment term is elevated to **3 years**.

*Because of the severity and the inclusion of imprisonment, Section 447 offenses cannot be adjudicated via the standard MCA penalty mechanism and must be tried in Special Courts.*`,

  'sec-165-6': `**Section 165(6)** penalizes individuals who accept directorships beyond the maximum permissible limit. Section 165(1) restricts an individual from being a director in more than **20 companies** simultaneously (out of which a maximum of 10 can be public companies).

### Penalty Structure
* **Per Day Penalty**: If a person accepts an appointment as a director in contravention of this limit, they are liable to a penalty of **₹2,000 for each day** the violation continues.
* **Maximum Cap**: The penalty is subject to a maximum cap of **₹2,00,000**.

*This penalty is levied directly on the individual director (officer), not on the company. The defaulting director is expected to pay this from personal funds.*`,

  'sec-188-5': `**Section 188(5)** deals with the contravention of provisions relating to Related Party Transactions (RPT). If any director or employee enters into a contract or arrangement without obtaining the necessary consent of the Board or approval by a resolution in the general meeting, they are heavily penalized.

### Penalties
* **Listed Companies**: Any director or employee who enters into or authorizes the contract is liable to a penalty of **₹25 Lakhs**.
* **Unlisted Companies**: The penalty for the defaulting director or employee is **₹5 Lakhs**.

### Recovery and Disqualification
* The company has the legal right to proceed against the director/employee to recover any loss sustained due to the unapproved transaction.
* Under Section 164(1)(g), a director convicted of an offense related to related party transactions under Section 188 at any time during the last preceding five years is disqualified from being appointed as a director.`,

  'sec-135-7': `**Section 135(7)** enforces the Corporate Social Responsibility (CSR) obligations of qualifying companies. Companies meeting the threshold criteria are required to spend 2% of their average net profits on CSR. Failure to transfer unspent CSR funds to the specified funds or the Unspent CSR Account attracts heavy monetary penalties.

### Penal provisions
* **Company Liability**: The company is liable for a penalty of **twice the unspent CSR amount** required to be transferred, OR **₹1 Crore**, whichever is LESS.
* **Officer Liability**: Every officer of the company who is in default is liable to a penalty of **one-tenth of the unspent CSR amount**, OR **₹2 Lakhs**, whichever is LESS.

*Unlike the pre-2020 regime, the current penalty is entirely civil in nature (no imprisonment), but the maximum exposure of ₹1 Crore makes it one of the heaviest monetary penalties under the Act.*`
};

const filePath = './data/penalty-provisions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updated = 0;
data.forEach(item => {
  if (summaries[item.id]) {
    item.detailed_summary = summaries[item.id];
    updated++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Successfully updated ' + updated + ' provisions with detailed_summary');
