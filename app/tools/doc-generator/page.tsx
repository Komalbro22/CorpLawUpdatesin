import { Metadata } from 'next';
import Link from 'next/link';
import { MVP_DOCUMENTS_META } from '@/lib/doc-generator/ai-engine';
import { Sparkles, FileText, Scale, ShieldCheck, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Corporate Document Generator | CorpLawUpdates.in',
  description:
    'Parametric AI Document Generator for Indian Company Secretaries & CAs. Instantly generate perfectly formatted MS Word (.docx) files for Board Meetings, Resolutions, and Form DIR-2 under Companies Act 2013.',
};

export default function AIDocGeneratorIndexPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>AI-Driven Parametric Legal Generator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
            World-Class Indian Corporate Document Studio
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed">
            Generate legally accurate, perfectly formatted Microsoft Word (<code className="text-blue-300">.docx</code>) compliance documents for Indian Companies. Powered by AI trained on the Companies Act, 2013 & Secretarial Standards (SS-1/SS-2).
          </p>
        </div>

        {/* Core Philosophy Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-3 text-blue-400">
              <Scale className="w-6 h-6" />
              <h3 className="font-bold text-slate-100 text-lg">Zero Hallucinations</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI applies strict statutory rules and vetted clause structures to guarantee zero invented legalese.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-slate-100 text-lg">SS-1 & SS-2 Compliant</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Built-in secretarial citations, notice timelines, and compliance reminders for ICSI guidelines.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-3 text-purple-400">
              <FileText className="w-6 h-6" />
              <h3 className="font-bold text-slate-100 text-lg">Native DOCX Export</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Produces Bookman Old Style 12pt styled Word documents with 1-inch margins and signature grids.
            </p>
          </div>
        </div>

        {/* Document Selection Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              Select Document Generator (MVP Studio)
            </h2>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-3 py-1 rounded-full border border-slate-700">
              3 Models Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MVP_DOCUMENTS_META.map(doc => (
              <div
                key={doc.id}
                className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/50">
                      {doc.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">~{doc.estimatedMinutes} min interview</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {doc.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">{doc.shortDescription}</p>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400 font-mono block truncate">
                      📜 {doc.actReference}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/tools/doc-generator/${doc.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 group-hover:shadow-blue-500/40"
                  >
                    <span>Launch Generator</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Compliance Footer Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Regularly Updated to MCA & ICSI Notifications</h4>
              <p className="text-xs text-slate-400">
                All templates comply with Rule 8 of Directors Rules 2014, Section 161(1), and Section 173(3) of Companies Act.
              </p>
            </div>
          </div>
          <Link
            href="/documents"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 whitespace-nowrap"
          >
            Browse All Template Libraries →
          </Link>
        </div>
      </div>
    </div>
  );
}
