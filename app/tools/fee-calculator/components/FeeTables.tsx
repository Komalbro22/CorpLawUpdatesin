import React from 'react'

export default function FeeTables() {
  return (
    <div className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6">
        MCA Filing Fees Reference (2026-27)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Normal Fee Table */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">📊</span>
            Normal Base Fees (Companies)
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Authorized Capital (₹)</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Normal Fee</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">OPC / Small</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">Up to 1 Lakh</td>
                  <td className="px-4 py-3 font-medium">₹ 200</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹ 50</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">1 Lakh to 5 Lakhs</td>
                  <td className="px-4 py-3 font-medium">₹ 300</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹ 100</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">5 Lakhs to 25 Lakhs</td>
                  <td className="px-4 py-3 font-medium">₹ 400</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹ 150</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">25 Lakhs to 1 Crore</td>
                  <td className="px-4 py-3 font-medium">₹ 500</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹ 200</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">More than 1 Crore</td>
                  <td className="px-4 py-3 font-medium">₹ 600</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹ 200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Late Fee Table */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">⚠️</span>
            Late Fee Multipliers (General Forms)
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Period of Delay</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Standard Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">Up to 15 days</td>
                  <td className="px-4 py-3 font-medium text-amber-600 dark:text-amber-400">1x of Normal Fee</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">16 to 30 days</td>
                  <td className="px-4 py-3 font-medium text-amber-600 dark:text-amber-400">2x of Normal Fee</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">31 to 60 days</td>
                  <td className="px-4 py-3 font-medium text-red-500">4x of Normal Fee</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">61 to 90 days</td>
                  <td className="px-4 py-3 font-medium text-red-600">6x of Normal Fee</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">91 to 180 days</td>
                  <td className="px-4 py-3 font-medium text-red-700 dark:text-red-500">10x of Normal Fee</td>
                </tr>
                <tr className="bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20">
                  <td className="px-4 py-3 font-semibold text-red-800 dark:text-red-400">More than 180 days</td>
                  <td className="px-4 py-3 font-black text-red-800 dark:text-red-400">12x of Normal Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
