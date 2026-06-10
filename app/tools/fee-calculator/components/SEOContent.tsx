import React from 'react'

export default function SEOContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        Understanding MCA Filing Fees and ROC Penalties in India
      </h2>

      <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
        Maintaining active statutory compliance with the Ministry of Corporate Affairs (MCA) is critical for every registered entity in India, whether it's a Private Limited Company, a One Person Company (OPC), or a Limited Liability Partnership (LLP). Non-compliance or delayed filing of mandatory forms like <strong>AOC-4</strong> (Financial Statements), <strong>MGT-7</strong> (Annual Return), or <strong>DIR-3 KYC</strong> attracts severe late filing penalties and additional fees.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 not-prose">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl mb-4">
            🏢
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Company Filing Fees</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            For companies, MCA normal fees range from ₹200 to ₹600 based on authorized share capital. OPCs and Small Companies enjoy a concessional fee structure starting at just ₹50.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center text-xl mb-4">
            ⏰
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Annual Returns Penalty</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Unlike general forms with multiplier caps (up to 12x), annual returns (AOC-4 & MGT-7) have a strict, uncapped penalty of <strong>₹100 per day</strong> for every day of delay.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center text-xl mb-4">
            🤝
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">LLP Late Fees</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            LLPs face arguably the strictest penalty regime. Almost all LLP forms (Form 8, Form 11, Form 3) attract a flat ₹100 per day additional fee for delayed filing without any upper limit.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-navy dark:text-white mt-8 mb-4">
        Types of Fees Charged by MCA
      </h3>
      
      <ul className="list-disc pl-6 space-y-3 text-slate-600 dark:text-slate-300">
        <li><strong>Normal Filing Fee:</strong> Paid when a form is filed on time. The fee is determined based on the Authorized Share Capital of the company.</li>
        <li><strong>Additional Fee (Late Fee):</strong> Levied when a form is filed after the statutory due date. This acts as a penalty to enforce timely compliance.</li>
        <li><strong>Ad Valorem Fee:</strong> Specifically charged for Charge creation forms (CHG-1 and CHG-9) if filed with a delay exceeding 30 days. It is calculated as a percentage of the secured amount.</li>
        <li><strong>Stamp Duty:</strong> Governed by respective state laws, stamp duty is payable on forms like SH-7 (increase in authorized capital), SPICe+ (incorporation), and Form 3 (LLP Agreement).</li>
      </ul>

      <h3 className="text-xl font-bold text-navy dark:text-white mt-10 mb-4">
        MSME Delayed Payment Interest Explained
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        To protect Micro and Small Enterprises (MSMEs), the MSMED Act, 2006 mandates that buyers must clear their dues within 45 days. If delayed, the buyer is liable to pay compound interest with monthly rests at <strong>three times the bank rate (RBI Repo Rate)</strong> notified by the Reserve Bank of India. Furthermore, companies are required to disclose these delayed payments half-yearly via <strong>MSME-1</strong>.
      </p>

    </article>
  )
}
