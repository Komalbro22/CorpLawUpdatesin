'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MVP_DOCUMENTS_META } from '@/lib/doc-generator/ai-engine';
import {
  DocumentGenerationPayload,
  AIDocumentModel,
  MVPDocumentType,
} from '@/lib/doc-generator/types';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Download,
  Building2,
  UserCheck,
  Calendar,
  ShieldCheck,
  Loader2,
  FileCheck,
  Scale,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

export default function DocumentGeneratorWizardPage() {
  const params = useParams();
  const docType = (params?.docType as MVPDocumentType) || 'board_resolution_additional_director';

  const docMeta = MVP_DOCUMENTS_META.find(d => d.id === docType) || MVP_DOCUMENTS_META[1];

  // Multi-step form state (Step 1: Company, Step 2: Specific Params, Step 3: Preview & Download)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payload Form State
  const [companyName, setCompanyName] = useState('ABC PRIVATE LIMITED');
  const [cin, setCin] = useState('U72900MH2021PTC123456');
  const [registeredOffice, setRegisteredOffice] = useState('123 Business Towers, BKC, Mumbai, MH - 400051');

  // Director details (For Resolution & DIR-2)
  const [directorName, setDirectorName] = useState('Mr. Rajesh Kumar');
  const [din, setDin] = useState('01234567');
  const [directorAddress, setDirectorAddress] = useState('Flat 402, Green Acres, Powai, Mumbai - 400076');
  const [designationCategory, setDesignationCategory] = useState<'Non-Executive Director' | 'Executive Director' | 'Independent Director' | 'Additional Director'>('Non-Executive Director');

  // Meeting details (For Notice & Resolution)
  const [meetingDate, setMeetingDate] = useState('2026-08-20');
  const [meetingTime, setMeetingTime] = useState('11:00 AM');
  const [meetingVenue, setMeetingVenue] = useState('Registered Office of the Company');
  const [serialNumber, setSerialNumber] = useState('03/2026-27');

  // Additional Params
  const [effectiveDate, setEffectiveDate] = useState('2026-08-20');
  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState('Ms. Priya Sharma');
  const [authorizedSignatoryDesignation, setAuthorizedSignatoryDesignation] = useState('Director');
  const [isRegularizationContemplated, setIsRegularizationContemplated] = useState(true);
  const [agendaTopics, setAgendaTopics] = useState<string[]>([
    'To grant leave of absence to Directors, if any.',
    'To read, confirm and sign the Minutes of the previous Board Meeting.',
    'To consider and approve the appointment of Mr. Rajesh Kumar as an Additional Director.',
    'To consider opening of new Corporate Bank Account with HDFC Bank.',
  ]);
  const [newAgendaInput, setNewAgendaInput] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Generated Document Model State
  const [generatedModel, setGeneratedModel] = useState<AIDocumentModel | null>(null);

  // Agenda list handlers
  const handleAddAgenda = () => {
    if (!newAgendaInput.trim()) return;
    setAgendaTopics([...agendaTopics, newAgendaInput.trim()]);
    setNewAgendaInput('');
  };

  const handleRemoveAgenda = (index: number) => {
    setAgendaTopics(agendaTopics.filter((_, i) => i !== index));
  };

  // Trigger AI Engine Generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    const payload: DocumentGenerationPayload = {
      docType,
      company: {
        companyName: companyName.trim(),
        cin: cin.trim(),
        registeredOffice: registeredOffice.trim(),
      },
      director: {
        directorName: directorName.trim(),
        din: din.trim(),
        address: directorAddress.trim(),
        designationCategory,
      },
      meeting: {
        meetingDate,
        meetingTime,
        meetingVenue,
        serialNumber,
      },
      additional: {
        effectiveDate,
        authorizedSignatoryName,
        authorizedSignatoryDesignation,
        isRegularizationContemplated,
        agendaTopics,
        customInstructions,
      },
    };

    try {
      const res = await fetch('/api/doc-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate document with AI.');
      }

      setGeneratedModel(data.model);
      setCurrentStep(3); // Move to Preview Step
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMsg(err.message || 'An error occurred during AI generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export DOCX File
  const handleDownloadDocx = async () => {
    if (!generatedModel) return;
    setIsExporting(true);

    try {
      const res = await fetch('/api/doc-generator/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: generatedModel }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = generatedModel.documentTitle
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 40);
      a.download = `${safeTitle || 'Document'}_CorpLawUpdates.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Export Error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Plain Text
  const handleCopyText = () => {
    if (!generatedModel) return;
    let fullText = `${generatedModel.documentTitle}\n${generatedModel.subTitle || ''}\n\n`;
    fullText += `Company: ${generatedModel.companyDetails.name} (CIN: ${generatedModel.companyDetails.cin})\n\n`;
    if (generatedModel.introductoryText) fullText += `${generatedModel.introductoryText}\n\n`;

    if (generatedModel.agendas) {
      fullText += `AGENDAS:\n`;
      generatedModel.agendas.forEach(a => {
        fullText += `${a.itemNumber}. ${a.title}: ${a.description}\n`;
      });
      fullText += `\n`;
    }

    generatedModel.sections.forEach(s => {
      if (s.heading) fullText += `${s.heading}\n`;
      s.clauses.forEach(c => {
        fullText += `${c}\n\n`;
      });
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Topbar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/tools/doc-generator"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Studio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span suppressHydrationWarning className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/50">
              {docMeta.category}
            </span>
            <span suppressHydrationWarning className="text-xs text-slate-500 hidden sm:inline">| {docMeta.actReference}</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 suppressHydrationWarning className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-blue-400" />
            {docMeta.title}
          </h1>
          <p suppressHydrationWarning className="text-slate-400 text-sm">{docMeta.shortDescription}</p>
        </div>

        {/* Wizard Progress Steps Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-2xl">
          <div
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep === 1 ? 'text-blue-400 font-bold' : 'text-slate-500'
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </div>
            <span className="text-sm">Company Info</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-800" />

          <div
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep === 2 ? 'text-blue-400 font-bold' : 'text-slate-500'
            }`}
            onClick={() => setCurrentStep(2)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="text-sm">Document Parameters</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-800" />

          <div
            className={`flex items-center gap-2 ${
              currentStep === 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>
            <span className="text-sm">AI Preview & DOCX</span>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-xs underline text-red-300">
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: COMPANY DETAILS */}
        {currentStep === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Building2 className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="font-bold text-white text-lg">Step 1: Corporate Entity Details</h3>
                <p className="text-xs text-slate-400">Enter official company information registered with the MCA.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. ABC PRIVATE LIMITED"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Corporate Identification Number (CIN) *
                </label>
                <input
                  type="text"
                  value={cin}
                  onChange={e => setCin(e.target.value.toUpperCase())}
                  placeholder="e.g. U72900MH2021PTC123456"
                  maxLength={21}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">21-character MCA CIN format.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Office Address
                </label>
                <textarea
                  rows={2}
                  value={registeredOffice}
                  onChange={e => setRegisteredOffice(e.target.value)}
                  placeholder="Full registered address of the Company..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!companyName.trim() || !cin.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all"
              >
                <span>Continue to Parameters</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SPECIFIC DOCUMENT PARAMETERS */}
        {currentStep === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <UserCheck className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="font-bold text-white text-lg">Step 2: Document Specific Parameters</h3>
                <p className="text-xs text-slate-400">Fill in specific director, meeting, and legal variables.</p>
              </div>
            </div>

            {/* Director fields (For Resolution or DIR-2) */}
            {docType !== 'notice_board_meeting' && (
              <div className="space-y-4 border-b border-slate-800 pb-6">
                <h4 className="font-bold text-blue-400 text-sm uppercase tracking-wider">Director Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name of Director *</label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={e => setDirectorName(e.target.value)}
                      placeholder="e.g. Mr. Rajesh Kumar"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">DIN (8 digits) *</label>
                    <input
                      type="text"
                      value={din}
                      onChange={e => setDin(e.target.value)}
                      placeholder="e.g. 01234567"
                      maxLength={8}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {docType === 'dir2_consent_director' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Residential Address of Director</label>
                    <input
                      type="text"
                      value={directorAddress}
                      onChange={e => setDirectorAddress(e.target.value)}
                      placeholder="Full residential address..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {docType === 'board_resolution_additional_director' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Designation Category</label>
                    <select
                      value={designationCategory}
                      onChange={e => setDesignationCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Non-Executive Director">Non-Executive Director</option>
                      <option value="Executive Director">Executive Director</option>
                      <option value="Independent Director">Independent Director</option>
                      <option value="Additional Director">Additional Director</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Meeting details (For Notice or Resolution) */}
            {docType !== 'dir2_consent_director' && (
              <div className="space-y-4 border-b border-slate-800 pb-6">
                <h4 className="font-bold text-blue-400 text-sm uppercase tracking-wider">Board Meeting Parameters</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Meeting Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={e => setMeetingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Meeting Time</label>
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={e => setMeetingTime(e.target.value)}
                      placeholder="e.g. 11:00 AM"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Meeting Serial #</label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={e => setSerialNumber(e.target.value)}
                      placeholder="e.g. 03/2026-27"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Meeting Venue</label>
                  <input
                    type="text"
                    value={meetingVenue}
                    onChange={e => setMeetingVenue(e.target.value)}
                    placeholder="e.g. Registered Office of the Company"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Agendas Section (Only for Notice of Board Meeting) */}
            {docType === 'notice_board_meeting' && (
              <div className="space-y-4 border-b border-slate-800 pb-6">
                <h4 className="font-bold text-blue-400 text-sm uppercase tracking-wider">
                  Dynamic Agenda Items (SS-1 Compliant)
                </h4>

                <div className="space-y-2">
                  {agendaTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                    >
                      <span className="font-mono text-blue-400 mr-2">Item #{idx + 1}:</span>
                      <span className="flex-1">{topic}</span>
                      <button
                        onClick={() => handleRemoveAgenda(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAgendaInput}
                    onChange={e => setNewAgendaInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAgenda())}
                    placeholder="Add custom agenda topic (e.g. To approve Q2 Financial Statements)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddAgenda}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Topic
                  </button>
                </div>
              </div>
            )}

            {/* Signatory & Options */}
            <div className="space-y-4">
              <h4 className="font-bold text-blue-400 text-sm uppercase tracking-wider">Signatory & Additional Instructions</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={authorizedSignatoryName}
                    onChange={e => setAuthorizedSignatoryName(e.target.value)}
                    placeholder="e.g. Ms. Priya Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Designation</label>
                  <input
                    type="text"
                    value={authorizedSignatoryDesignation}
                    onChange={e => setAuthorizedSignatoryDesignation(e.target.value)}
                    placeholder="Director / Company Secretary"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Custom AI Prompt Instructions (Optional)</label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Include note about filing Form DIR-12 within 30 days..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
              >
                Back
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Drafting Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Document with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE PREVIEW & DOCX DOWNLOAD */}
        {currentStep === 3 && generatedModel && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Main Column: Live Word Document Preview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <FileCheck className="w-5 h-5" />
                  <span>AI Document Ready for MS Word Export</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={handleDownloadDocx}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download DOCX</span>
                  </button>
                </div>
              </div>

              {/* Styled MS Word Document Paper Replica */}
              <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 space-y-6 font-serif border border-slate-200 text-sm sm:text-base leading-relaxed select-text">
                {/* Header */}
                <div className="text-center space-y-1 border-b border-slate-300 pb-4">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 uppercase">
                    {generatedModel.companyDetails?.name}
                  </h2>
                  <p className="text-xs font-sans text-slate-600 font-mono">
                    CIN: {generatedModel.companyDetails?.cin}
                  </p>
                  <p className="text-xs font-sans text-slate-500">
                    Reg. Office: {generatedModel.companyDetails?.registeredAddress}
                  </p>
                </div>

                {/* Title */}
                <div className="text-center space-y-2 py-2">
                  <h3 className="text-lg font-bold underline tracking-wider uppercase text-slate-900">
                    {generatedModel.documentTitle}
                  </h3>
                  {generatedModel.subTitle && (
                    <p className="text-xs italic text-slate-700">{generatedModel.subTitle}</p>
                  )}
                </div>

                {/* Meeting Meta */}
                {generatedModel.meetingDetails?.date && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-sans text-slate-700 flex flex-wrap gap-4">
                    <span><strong>Date:</strong> {generatedModel.meetingDetails.date}</span>
                    <span><strong>Time:</strong> {generatedModel.meetingDetails.time}</span>
                    <span><strong>Venue:</strong> {generatedModel.meetingDetails.venue}</span>
                  </div>
                )}

                {/* Introductory text */}
                {generatedModel.introductoryText && (
                  <p className="text-justify">{generatedModel.introductoryText}</p>
                )}

                {/* Agendas Table if present */}
                {generatedModel.agendas && generatedModel.agendas.length > 0 && (
                  <div className="space-y-3 font-sans">
                    <h4 className="font-bold text-sm underline text-slate-900">
                      BUSINESS TO BE TRANSACTED (AGENDA):
                    </h4>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="border border-slate-300 p-2 text-center">Item #</th>
                          <th className="border border-slate-300 p-2 text-left">Agenda Topic</th>
                          <th className="border border-slate-300 p-2 text-left">Statutory Ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedModel.agendas.map(agenda => (
                          <tr key={agenda.itemNumber} className="border-b border-slate-200">
                            <td className="border border-slate-300 p-2 text-center font-bold">
                              {agenda.itemNumber}
                            </td>
                            <td className="border border-slate-300 p-2 space-y-1">
                              <span className="font-bold block text-slate-900">{agenda.title}</span>
                              <span className="text-slate-600 block">{agenda.description}</span>
                            </td>
                            <td className="border border-slate-300 p-2 text-slate-500 italic">
                              {agenda.statutoryReference || 'SS-1 / Companies Act'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Clause Sections */}
                {generatedModel.sections?.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    {section.heading && (
                      <h4 className="font-bold text-sm tracking-wide uppercase text-slate-900 border-b border-slate-200 pb-1">
                        {section.heading}
                      </h4>
                    )}
                    {section.clauses.map((clause, cIdx) => (
                      <p key={cIdx} className="text-justify leading-relaxed">
                        {clause}
                      </p>
                    ))}
                  </div>
                ))}

                {/* Concluding text */}
                {generatedModel.concludingText && (
                  <p className="text-justify font-sans text-xs text-slate-700 pt-2">
                    {generatedModel.concludingText}
                  </p>
                )}

                {/* Signatory Box */}
                {generatedModel.signatories && generatedModel.signatories.length > 0 && (
                  <div className="pt-8 text-right space-y-8 font-sans">
                    <p className="font-bold text-xs">
                      For and on behalf of {generatedModel.companyDetails?.name}
                    </p>

                    {generatedModel.signatories.map((sig, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="text-slate-400">____________________________________</p>
                        <p className="font-bold text-sm text-slate-900">({sig.name})</p>
                        <p className="text-xs text-slate-600">
                          {sig.designation} {sig.dinOrPan ? `(DIN: ${sig.dinOrPan})` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Column: Statutory Citations & Compliance Notes */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-base border-b border-slate-800 pb-3">
                  <Scale className="w-5 h-5" />
                  <span>Statutory Citations</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  {generatedModel.statutoryCitations?.map((cit, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{cit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Secretarial Compliance Notes</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  {generatedModel.complianceNotes?.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Edit Parameters & Regenerate
                </button>

                <button
                  onClick={handleDownloadDocx}
                  disabled={isExporting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MS Word (.docx)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
