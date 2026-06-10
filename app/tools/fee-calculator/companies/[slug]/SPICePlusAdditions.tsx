import React from 'react'

export default function SPICePlusAdditions() {
  return (
    <div className="max-w-5xl mx-auto px-4 mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 5A: Services Checklist */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Services Included in SPICe+</h2>
          <ul className="grid grid-cols-1 gap-4">
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Company Name Reservation (RUN/Part A)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Certificate of Incorporation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Director Identification Number (DIN) — up to 3 directors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">PAN & TAN Allotment (automatic)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">EPFO Registration</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">ESIC Registration</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Professional Tax Registration (select states)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Opening of Bank Account (via AGILE-PRO-S)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">⚙️</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">GST Registration (optional, via AGILE-PRO-S)</span>
            </li>
          </ul>
        </div>

        {/* 5B: Stamp Duty Table */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">State-Wise Stamp Duty on SPICe+ (MOA & AOA)</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">State</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">MOA (₹)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">AOA (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="px-4 py-3 font-medium">Maharashtra</td><td className="px-4 py-3 text-right">1,000</td><td className="px-4 py-3 text-right">500</td></tr>
                <tr><td className="px-4 py-3 font-medium">Delhi</td><td className="px-4 py-3 text-right">200</td><td className="px-4 py-3 text-right">300</td></tr>
                <tr><td className="px-4 py-3 font-medium">Karnataka</td><td className="px-4 py-3 text-right">1,000</td><td className="px-4 py-3 text-right">1,000</td></tr>
                <tr><td className="px-4 py-3 font-medium">Tamil Nadu</td><td className="px-4 py-3 text-right">1,000</td><td className="px-4 py-3 text-right">300</td></tr>
                <tr><td className="px-4 py-3 font-medium">Gujarat</td><td className="px-4 py-3 text-right">100</td><td className="px-4 py-3 text-right">1,000</td></tr>
                <tr><td className="px-4 py-3 font-medium">Rajasthan</td><td className="px-4 py-3 text-right">500</td><td className="px-4 py-3 text-right">0.5%</td></tr>
                <tr><td className="px-4 py-3 font-medium">West Bengal</td><td className="px-4 py-3 text-right">300</td><td className="px-4 py-3 text-right">300</td></tr>
                <tr><td className="px-4 py-3 font-medium">Uttar Pradesh</td><td className="px-4 py-3 text-right">2,000</td><td className="px-4 py-3 text-right">1,000</td></tr>
                <tr><td className="px-4 py-3 font-medium">Telangana</td><td className="px-4 py-3 text-right">500</td><td className="px-4 py-3 text-right">500</td></tr>
                <tr><td className="px-4 py-3 font-medium">Kerala</td><td className="px-4 py-3 text-right">5,000</td><td className="px-4 py-3 text-right">1,000</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            * Note: Stamp duty is a state subject. Rates change based on authorized capital slabs. Verify on your state's Stamp Act before filing. The above are estimated base rates.
          </p>
        </div>

      </div>
    </div>
  )
}
