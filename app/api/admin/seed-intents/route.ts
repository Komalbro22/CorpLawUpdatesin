// app/api/admin/seed-intents/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';
import { getEmbedding } from '@/lib/gemini';
import { verifyAdminSession } from '@/lib/admin-auth';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

interface ClauseDef {
  document_type: string;
  category: string;
  content: string;
  variables: Record<string, string>;
  placement_rules: {
    action: string;
    anchor: string;
    anchor_type: string;
    fallback: string;
  };
  legal_basis: string;
  related_forms: string[];
  compliance_deadline: string | null;
}

interface IntentDef {
  name: string;
  description: string;
  aliases: string[];
  /** Legacy single-clause format (existing 4 intents) */
  sampleClause?: ClauseDef;
  /** Multi-document-type format (new intents) */
  clauses?: ClauseDef[];
}

// ─────────────────────────────────────────────────────────────
// INTENTS TO SEED
// ─────────────────────────────────────────────────────────────

const INTENTS_TO_SEED: IntentDef[] = [

  // ══════════════════════════════════════════════════════════
  // EXISTING 4 — DO NOT MODIFY (kept as-is for backward compat)
  // ══════════════════════════════════════════════════════════

  {
    name: 'ADD_CONFIDENTIALITY',
    description: 'Add a Non-Disclosure/Confidentiality clause',
    aliases: ['add confidentiality clause', 'insert nda section', 'add secrecy clause', 'insert confidentiality', 'add nondisclosure', 'nda', 'please insert nda section'],
    sampleClause: {
      document_type: 'EMPLOYMENT_CONTRACT',
      category: 'INSERT',
      content: 'CONFIDENTIALITY: The Employee, {{name}}, hereby agrees to maintain strict confidentiality of all proprietary information, trade secrets, and business data of the Company during and after the term of employment. Breach of this clause shall render the Employee liable under applicable Indian law.',
      variables: { name: 'STRING' },
      placement_rules: { action: 'INSERT_AFTER', anchor: 'REMUNERATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
      legal_basis: 'Section 27 of the Indian Contract Act, 1872',
      related_forms: [],
      compliance_deadline: null,
    }
  },
  {
    name: 'ADD_MBP1_DISCLOSURE',
    description: 'Add MBP-1 disclosure of interest by director',
    aliases: ['add mbp1', 'insert mbp 1', 'add disclosure of interest', 'director disclosure', 'add mbp1 clause', 'standard mbp1', 'standard mbp 1', 'please insert standard mbp1', 'please insert standard mbp 1'],
    sampleClause: {
      document_type: 'BOARD_RESOLUTION',
      category: 'INSERT',
      content: 'DISCLOSURE OF INTEREST: Shri/Smt. {{director_name}}, Director, hereby discloses pursuant to Section 184(1) of the Companies Act, 2013 that they hold a position of concern or interest in {{company_name}} as detailed in Form MBP-1 submitted to the Board.',
      variables: { director_name: 'STRING', company_name: 'STRING' },
      placement_rules: { action: 'INSERT_AFTER', anchor: 'PRESENT', anchor_type: 'HEADING', fallback: 'BOTTOM' },
      legal_basis: 'Section 184(1) of the Companies Act, 2013',
      related_forms: ['MBP-1'],
      compliance_deadline: 'At first Board Meeting of every financial year',
    }
  },
  {
    name: 'ADD_INDEPENDENT_DIRECTOR_DECLARATION',
    description: 'Add Section 164 declaration / Independent Director declaration',
    aliases: ['add section 164 declaration', 'add independent director declaration', 'insert dir2 consent', 'add dir 2'],
    sampleClause: {
      document_type: 'BOARD_RESOLUTION',
      category: 'INSERT',
      content: 'DECLARATION: Shri/Smt. {{director_name}}, the proposed Independent Director, hereby declares under Section 164 of the Companies Act, 2013 that they are not disqualified from being appointed as a Director and meet all independence criteria under Section 149(6) of the Act.',
      variables: { director_name: 'STRING' },
      placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
      legal_basis: 'Section 164 and Section 149(6) of the Companies Act, 2013',
      related_forms: ['DIR-2', 'DIR-8'],
      compliance_deadline: 'Before appointment',
    }
  },
  {
    name: 'ADD_REGISTERED_OFFICE_CLAUSE',
    description: 'Add or update registered office address',
    aliases: ['add registered office', 'update registered office address', 'change registered office', 'insert registered office clause'],
    sampleClause: {
      document_type: 'BOARD_RESOLUTION',
      category: 'INSERT',
      content: 'REGISTERED OFFICE: RESOLVED THAT the registered office of the Company be and is hereby shifted to {{new_address}}, {{city}}, {{state}} — {{pincode}}, with effect from {{effective_date}}.',
      variables: { new_address: 'STRING', city: 'CITY', state: 'STRING', pincode: 'STRING', effective_date: 'DATE' },
      placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED', anchor_type: 'REGEX', fallback: 'BOTTOM' },
      legal_basis: 'Section 12 of the Companies Act, 2013',
      related_forms: ['INC-22'],
      compliance_deadline: 'Within 30 days of change',
    }
  },

  // ══════════════════════════════════════════════════════════
  // NEW SHARED INTENTS
  // (apply to multiple document types — one clause per type)
  // ══════════════════════════════════════════════════════════

  // ── SHARED INTENT 1: GOVERNING LAW ──
  {
    name: 'ADD_GOVERNING_LAW',
    description: 'Add governing law and jurisdiction clause specifying Indian courts',
    aliases: [
      'add governing law',
      'add jurisdiction clause',
      'add applicable law',
      'insert governing law india',
      'add court jurisdiction',
      'specify jurisdiction',
      'add dispute jurisdiction',
      'governing law india',
      'applicable law clause',
      'add legal jurisdiction',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'GOVERNING LAW: This Resolution and all matters arising out of or in connection with it shall be governed by and construed in accordance with the laws of India. Any dispute arising out of this Resolution shall be subject to the exclusive jurisdiction of the courts at {{jurisdiction_city}}.',
        variables: { jurisdiction_city: 'CITY' },
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Civil Procedure Code, 1908',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'DIRECTOR_APPOINTMENT_LETTER',
        category: 'INSERT',
        content: 'GOVERNING LAW: This Letter of Appointment shall be governed by and construed in accordance with the laws of India. Any dispute, controversy or claim arising out of or in connection with this appointment shall be subject to the exclusive jurisdiction of the courts at {{jurisdiction_city}}.',
        variables: { jurisdiction_city: 'CITY' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TERMINATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Civil Procedure Code, 1908',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'GOVERNING LAW AND JURISDICTION: This Agreement shall be governed by and construed in accordance with the laws of India. The parties hereby submit to the exclusive jurisdiction of the courts at {{jurisdiction_city}} for the resolution of any dispute arising under or in connection with this Agreement.',
        variables: { jurisdiction_city: 'CITY' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'DISPUTE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Civil Procedure Code, 1908; Arbitration and Conciliation Act, 1996',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'GOVERNING LAW: This Joint Venture Agreement shall be governed by and construed in accordance with the laws of India. The courts at {{jurisdiction_city}} shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with this Agreement.',
        variables: { jurisdiction_city: 'CITY' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'DISPUTE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Civil Procedure Code, 1908',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── SHARED INTENT 2: ARBITRATION ──
  {
    name: 'ADD_ARBITRATION_CLAUSE',
    description: 'Add arbitration clause for dispute resolution under Indian Arbitration Act',
    aliases: [
      'add arbitration clause',
      'insert arbitration',
      'add dispute resolution',
      'add arbitration',
      'resolve via arbitration',
      'add adr clause',
      'insert dispute resolution',
      'arbitration india',
      'add alternative dispute resolution',
      'arbitration and conciliation act',
    ],
    clauses: [
      {
        document_type: 'DIRECTOR_APPOINTMENT_LETTER',
        category: 'INSERT',
        content: 'DISPUTE RESOLUTION: Any dispute arising out of or in connection with this appointment, including any question regarding its existence, validity or termination, shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be {{arbitration_city}}. The arbitration shall be conducted by a sole arbitrator mutually appointed by the parties.',
        variables: { arbitration_city: 'CITY' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TERMINATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Arbitration and Conciliation Act, 1996',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'ARBITRATION: Any dispute or difference arising out of or in connection with this Agreement, which cannot be resolved amicably within 30 days, shall be referred to arbitration. The arbitration shall be conducted in accordance with the Arbitration and Conciliation Act, 1996 at {{arbitration_city}}. The award of the arbitrator shall be final and binding on both parties.',
        variables: { arbitration_city: 'CITY' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TERMINATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Arbitration and Conciliation Act, 1996',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'DISPUTE RESOLUTION — ARBITRATION: Any dispute arising out of or relating to this Joint Venture Agreement, including its interpretation, performance or termination, shall be submitted to arbitration under the Arbitration and Conciliation Act, 1996. The arbitral tribunal shall consist of three arbitrators — one appointed by each party and the third appointed by mutual agreement. The seat of arbitration shall be {{arbitration_city}}.',
        variables: { arbitration_city: 'CITY' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'DISPUTE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Arbitration and Conciliation Act, 1996',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'SHARE_TRANSFER_DEED',
        category: 'INSERT',
        content: 'DISPUTE RESOLUTION: Any dispute arising out of or in connection with this Share Transfer Deed shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be held at {{arbitration_city}} and the award shall be final and binding on both the Transferor and Transferee.',
        variables: { arbitration_city: 'CITY' },
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Arbitration and Conciliation Act, 1996',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── SHARED INTENT 3: REMOVE SEAL ──
  {
    name: 'REMOVE_SEAL_REFERENCE',
    description: 'Remove company seal clause — seal is optional under Companies Act 2013',
    aliases: [
      'remove seal',
      'remove company seal',
      'delete seal clause',
      'seal not required',
      'seal is optional',
      'no seal needed',
      'remove common seal',
      'delete common seal',
      'seal optional companies act',
      'remove seal reference',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'REMOVE',
        content: '',
        variables: {},
        placement_rules: { action: 'REMOVE', anchor: 'seal', anchor_type: 'REGEX', fallback: 'SKIP' },
        legal_basis: 'Section 9 of the Companies Act, 2013 — Common Seal is optional',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── SHARED INTENT 4: FORCE MAJEURE ──
  {
    name: 'ADD_FORCE_MAJEURE',
    description: 'Add force majeure clause covering unforeseen events, pandemic, natural disasters',
    aliases: [
      'add force majeure',
      'add act of god clause',
      'insert force majeure',
      'add pandemic clause',
      'natural disaster clause',
      'add unforeseen events clause',
      'force majeure india',
      'add covid clause',
      'add extraordinary events clause',
      'force majeure exception',
    ],
    clauses: [
      {
        document_type: 'DIRECTOR_APPOINTMENT_LETTER',
        category: 'INSERT',
        content: 'FORCE MAJEURE: Neither party shall be liable for any failure or delay in performance of obligations under this appointment to the extent that such failure or delay is caused by circumstances beyond the reasonable control of the affected party, including but not limited to acts of God, pandemic, epidemic, natural disasters, war, civil unrest, government action, or breakdown of public telecommunications networks.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TERMINATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 56 of the Indian Contract Act, 1872 — Doctrine of Frustration',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'FORCE MAJEURE: Neither party shall be liable for any delay or failure to perform its obligations under this Agreement to the extent such delay or failure is caused by Force Majeure Event, meaning any event beyond the reasonable control of a party including but not limited to acts of God, fire, flood, earthquake, pandemic, epidemic, war, riot, embargoes, government regulations, or power failures. The affected party shall notify the other party within 7 days of the occurrence of such event.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'LIABILITY', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 56 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'FORCE MAJEURE: No party shall be in breach of this Agreement or liable for any delay or failure in performance if such delay or failure results from a Force Majeure Event. For the purpose of this Agreement, Force Majeure Event includes acts of God, pandemic, natural disasters, acts of government, war, civil war, or any other extraordinary event beyond the control of such party. Any party invoking force majeure must notify the other parties in writing within 15 days.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'DISPUTE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 56 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── SHARED INTENT 5: WITNESS SIGNATURES ──
  {
    name: 'ADD_WITNESS_SIGNATURES',
    description: 'Add witness signature blocks to document',
    aliases: [
      'add witness',
      'add witness signatures',
      'insert witness block',
      'add attesting witness',
      'add two witnesses',
      'require witness',
      'add signature witnesses',
      'witness signatures required',
      'add witness attestation',
      'add witness lines',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'WITNESS:\n\n1. ________________________\n   Name: {{witness1_name}}\n   Address: {{witness1_address}}\n   Date:\n\n2. ________________________\n   Name: {{witness2_name}}\n   Address: {{witness2_address}}\n   Date:',
        variables: {
          witness1_name: 'STRING',
          witness1_address: 'STRING',
          witness2_name: 'STRING',
          witness2_address: 'STRING',
        },
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 2(h) Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'DIRECTOR_APPOINTMENT_LETTER',
        category: 'INSERT',
        content: 'WITNESS:\n\n1. ________________________\n   Name: {{witness1_name}}\n   Address: {{witness1_address}}\n\n2. ________________________\n   Name: {{witness2_name}}\n   Address: {{witness2_address}}',
        variables: {
          witness1_name: 'STRING',
          witness1_address: 'STRING',
          witness2_name: 'STRING',
          witness2_address: 'STRING',
        },
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 2(h) Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'SHARE_TRANSFER_DEED',
        category: 'INSERT',
        content: 'WITNESS:\n\nWitness to the signature of the Transferor:\n________________________\nName: {{transferor_witness_name}}\nAddress: {{transferor_witness_address}}\n\nWitness to the signature of the Transferee:\n________________________\nName: {{transferee_witness_name}}\nAddress: {{transferee_witness_address}}',
        variables: {
          transferor_witness_name: 'STRING',
          transferor_witness_address: 'STRING',
          transferee_witness_name: 'STRING',
          transferee_witness_address: 'STRING',
        },
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 108, Companies Act 2013; Stamp Act',
        related_forms: ['SH-4'],
        compliance_deadline: null,
      },
    ],
  },

  // ── SHARED INTENT 6: IP OWNERSHIP ──
  {
    name: 'ADD_IP_OWNERSHIP_CLAUSE',
    description: 'Add intellectual property ownership clause assigning IP to company',
    aliases: [
      'add ip clause',
      'add intellectual property clause',
      'add ip ownership',
      'add ip assignment',
      'company owns ip',
      'add intellectual property rights',
      'add patent copyright clause',
      'add ip transfer clause',
      'intellectual property ownership company',
      'add work product ownership',
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'INTELLECTUAL PROPERTY: All intellectual property rights including but not limited to patents, copyrights, trade secrets, trademarks, designs and all work product created by the Service Provider in the course of performing services under this Agreement shall vest solely and exclusively in {{company_name}} (the Client). The Service Provider hereby assigns all such intellectual property rights to the Client with effect from the date of creation.',
        variables: { company_name: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'CONFIDENTIALITY', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Copyright Act, 1957; Patents Act, 1970; Trade Marks Act, 1999',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'DIRECTOR_APPOINTMENT_LETTER',
        category: 'INSERT',
        content: 'INTELLECTUAL PROPERTY: All inventions, improvements, discoveries, works of authorship, designs, software, or other intellectual property conceived, developed, or reduced to practice by the Director during the course of their engagement with the Company shall be the exclusive property of {{company_name}} and the Director hereby assigns all rights therein to the Company.',
        variables: { company_name: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'CONFIDENTIALITY', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Copyright Act, 1957; Patents Act, 1970',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // NEW DOCUMENT-SPECIFIC INTENTS
  // ══════════════════════════════════════════════════════════

  // ── BANK ACCOUNT RESOLUTION ──

  {
    name: 'ADD_JOINT_SIGNING_LIMIT',
    description: 'Add transaction limit requiring joint signing above specified amount',
    aliases: [
      'add joint signing',
      'joint signing above limit',
      'add transaction limit',
      'require two signatures above',
      'joint operation above',
      'add dual signatory limit',
      'two signatures for high value',
      'joint signing threshold',
      'add signing threshold',
      'require joint authorization above',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'JOINT OPERATION LIMIT: FURTHER RESOLVED THAT for all transactions above Rs. {{transaction_limit}} (Rupees {{transaction_limit_words}} only), the Bank Account shall be operated JOINTLY by any two of the authorized signatories. For transactions below Rs. {{transaction_limit}}, any single authorized signatory may operate the account.',
        variables: { transaction_limit: 'NUMBER', transaction_limit_words: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'AUTHORIZED_SIGNATORIES', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 179 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  {
    name: 'ADD_INTERNET_BANKING_AUTHORIZATION',
    description: 'Add internet banking, NEFT, RTGS and digital payment authorization',
    aliases: [
      'add internet banking',
      'add neft rtgs authorization',
      'add digital payment',
      'add online banking',
      'authorize internet banking',
      'add upi authorization',
      'add electronic transfer',
      'add online transactions',
      'internet banking authority',
      'add net banking clause',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'INTERNET BANKING: FURTHER RESOLVED THAT the authorized signatories be and are hereby authorized to operate Internet Banking, Mobile Banking, and to undertake NEFT, RTGS, IMPS, and UPI transactions on behalf of the Company through the said Bank Account.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'AUTHORIZED_SIGNATORIES', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 179 of the Companies Act, 2013; RBI Payment System Guidelines',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  {
    name: 'ADD_FD_AUTHORIZATION',
    description: 'Add Fixed Deposit authorization from bank account balance',
    aliases: [
      'add fd authorization',
      'add fixed deposit',
      'authorize fixed deposits',
      'add fd clause',
      'allow fd creation',
      'add term deposit',
      'fd from account',
      'open fixed deposit',
      'fixed deposit authority',
      'add fd booking',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'FIXED DEPOSITS: FURTHER RESOLVED THAT the authorized signatories be and are hereby authorized to open, operate, renew, and prematurely withdraw Fixed Deposits / Term Deposits with {{bank_name}} from the funds available in the said Company Bank Account, as and when required.',
        variables: { bank_name: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'INTERNET BANKING', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 179 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── DIRECTOR APPOINTMENT RESOLUTION ──

  {
    name: 'ADD_CSR_COMMITTEE_AUTHORIZATION',
    description: 'Authorize newly appointed director to serve on CSR Committee',
    aliases: [
      'add csr committee',
      'authorize csr committee member',
      'add corporate social responsibility committee',
      'director on csr committee',
      'add csr authorization',
      'appoint csr member',
      'csr committee clause',
      'add section 135 committee',
      'add csr membership',
      'director csr appointment',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'CSR COMMITTEE: FURTHER RESOLVED THAT {{director_name}} be and is hereby appointed as a member of the Corporate Social Responsibility (CSR) Committee of the Company constituted pursuant to Section 135 of the Companies Act, 2013, with immediate effect.',
        variables: { director_name: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 135 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  {
    name: 'ADD_AUDIT_COMMITTEE_AUTHORIZATION',
    description: 'Authorize director as member of Audit Committee under Section 177',
    aliases: [
      'add audit committee',
      'appoint audit committee member',
      'director on audit committee',
      'add section 177 committee',
      'audit committee membership',
      'add audit committee clause',
      'authorize audit committee',
      'audit committee appointment',
      'add director audit committee',
      'section 177 authorization',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'AUDIT COMMITTEE: FURTHER RESOLVED THAT {{director_name}} be and is hereby appointed as a member of the Audit Committee of the Company constituted pursuant to Section 177 of the Companies Act, 2013, with effect from {{effective_date}}.',
        variables: { director_name: 'STRING', effective_date: 'DATE' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'CSR COMMITTEE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 177 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  {
    name: 'ADD_DIR12_FILING_AUTHORIZATION',
    description: 'Authorize Company Secretary to file DIR-12 within 30 days of director change',
    aliases: [
      'add dir 12 authorization',
      'authorize dir12 filing',
      'add dir-12 clause',
      'authorize roc filing dir12',
      'add form dir12',
      'authorize director change filing',
      'dir12 filing authority',
      'file dir 12 authorization',
      'add roc intimation clause',
      'authorize dir 12 submission',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'FORM DIR-12: FURTHER RESOLVED THAT the Company Secretary of the Company be and is hereby authorized to file Form DIR-12 with the Registrar of Companies within 30 days of the date of this Resolution, along with the required attachments including DIR-2 Consent and DIR-8 Declaration.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 168, Rule 15 of Companies (Appointment) Rules, 2014',
        related_forms: ['DIR-12', 'DIR-2', 'DIR-8'],
        compliance_deadline: 'Within 30 days of director appointment/change',
      },
    ],
  },

  // ── REGISTERED OFFICE CHANGE ──

  {
    name: 'ADD_GST_UPDATE_AUTHORIZATION',
    description: 'Authorize updating GST registration for registered office change',
    aliases: [
      'add gst update clause',
      'authorize gst registration change',
      'add gst address update',
      'update gst for office change',
      'gst registration amendment',
      'add gst intimation',
      'authorize gst portal update',
      'gst change of address',
      'add gst update authority',
      'amend gst registration address',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'GST AMENDMENT: FURTHER RESOLVED THAT the authorized representative of the Company be and is hereby authorized to file an amendment application on the GST Portal for change of principal place of business / registered office address within 15 days from the date of this Resolution, and to do all such acts as may be required in this regard.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'INC-22', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 28 of the Central Goods and Services Tax Act, 2017; Rule 19 GST Rules',
        related_forms: ['INC-22'],
        compliance_deadline: 'Within 15 days of change of address',
      },
    ],
  },

  {
    name: 'ADD_NEWSPAPER_PUBLICATION_CLAUSE',
    description: 'Add newspaper publication for registered office change to different city',
    aliases: [
      'add newspaper publication',
      'add notice in newspaper',
      'publish office change notice',
      'newspaper advertisement clause',
      'add public notice publication',
      'gazette notification clause',
      'add newspaper notice',
      'publish change of office',
      'add local newspaper notice',
      'public advertisement clause',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'NEWSPAPER PUBLICATION: FURTHER RESOLVED THAT the Company Secretary / any Director of the Company be and is hereby authorized to publish a notice of change of Registered Office in a vernacular newspaper published in the local language of the district where the registered office is currently situated and in an English newspaper with wide circulation in that district, at least one month before the date of change.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'GST AMENDMENT', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Rule 28(1)(b) of the Companies (Incorporation) Rules, 2014',
        related_forms: ['INC-22'],
        compliance_deadline: 'At least 1 month before change of office to different city',
      },
    ],
  },

  // ── BANK LOAN RESOLUTION ──

  {
    name: 'ADD_CHARGE_FILING_AUTHORIZATION',
    description: 'Authorize filing of Form CHG-1 for charge creation on company assets',
    aliases: [
      'add charge filing',
      'add chg1 authorization',
      'authorize charge creation',
      'add form chg-1',
      'add chg 1 clause',
      'authorize roc charge registration',
      'add charge on assets',
      'authorize security creation filing',
      'add charge registration',
      'file chg 1 authority',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'CHARGE REGISTRATION: FURTHER RESOLVED THAT the Company Secretary / Chief Financial Officer of the Company be and is hereby authorized to file Form CHG-1 with the Registrar of Companies within 30 days of the creation of charge on the Company\'s assets pursuant to the above borrowing, and to do all such acts and deeds as may be necessary in this regard.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'FURTHER RESOLVED', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 77 of the Companies Act, 2013 — Duty to register charges',
        related_forms: ['CHG-1'],
        compliance_deadline: 'Within 30 days of charge creation',
      },
    ],
  },

  {
    name: 'ADD_PERSONAL_GUARANTEE_CLAUSE',
    description: 'Add personal guarantee by director for bank loan',
    aliases: [
      'add personal guarantee',
      'director personal guarantee',
      'add guarantee clause',
      'personal surety director',
      'add director guarantee',
      'personal guarantee loan',
      'add surety clause',
      'director as guarantor',
      'add personal surety',
      'guarantee by promoter',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'PERSONAL GUARANTEE: FURTHER RESOLVED THAT the Board hereby authorizes and consents to {{guarantor_name}}, {{guarantor_designation}}, providing a personal guarantee to {{bank_name}} as additional security for the loan / credit facility being availed by the Company, and that the said {{guarantor_name}} be authorized to execute all documents in this regard.',
        variables: {
          guarantor_name: 'STRING',
          guarantor_designation: 'STRING',
          bank_name: 'STRING',
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'CHARGE REGISTRATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 128 of the Indian Contract Act, 1872 — Contract of Guarantee',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── DIVIDEND RESOLUTION ──

  {
    name: 'ADD_TDS_DEDUCTION_CLAUSE',
    description: 'Add TDS deduction clause on dividend payments under Income Tax Act',
    aliases: [
      'add tds clause',
      'add tax deduction source',
      'add tds on dividend',
      'insert tds deduction',
      'add income tax tds',
      'tds on dividend payment',
      'add section 194 clause',
      'add tax withholding',
      'add tds compliance',
      'income tax deduction clause',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'TAX DEDUCTION: FURTHER RESOLVED THAT the Company shall deduct Tax at Source (TDS) at the applicable rate under Section 194 of the Income Tax Act, 1961 on the dividend payment to each shareholder whose dividend amount exceeds Rs. 5,000 in the financial year, and shall deposit the same with the Income Tax Department within the prescribed time.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RECORD DATE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 194 of the Income Tax Act, 1961; Section 123 Companies Act, 2013',
        related_forms: ['26Q'],
        compliance_deadline: 'TDS to be deposited by 7th of the following month',
      },
    ],
  },

  {
    name: 'ADD_IEPF_TRANSFER_CLAUSE',
    description: 'Add IEPF unclaimed dividend transfer clause after 7 years',
    aliases: [
      'add iepf clause',
      'add unclaimed dividend transfer',
      'iepf transfer',
      'add investor education fund',
      'unclaimed dividend iepf',
      'add 7 year dividend clause',
      'transfer unclaimed to iepf',
      'investor education protection fund',
      'add iepf compliance',
      'seven year dividend transfer',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'IEPF TRANSFER: FURTHER RESOLVED THAT any dividend remaining unpaid or unclaimed for a period of 7 years from the date of transfer to the Unpaid Dividend Account shall be transferred by the Company to the Investor Education and Protection Fund (IEPF) established under Section 125 of the Companies Act, 2013, along with the underlying shares, as per the applicable rules.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TAX DEDUCTION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 124 and Section 125 of the Companies Act, 2013; IEPF Rules, 2016',
        related_forms: ['IEPF-1', 'IEPF-4'],
        compliance_deadline: 'After 7 years of unclaimed dividend',
      },
    ],
  },

  // ── INVESTMENT RESOLUTION ──

  {
    name: 'ADD_SECTION186_COMPLIANCE_NOTE',
    description: 'Add Section 186 compliance confirmation for inter-corporate investments',
    aliases: [
      'add section 186 compliance',
      'add investment limit compliance',
      'section 186 confirmation',
      'add inter corporate investment note',
      'add 186 limit check',
      'investment limit section 186',
      'add statutory investment limit',
      'companies act investment limit',
      'add section 186 note',
      'confirm 186 compliance',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'SECTION 186 COMPLIANCE: FURTHER RESOLVED THAT the Board hereby confirms that the aggregate of loans given, investments made, guarantees given and securities provided by the Company does not exceed the prescribed limit of 60% of the paid-up share capital and free reserves and securities premium account OR 100% of free reserves and securities premium account, whichever is more, as required under Section 186 of the Companies Act, 2013.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 186 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  {
    name: 'ADD_FD_ROLLOVER_AUTHORIZATION',
    description: 'Add authorization to rollover Fixed Deposit on maturity without fresh board resolution',
    aliases: [
      'add fd rollover',
      'authorize fd renewal',
      'add fixed deposit rollover',
      'fd maturity renewal',
      'add auto renewal fd',
      'authorize fd reinvestment',
      'rollover fixed deposit authority',
      'add fd continuation clause',
      'add renewal authorization fd',
      'fd automatic renewal clause',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'FD ROLLOVER: FURTHER RESOLVED THAT the authorized signatories be and are hereby authorized to renew, rollover, or reinvest the said Fixed Deposit / Term Deposit on maturity at the prevailing interest rates, without requiring a fresh Board Resolution for each renewal, provided the total invested amount does not exceed Rs. {{rollover_limit}}.',
        variables: { rollover_limit: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'FIXED DEPOSITS', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 179(3)(e) of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── SHARE TRANSFER DEED ──

  {
    name: 'ADD_STAMP_DUTY_CLAUSE',
    description: 'Add stamp duty compliance clause for share transfer deed',
    aliases: [
      'add stamp duty',
      'add stamp duty clause',
      'insert stamp duty compliance',
      'add share transfer stamp',
      'stamp duty on transfer',
      'add stamp paper note',
      'add stamp act compliance',
      'share transfer stamp duty',
      'add duty paid clause',
      'stamp duty paid confirmation',
    ],
    clauses: [
      {
        document_type: 'SHARE_TRANSFER_DEED',
        category: 'INSERT',
        content: 'STAMP DUTY: This Share Transfer Deed has been executed on stamp paper of adequate value as required under the Indian Stamp Act, 1899, and the applicable State Stamp Act. The stamp duty of Rs. {{stamp_duty_amount}} has been duly paid at the rate of 25 paise per Rs. 100 of the value of the shares transferred, or the market value thereof, whichever is higher.',
        variables: { stamp_duty_amount: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TRANSFER', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Indian Stamp Act, 1899; Article 62 of Schedule I — Transfer of Shares',
        related_forms: ['SH-4'],
        compliance_deadline: 'Stamp duty payable at time of execution',
      },
    ],
  },

  {
    name: 'ADD_SHARE_TRANSFER_CONSIDERATION',
    description: 'Add consideration amount and payment terms for share transfer',
    aliases: [
      'add transfer consideration',
      'add share price clause',
      'specify transfer amount',
      'add payment terms transfer',
      'add consideration clause',
      'share transfer price',
      'add transfer value',
      'consideration for shares',
      'add sale price shares',
      'transfer consideration amount',
    ],
    clauses: [
      {
        document_type: 'SHARE_TRANSFER_DEED',
        category: 'INSERT',
        content: 'CONSIDERATION: In consideration of the payment of Rs. {{consideration_amount}} (Rupees {{consideration_words}} only) paid / agreed to be paid by the Transferee to the Transferor (receipt whereof the Transferor hereby acknowledges), the Transferor hereby transfers to the Transferee {{number_of_shares}} equity shares of Rs. {{face_value}} each of {{company_name}}.',
        variables: {
          consideration_amount: 'NUMBER',
          consideration_words: 'STRING',
          number_of_shares: 'NUMBER',
          face_value: 'NUMBER',
          company_name: 'STRING',
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TRANSFER', anchor_type: 'HEADING', fallback: 'TOP' },
        legal_basis: 'Section 56 of the Companies Act, 2013; Form SH-4',
        related_forms: ['SH-4'],
        compliance_deadline: 'Within 60 days of execution of transfer deed',
      },
    ],
  },

  // ── SERVICE LEVEL AGREEMENT ──

  {
    name: 'ADD_SLA_PENALTY_CLAUSE',
    description: 'Add service penalty and SLA breach compensation clause',
    aliases: [
      'add sla penalty',
      'add service penalty',
      'add breach penalty',
      'add service level penalty',
      'sla breach compensation',
      'add performance penalty',
      'add delay penalty',
      'add liquidated damages sla',
      'add compensation for breach',
      'add service breach penalty',
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'SLA BREACH PENALTY: In the event the Service Provider fails to meet the agreed Service Level Targets for {{sla_breach_period}} consecutive days, the Service Provider shall pay to the Client a penalty of {{penalty_percent}}% of the monthly service fee for each day of non-compliance, subject to a maximum aggregate penalty of {{max_penalty_percent}}% of the total annual contract value. Such penalty shall be deducted from the next invoice.',
        variables: {
          sla_breach_period: 'NUMBER',
          penalty_percent: 'NUMBER',
          max_penalty_percent: 'NUMBER',
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'SERVICE LEVELS', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 74 of the Indian Contract Act, 1872 — Compensation for breach',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── JOINT VENTURE AGREEMENT ──

  {
    name: 'ADD_PROFIT_SHARING_CLAUSE',
    description: 'Add profit sharing ratio and distribution mechanism for joint venture',
    aliases: [
      'add profit sharing',
      'specify profit ratio',
      'add profit distribution',
      'add revenue sharing',
      'profit sharing joint venture',
      'add profit allocation',
      'specify profit split',
      'add earnings distribution',
      'add jv profit clause',
      'profit sharing ratio clause',
    ],
    clauses: [
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'PROFIT SHARING: The net profits of the Joint Venture, after deducting all expenses, taxes, and reserves, shall be distributed between the parties in the following ratio:\n\n{{party1_name}}: {{party1_profit_percent}}%\n{{party2_name}}: {{party2_profit_percent}}%\n\nProfits shall be distributed {{distribution_frequency}} within {{distribution_days}} days of the end of each period after approval by the JV Board.',
        variables: {
          party1_name: 'STRING',
          party1_profit_percent: 'NUMBER',
          party2_name: 'STRING',
          party2_profit_percent: 'NUMBER',
          distribution_frequency: 'STRING',
          distribution_days: 'NUMBER',
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'CAPITAL CONTRIBUTION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872; Indian Partnership Act, 1932 (by analogy)',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  {
    name: 'ADD_EXIT_CLAUSE',
    description: 'Add exit mechanism and buyout rights for joint venture parties',
    aliases: [
      'add exit clause',
      'add buyout rights',
      'add exit mechanism',
      'add exit strategy',
      'jv exit clause',
      'add right of first refusal',
      'add exit provisions',
      'add dissolution trigger',
      'add buyout option',
      'exit rights joint venture',
    ],
    clauses: [
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'EXIT MECHANISM: Either party may exit this Joint Venture by providing {{exit_notice_period}} months prior written notice to the other party. Upon such notice:\n\n(a) The exiting party shall offer its interest to the remaining party at Fair Market Value (FMV) determined by a mutually appointed independent valuer.\n(b) If the remaining party declines to purchase, the exiting party may sell its interest to any third party at the same or higher price.\n(c) The FMV determination shall be completed within 60 days of the exit notice.\n\nIn case of deadlock lasting more than {{deadlock_period}} months, either party may trigger the exit mechanism.',
        variables: {
          exit_notice_period: 'NUMBER',
          deadlock_period: 'NUMBER',
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'PROFIT SHARING', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872; Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ── MOA ALTERATION RESOLUTION ──

  {
    name: 'ADD_MOA_ALTERATION_AUTHORIZATION',
    description: 'Authorize filing of MGT-14 and INC-6 for MOA objects clause alteration',
    aliases: [
      'add moa alteration filing',
      'authorize mgt14 moa',
      'add moa change authorization',
      'add inc-6 authorization',
      'moa objects clause change',
      'add alteration moa authority',
      'authorize moa amendment filing',
      'add moa amendment clause',
      'file mgt 14 moa',
      'moa alteration authority',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'MGT-14 FILING: FURTHER RESOLVED THAT the Company Secretary / any Director of the Company be and is hereby authorized to file Form MGT-14 with the Registrar of Companies, within 30 days of the passing of the Special Resolution for alteration of the Memorandum of Association, along with all required attachments.\n\nFURTHER RESOLVED THAT upon registration of the alteration by the Registrar of Companies, the Company Secretary be authorized to incorporate the necessary changes in all copies of the Memorandum of Association of the Company.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 13 of the Companies Act, 2013; Rule 24 Companies (Incorporation) Rules, 2014',
        related_forms: ['MGT-14', 'INC-6'],
        compliance_deadline: 'MGT-14 within 30 days of special resolution',
      },
    ],
  },

  {
    name: 'ADD_EGM_NOTICE_AUTHORIZATION',
    description: 'Authorize issuance of EGM notice for special resolution on MOA alteration',
    aliases: [
      'add egm notice',
      'authorize extraordinary general meeting',
      'add egm authorization',
      'add special resolution notice',
      'authorize egm notice issue',
      'send egm notice',
      'add extra ordinary meeting',
      'authorize general meeting notice',
      'egm for moa change',
      'add egm clause',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'EGM NOTICE: FURTHER RESOLVED THAT the Company Secretary of the Company be and is hereby authorized to issue Notice of an Extraordinary General Meeting (EGM) to all members, debenture holders, and auditors of the Company at least 21 clear days before the date of the EGM, for the purpose of passing a Special Resolution for alteration of the Objects Clause of the Memorandum of Association.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 100–101 of the Companies Act, 2013; Secretarial Standard SS-2',
        related_forms: ['MGT-14'],
        compliance_deadline: 'Notice at least 21 clear days before EGM',
      },
    ],
  },

  // ── ANNUAL COMPLIANCE RESOLUTION ──

  {
    name: 'ADD_AOC4_MGT7_FILING_AUTHORIZATION',
    description: 'Authorize filing of AOC-4 (financial statements) and MGT-7 (annual return)',
    aliases: [
      'add aoc4 filing',
      'authorize annual return filing',
      'add mgt7 authorization',
      'add aoc-4 clause',
      'annual accounts filing authority',
      'authorize financial statement filing',
      'add annual compliance filing',
      'add roc annual filing',
      'mgt 7 authorization',
      'authorize aoc 4 mgt 7',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'ANNUAL FILINGS: FURTHER RESOLVED THAT the Board hereby authorizes the Company Secretary and Chief Financial Officer to file Form AOC-4 (Financial Statements) within 30 days of the Annual General Meeting and Form MGT-7 (Annual Return) within 60 days of the Annual General Meeting with the Registrar of Companies for the Financial Year {{financial_year}}.',
        variables: { financial_year: 'STRING' },
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 137 and Section 92 of the Companies Act, 2013',
        related_forms: ['AOC-4', 'MGT-7'],
        compliance_deadline: 'AOC-4: within 30 days of AGM; MGT-7: within 60 days of AGM',
      },
    ],
  },

  {
    name: 'ADD_STATUTORY_AUDITOR_APPOINTMENT',
    description: 'Authorize appointment or ratification of statutory auditor',
    aliases: [
      'add auditor appointment',
      'authorize auditor',
      'add statutory auditor clause',
      'ratify auditor appointment',
      'add auditor authorization',
      'appoint statutory auditor',
      'add auditor remuneration',
      'authorize audit firm',
      'add section 139 appointment',
      'statutory audit appointment clause',
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'STATUTORY AUDITOR: RESOLVED THAT M/s {{audit_firm_name}}, Chartered Accountants (Firm Registration No. {{firm_reg_no}}), be and are hereby appointed as the Statutory Auditors of the Company for the Financial Year {{financial_year}}, to hold office from the conclusion of this Annual General Meeting until the conclusion of the next Annual General Meeting, at a remuneration of Rs. {{remuneration_amount}} plus applicable taxes and out-of-pocket expenses.',
        variables: {
          audit_firm_name: 'STRING',
          firm_reg_no: 'STRING',
          financial_year: 'STRING',
          remuneration_amount: 'NUMBER',
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 139 of the Companies Act, 2013',
        related_forms: ['ADT-1'],
        compliance_deadline: 'ADT-1 within 15 days of AGM',
      },
    ],
  },
  {
    name: 'ADD_DO_INSURANCE',
    description: 'Add clause stating the company will obtain Directors and Officers (D&O) liability insurance covering the director during their tenure',
    aliases: [
      'add do insurance clause',
      'add directors and officers liability insurance',
      'insert do insurance clause',
      'add do insurance covering director',
      'company will obtain directors and officers liability insurance covering the director during their tenure',
      'obtain do liability insurance',
      'directors and officers liability insurance',
      'd and o insurance',
      'd&o insurance',
    ],
    clauses: [
      {
        document_type: 'DIRECTOR_APPOINTMENT_LETTER',
        category: 'INSERT',
        content: 'D&O LIABILITY INSURANCE: The Company shall, at its own expense, obtain and maintain a Directors and Officers (D&O) liability insurance policy with a reasonable cover limit to protect the Appointee from any liability, claims, or losses arising out of the performance of their duties as a Director during their tenure, except in cases of willful fraud or criminal breach of trust.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'REMUNERATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 149 read with Schedule IV of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNERSHIP_SINGLE_SIGNATORY',
    description: 'Add clause specifying bank account operation by single partner up to limit and jointly above',
    aliases: ['add banking single signatory operation', 'single signatory bank', 'allow single partner bank operation', 'bank limit single signatory', 'cheque signing limit partner'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'BANK LIMITS: Notwithstanding anything contained in Clause 8, the firm\'s bank account(s) may be operated individually by either of the Partners for transactions up to ₹{{single_signatory_limit}} (Rupees {{single_signatory_limit_words}} only). Any transaction exceeding this limit shall require the joint signatures/authorization of both Partners.',
        variables: { single_signatory_limit: 'NUMBER', single_signatory_limit_words: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'BANK ACCOUNT OPERATIONS', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 19 of the Indian Partnership Act, 1932 — Implied authority of partner',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNER_ADMISSION_RULES',
    description: 'Add clause stating new partners require written consent of all existing partners',
    aliases: ['add admission of new partner clause', 'rules for new partner admission', 'consent for new partner', 'admit new partner', 'introduce new partner'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'ADMISSION OF NEW PARTNER: No new partner shall be introduced or admitted into the partnership firm without the prior written consent of all the existing Partners. Any new partner so admitted shall be bound by the terms of this deed or any supplementary deed executed in that regard.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RETIREMENT, DEATH, AND DISSOLUTION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 31 of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNER_SALARY_CAP',
    description: 'Capping partner remuneration under Section 40(b)(v) of Income Tax Act',
    aliases: ['add partner salary cap', 'limit partner remuneration', 'remuneration cap section 40b', 'income tax salary limit', 'salary limit working partners'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'REMUNERATION LIMIT: The total remuneration payable to all working partners shall be within the maximum limit permissible under Section 40(b)(v) of the Income-tax Act, 1961. If in any financial year the book profits are insufficient, the remuneration shall be scaled down proportionately to comply with the tax limits.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'REMUNERATION TO WORKING PARTNERS', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 40(b)(v) of the Income-tax Act, 1961',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNER_LOAN_INTEREST',
    description: 'Set partner loan interest rate (default 6% under Partnership Act, here custom e.g. 12%)',
    aliases: ['add partner loan interest rate', 'interest on partner loan', 'partner loan interest percentage', 'partner advance interest'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'INTEREST ON PARTNER LOANS: If any Partner advances any loan or funds to the firm beyond their agreed capital contribution, they shall be entitled to receive simple interest at the rate of {{loan_interest_rate}}% per annum on such loan amount, payable from the date of advance.',
        variables: { loan_interest_rate: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'INTEREST ON CAPITAL', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 13(d) of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_GOODWILL_VALUATION',
    description: 'Set goodwill valuation formula for partner retirement/death',
    aliases: ['add goodwill valuation formula', 'value goodwill on retirement', 'goodwill formula', 'calculate goodwill', 'death goodwill valuation'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'GOODWILL VALUATION: Upon the retirement or death of a Partner, the goodwill of the firm shall be valued at {{goodwill_multiplier}} times the average net profits of the preceding {{goodwill_years}} financial years. The outgoing partner or their legal representative shall be credited with their share of the valued goodwill.',
        variables: { goodwill_multiplier: 'NUMBER', goodwill_years: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RETIREMENT, DEATH, AND DISSOLUTION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 55 of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNER_NON_COMPETE',
    description: 'Restrict outgoing partner from competing within radius and duration',
    aliases: ['add non-compete for outgoing partner', 'partner non-compete restriction', 'outgoing partner competition limit', 'restraint of trade partner'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'NON-COMPETE: A retiring or outgoing Partner shall not carry on, directly or indirectly, any business competing with the business of the firm within a radius of {{compete_radius_km}} kilometers from the principal place of business, for a period of {{compete_duration_years}} years from the date of their exit.',
        variables: { compete_radius_km: 'NUMBER', compete_duration_years: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RETIREMENT, DEATH, AND DISSOLUTION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 36(2) of the Indian Partnership Act, 1932 — Exception to Restraint of Trade',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNERSHIP_ACCOUNTING_SYSTEM',
    description: 'Specify bookkeeping method (mercantile/accrual vs cash)',
    aliases: ['add accounting system details', 'partnership bookkeeping method', 'mercantile system of accounting', 'accrual accounting clause', 'books of accounts accrual'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'ACCOUNTING SYSTEM: The partnership firm shall maintain its books of accounts strictly on the {{accounting_system}} basis. The system of accounting once adopted shall not be changed without the mutual written consent of all Partners.',
        variables: { accounting_system: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'BOOKS OF ACCOUNT AND AUDIT', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 145 of the Income-tax Act, 1961',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'REMOVE_PARTNERSHIP_CAPITAL_INTEREST',
    description: 'Remove clause providing interest on capital contributions',
    aliases: ['remove capital interest clause', 'delete interest on capital', 'no interest on capital', 'interest on capital not payable'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'REMOVE',
        content: '',
        variables: {},
        placement_rules: { action: 'REMOVE', anchor: 'INTEREST ON CAPITAL', anchor_type: 'HEADING', fallback: 'SKIP' },
        legal_basis: 'Section 13(c) of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNER_DRAWINGS_LIMIT',
    description: 'Limit partner drawings per month',
    aliases: ['add partner drawings limits', 'partner monthly drawing limit', 'maximum drawing amount', 'partner personal drawings limit'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'PARTNER DRAWINGS: Each Partner shall be entitled to draw out of the partnership business for their personal use a sum not exceeding ₹{{drawings_limit}} per month. Any drawing exceeding this amount shall require the prior written consent of the other Partner and shall bear interest at the rate of {{drawings_interest_rate}}% per annum.',
        variables: { drawings_limit: 'NUMBER', drawings_interest_rate: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'PROFIT AND LOSS SHARING', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 12 and 13 of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNERSHIP_MEDIATION',
    description: 'Mandate mediation before arbitration',
    aliases: ['add dispute mediation step', 'mediation before arbitration', 'amicable settlement clause', 'mediation dispute resolution'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'MEDIATION: Prior to initiating any arbitration proceedings under Clause 11, the Partners shall attempt to resolve any dispute, difference or question amicably through good-faith mediation. A mediator shall be appointed by mutual agreement, and the mediation process shall be completed within {{mediation_period_days}} days.',
        variables: { mediation_period_days: 'NUMBER' },
        placement_rules: { action: 'INSERT_BEFORE', anchor: 'ARBITRATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 89 of the Civil Procedure Code, 1908',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNERSHIP_IP_OWNERSHIP',
    description: 'IP developed during partnership belongs to firm',
    aliases: ['add intellectual property clause', 'partnership ip ownership', 'intellectual property belongs to firm', 'trademark patent partnership'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'INTELLECTUAL PROPERTY RIGHTS: All trademarks, patents, designs, copyrights, and other intellectual property developed by either Partner in the course of carrying on the business of the partnership firm shall belong exclusively to and be the property of the partnership firm.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'PLACE AND NATURE OF BUSINESS', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Copyright Act, 1957; Patents Act, 1970',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'ADD_PARTNER_ROLES_DUTIES',
    description: 'Define specific roles and duties for Partners',
    aliases: ['add specific partner roles', 'partner responsibilities definition', 'duties of partners', 'manage daily operation partner'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'PARTNER ROLES: The Partners shall have the following operational responsibilities:\n- **{{partner_1_name}}** shall manage {{partner_1_role}}.\n- **{{partner_2_name}}** shall manage {{partner_2_role}}.',
        variables: { partner_1_name: 'STRING', partner_1_role: 'STRING', partner_2_name: 'STRING', partner_2_role: 'STRING' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'PLACE AND NATURE OF BUSINESS', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 12 of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'RESTRICT_PARTNERSHIP_DISSOLUTION',
    description: 'Restrict dissolution by notice, require mutual written consent',
    aliases: ['restrict dissolution by notice', 'require mutual consent for dissolution', 'partnership not dissolved by notice', 'prevent dissolution by notice'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'DISSOLUTION RESTRICTION: Notwithstanding anything contained in Clause 3, the partnership shall not be dissolved by notice issued by a single Partner. The dissolution of the firm shall require the mutual written consent and execution of a deed of dissolution by both Partners.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'COMMENCEMENT AND DURATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 40 of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },
  {
    name: 'UPDATE_PARTNERSHIP_PROFIT_RATIO',
    description: 'Modify profit sharing ratio (e.g. 60:40)',
    aliases: ['update profit-sharing ratio', 'modify profit ratio', 'change profit sharing percentage', 'revised profit ratio partners'],
    clauses: [
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'REPLACE',
        content: 'PROFIT SHARING RATIO (REVISED): The Partners hereby agree that the net profits and losses of the partnership firm shall be shared and borne between the First Partner and the Second Partner in the revised ratio of {{revised_ratio_1}}:{{revised_ratio_2}} respectively.',
        variables: { revised_ratio_1: 'NUMBER', revised_ratio_2: 'NUMBER' },
        placement_rules: { action: 'REPLACE', anchor: 'PROFIT AND LOSS SHARING', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 13(b) of the Indian Partnership Act, 1932',
        related_forms: [],
        compliance_deadline: null,
      },
    ],
  },

  // ════════════════════════════════════
  // UNIVERSAL COMMERCIAL CLAUSE INTENTS
  // Apply to: all agreement document types
  // ════════════════════════════════════

  {
    name: 'ADD_LIMITATION_OF_LIABILITY',
    description: 'Add limitation of liability clause capping financial exposure and excluding consequential damages',
    aliases: [
      'add limitation of liability',
      'add liability cap',
      'limit liability',
      'add damages cap',
      'exclude consequential damages',
      'add total liability clause',
      'limit financial exposure',
      'add indirect damages exclusion',
      'cap on liability',
      'add liability limitation clause'
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'LIMITATION OF LIABILITY: To the maximum extent permitted by applicable law, the total aggregate liability of either party under or in connection with this Agreement shall not exceed the total fees paid or payable in the {{liability_period}} months immediately preceding the event giving rise to the claim. Neither party shall be liable for any indirect, incidental, special, punitive or consequential loss or damage, even if advised of the possibility of such loss.',
        variables: { liability_period: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'INDEMNITY', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 73 of the Indian Contract Act, 1872 — Compensation for loss or damage',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'CONSULTANCY_AGREEMENT',
        category: 'INSERT',
        content: 'LIMITATION OF LIABILITY: The maximum aggregate liability of the Consultant to the Client under this Agreement shall not exceed the total fees paid to the Consultant in the {{liability_period}} months preceding the claim. The Consultant shall not be liable for any loss of profits, business, data, or any indirect or consequential damage.',
        variables: { liability_period: 'NUMBER' },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'TERMINATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 73 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'LIMITATION OF LIABILITY: No party shall be liable to the other for any indirect, consequential, special or punitive damages arising out of or in connection with this Joint Venture Agreement. The maximum liability of any party shall be limited to the amount of capital contributed by that party to the Joint Venture.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'DISPUTE', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 73 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
    ]
  },

  {
    name: 'ADD_SEVERABILITY_CLAUSE',
    description: 'Add severability clause ensuring remaining provisions remain valid if any part is unenforceable',
    aliases: [
      'add severability clause',
      'add severability',
      'invalid provision clause',
      'add blue pencil clause',
      'remaining provisions valid',
      'add savings clause',
      'unenforceable provision',
      'add partial invalidity clause',
      'add severance clause',
      'severability provision'
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'SEVERABILITY: If any provision of this Agreement is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, such provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions of this Agreement shall continue in full force and effect as if such invalid provision had never been included.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 57 of the Indian Contract Act, 1872 — Reciprocal promises',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'SEVERABILITY: If any provision of this Agreement is determined to be invalid or unenforceable under applicable law, it shall be deemed modified to the minimum extent necessary to make it valid and enforceable. The invalidity or unenforceability of any provision shall not affect the validity of the remaining provisions.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 57 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'CONSULTANCY_AGREEMENT',
        category: 'INSERT',
        content: 'SEVERABILITY: Should any provision of this Agreement be found void, voidable or unenforceable, such provision shall be read down or severed to the extent necessary, and the remaining provisions shall continue to bind the parties in full force.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 57 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'EMPLOYMENT_AGREEMENT',
        category: 'INSERT',
        content: 'SEVERABILITY: If any provision of this Agreement is held to be unenforceable or invalid under applicable law, such provision shall be modified to the minimum extent necessary, and the remaining terms shall remain in full force.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'NON_DISCLOSURE_AGREEMENT',
        category: 'INSERT',
        content: 'SEVERABILITY: If any provision of this NDA is held unenforceable, such provision shall be modified to make it enforceable, and the validity and enforceability of the remaining provisions shall not be affected.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'SEVERABILITY: If any clause of this Partnership Deed is held void or unenforceable, such clause shall be deemed modified to the extent required to make it valid, and the remaining clauses shall continue to bind the Partners.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Partnership Act, 1932; Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
    ]
  },

  {
    name: 'ADD_PAYMENT_TERMS',
    description: 'Add or clarify payment terms including amount, due date, method and late payment interest',
    aliases: [
      'add payment terms',
      'clarify payment',
      'add payment schedule',
      'add invoice terms',
      'specify payment amount',
      'add late payment interest',
      'add payment clause',
      'add fee payment terms',
      'payment due date',
      'add consideration terms'
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'PAYMENT TERMS: The Client shall pay the Service Provider Rs. {{payment_amount}} per {{payment_period}}. Invoices shall be raised {{invoice_frequency}} and are due within {{payment_days}} days of receipt. Late payments shall attract interest at {{late_interest_rate}}% per month on the outstanding amount. All amounts are exclusive of applicable taxes including GST.',
        variables: {
          payment_amount: 'NUMBER',
          payment_period: 'STRING',
          invoice_frequency: 'STRING',
          payment_days: 'NUMBER',
          late_interest_rate: 'NUMBER'
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'SERVICES', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 64 of the Indian Contract Act, 1872; MSME Payment Act',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'CONSULTANCY_AGREEMENT',
        category: 'INSERT',
        content: 'PAYMENT: The Client shall pay the Consultant a retainer of Rs. {{retainer_amount}} per month, payable within {{payment_days}} days of invoice. TDS at the rate applicable under Section 194J of the Income Tax Act shall be deducted. GST at prevailing rate shall be charged in addition to the retainer amount.',
        variables: {
          retainer_amount: 'NUMBER',
          payment_days: 'NUMBER'
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'ENGAGEMENT', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 194J Income Tax Act 1961; Indian Contract Act 1872',
        related_forms: [],
        compliance_deadline: null,
      },
    ]
  },

  {
    name: 'ADD_ENTIRE_AGREEMENT_CLAUSE',
    description: 'Add entire agreement / integration clause stating this is the complete agreement superseding prior discussions',
    aliases: [
      'add entire agreement clause',
      'add integration clause',
      'add merger clause',
      'add complete agreement clause',
      'supersedes prior agreements',
      'add no prior representations',
      'add entire understanding clause',
      'add completeness clause',
      'add master agreement clause',
      'entire agreement integration'
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'ENTIRE AGREEMENT: This Agreement, including all schedules and annexures, constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior negotiations, representations, warranties, and understandings of the parties whether written or oral. No amendment shall be effective unless made in writing and signed by authorized representatives of both parties.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872; Parol Evidence Rule',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'JOINT_VENTURE_AGREEMENT',
        category: 'INSERT',
        content: 'ENTIRE AGREEMENT: This Joint Venture Agreement represents the entire and integrated agreement between the parties with respect to the Joint Venture and supersedes all prior agreements, understandings, negotiations and representations. No modifications shall be valid unless in writing and signed by all parties.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'NON_DISCLOSURE_AGREEMENT',
        category: 'INSERT',
        content: 'ENTIRE AGREEMENT: This Non-Disclosure Agreement contains the entire understanding between the parties regarding confidentiality of the subject matter and supersedes any prior oral or written agreements relating thereto. Any modification must be in writing signed by both parties.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
    ]
  },

  {
    name: 'ADD_AMENDMENT_CLAUSE',
    description: 'Add clause stating agreement can only be amended in writing signed by all parties',
    aliases: [
      'add amendment clause',
      'add modification clause',
      'changes must be written',
      'add variation clause',
      'add no oral amendment',
      'add written modification only',
      'add change control clause',
      'amendment in writing',
      'add no waiver clause',
      'modification requires writing'
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'AMENDMENT AND WAIVER: No amendment, modification, or supplement to this Agreement shall be valid or binding unless made in writing and duly signed by authorized representatives of both parties. No waiver of any breach shall constitute a waiver of any subsequent breach. No failure to exercise any right shall constitute a waiver of such right.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'PARTNERSHIP_DEED',
        category: 'INSERT',
        content: 'AMENDMENT: This Partnership Deed may be amended or modified only by a written instrument signed by all Partners. No oral modification shall be binding. Any amendment shall be duly stamped as required under the Indian Stamp Act, 1899.',
        variables: {},
        placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Indian Partnership Act, 1932; Indian Stamp Act, 1899',
        related_forms: [],
        compliance_deadline: null,
      },
    ]
  },

  {
    name: 'ADD_INDEMNIFICATION_CLAUSE',
    description: 'Add indemnification clause for losses, claims and third party actions',
    aliases: [
      'add indemnification clause',
      'add indemnity clause',
      'add hold harmless',
      'add indemnify clause',
      'add protection against claims',
      'add third party claim protection',
      'add indemnity provision',
      'add defense obligation',
      'indemnification liability',
      'add defend indemnify hold harmless'
    ],
    clauses: [
      {
        document_type: 'SERVICE_LEVEL_AGREEMENT',
        category: 'INSERT',
        content: 'INDEMNIFICATION: Each party (the "Indemnifying Party") shall indemnify, defend, and hold harmless the other party and its officers, directors, employees, and agents (the "Indemnified Parties") from and against any claims, damages, losses, penalties, and reasonable legal fees arising out of: (a) breach of any representation, warranty or obligation under this Agreement by the Indemnifying Party; (b) negligence or willful misconduct of the Indemnifying Party; (c) any infringement of third party intellectual property rights by the Indemnifying Party.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'LIMITATION OF LIABILITY', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 124 of the Indian Contract Act, 1872 — Contract of Indemnity',
        related_forms: [],
        compliance_deadline: null,
      },
      {
        document_type: 'CONSULTANCY_AGREEMENT',
        category: 'INSERT',
        content: 'INDEMNIFICATION: The Consultant shall indemnify and hold harmless the Client against all claims, losses and expenses arising from: (a) breach of this Agreement by the Consultant; (b) gross negligence or wilful misconduct of the Consultant; (c) infringement of any third party rights by deliverables provided by the Consultant.',
        variables: {},
        placement_rules: { action: 'INSERT_AFTER', anchor: 'LIABILITY', anchor_type: 'HEADING', fallback: 'BOTTOM' },
        legal_basis: 'Section 124 of the Indian Contract Act, 1872',
        related_forms: [],
        compliance_deadline: null,
      },
    ]
  },

  // ── BOARD RESOLUTION SPECIFIC ──

  {
    name: 'ADD_CHANGE_SIGNATORIES_BANK',
    description: 'Authorize change or addition of authorized signatories for existing bank account',
    aliases: [
      'change bank signatories',
      'add new signatory bank',
      'remove bank signatory',
      'change authorized signatory',
      'update bank signatories',
      'add signatory bank account',
      'replace bank signatory',
      'modify bank mandate',
      'add signatory to bank account',
      'change bank mandate'
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'CHANGE OF SIGNATORIES: RESOLVED THAT the following changes be made to the list of authorized signatories for the Company\'s Bank Account No. {{account_number}} with {{bank_name}}, {{branch_name}} Branch:\n\nADDED as authorized signatory: {{new_signatory_name}}, {{new_signatory_designation}}\n\nREMOVED as authorized signatory: {{removed_signatory_name}}\n\nFURTHER RESOLVED THAT {{authorized_person}} be and is hereby authorized to submit the necessary forms and documents to the Bank to give effect to the above change.',
        variables: {
          account_number: 'STRING',
          bank_name: 'STRING',
          branch_name: 'STRING',
          new_signatory_name: 'STRING',
          new_signatory_designation: 'STRING',
          removed_signatory_name: 'STRING',
          authorized_person: 'STRING'
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 179 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      }
    ]
  },

  {
    name: 'ADD_GST_REGISTRATION_AUTHORIZATION',
    description: 'Authorize company representative to obtain GST registration',
    aliases: [
      'add gst registration',
      'authorize gst',
      'add gstin registration authority',
      'gst registration clause',
      'authorize gst filing',
      'add gst authorized signatory',
      'gst new registration',
      'authorize apply for gstin',
      'add gst application authority',
      'gst registration board resolution'
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'GST REGISTRATION: RESOLVED THAT {{authorized_person}}, {{designation}}, be and is hereby authorized to make an application for registration of the Company under the Goods and Services Tax Act, 2017 and to do all such acts, deeds and things as may be necessary to obtain GSTIN, including submission of all required documents, verification of details on the GST Portal and signing of the GST registration application.',
        variables: {
          authorized_person: 'STRING',
          designation: 'STRING'
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 22 of the CGST Act, 2017; Rule 8 GST Registration Rules',
        related_forms: ['REG-01'],
        compliance_deadline: 'Within 30 days of becoming liable for registration',
      }
    ]
  },

  {
    name: 'ADD_INTERCORPORATE_LOAN_AUTHORIZATION',
    description: 'Authorize grant of loan to another company under Section 186',
    aliases: [
      'add intercorporate loan',
      'grant loan to subsidiary',
      'add loan to company',
      'authorize section 186 loan',
      'add inter company loan',
      'grant corporate loan',
      'add loan to associate company',
      'intercorporate lending authorization',
      'add section 186 authorization',
      'authorize loan to related company'
    ],
    clauses: [
      {
        document_type: 'BOARD_RESOLUTION',
        category: 'INSERT',
        content: 'INTER-CORPORATE LOAN: RESOLVED THAT pursuant to Section 186 of the Companies Act, 2013, the Board of Directors hereby approves grant of a loan of Rs. {{loan_amount}} (Rupees {{loan_amount_words}} only) to {{borrower_company_name}} (CIN: {{borrower_cin}}), at an interest rate of {{interest_rate}}% per annum, repayable within {{repayment_period}}, subject to the investment limits prescribed under Section 186(2) of the Companies Act, 2013.\n\nFURTHER RESOLVED THAT the Board confirms that the aggregate of loans, investments and guarantees of the Company after this loan shall not exceed the limit prescribed under Section 186(2).',
        variables: {
          loan_amount: 'NUMBER',
          loan_amount_words: 'STRING',
          borrower_company_name: 'STRING',
          borrower_cin: 'STRING',
          interest_rate: 'NUMBER',
          repayment_period: 'STRING'
        },
        placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED THAT', anchor_type: 'REGEX', fallback: 'BOTTOM' },
        legal_basis: 'Section 186 of the Companies Act, 2013',
        related_forms: [],
        compliance_deadline: null,
      }
    ]
  },

  // ── LEASE AGREEMENT INTENTS ──
  {
    name: 'ADD_LOCK_IN_BREACH_COMPENSATION_LEASE',
    description: 'Add a lock-in breach compensation clause specifying penalty if either party terminates during the lock-in period',
    aliases: [
      'add lock in breach penalty',
      'add lock in breach compensation lease',
      'add early termination penalty lessor lease',
      'lessor exit penalty during lock in',
      'breach of lock in clause rent agreement',
      'exit compensation during lockin'
    ],
    clauses: [
      {
        document_type: 'LEASE_AGREEMENT',
        category: 'INSERT',
        content: 'BREACH OF LOCK-IN: In the event that either Party terminates this Deed during the lock-in period, or breaches any material covenant hereunder forcing the other Party to terminate, the breaching Party shall pay to the non-breaching Party an amount equivalent to {{compensation_months}} months\' rent as compensation, in addition to any other damages or remedies available under law.',
        variables: { compensation_months: 'NUMBER' },
        placement_rules: {
          action: 'INSERT_AFTER',
          anchor: 'LOCK-IN PERIOD',
          anchor_type: 'HEADING',
          fallback: 'BOTTOM'
        },
        legal_basis: 'Section 74 of the Indian Contract Act, 1872 — Compensation for breach of contract',
        related_forms: [],
        compliance_deadline: null,
      }
    ]
  },
  {
    name: 'ADD_STRUCTURAL_REPAIRS_OBLIGATION',
    description: 'Clarify responsibility for structural and major repairs versus minor day-to-day repairs in lease',
    aliases: [
      'add repair obligation',
      'who does repairs in lease',
      'major repairs lessor obligation',
      'add structural repairs clause lease',
      'maintenance responsibility rent agreement',
      'add repair clause lease',
      'add minor repairs lessee',
      'add repair cost allocation',
      'repairs and maintenance clause lease',
      'add landlord repair duty'
    ],
    clauses: [
      {
        document_type: 'LEASE_AGREEMENT',
        category: 'INSERT',
        content: 'REPAIRS AND MAINTENANCE: (a) MAJOR REPAIRS: All major structural repairs, repairs to the roof, external walls, main plumbing lines, main electrical wiring, and structural defects shall be carried out by the Lessor at the Lessor\'s own cost within 30 days of written intimation by the Lessee. (b) MINOR REPAIRS: Day-to-day minor repairs such as repair of tap washers, door handles, minor plastering, painting of minor chips, repairs to fittings provided by the Lessee, shall be carried out by the Lessee at the Lessee\'s cost. (c) If the Lessor fails to carry out major repairs within 30 days, the Lessee may carry out the repairs and deduct the cost from the monthly rent, after giving an additional 15 days\' notice.',
        variables: {},
        placement_rules: {
          action: 'INSERT_AFTER',
          anchor: 'OBLIGATIONS OF THE LESSOR',
          anchor_type: 'HEADING',
          fallback: 'BOTTOM'
        },
        legal_basis: 'Section 108 of the Transfer of Property Act, 1882 — Rights and liabilities of lessor and lessee',
        related_forms: [],
        compliance_deadline: null,
      }
    ]
  },
];

// ─────────────────────────────────────────────────────────────
// HELPER — Normalize alias phrase
// ─────────────────────────────────────────────────────────────

function normalizeAlias(alias: string): string {
  return alias
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\b(please|the|a|an|could|you|insert|add|put|show|make|in|for|to|into|section)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────────────────────────
// POST HANDLER
// ─────────────────────────────────────────────────────────────

export async function POST() {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const results: Record<string, unknown>[] = [];

  for (const intentDef of INTENTS_TO_SEED) {
    try {
      // 1. Generate embedding from description
      const embedding = await getEmbedding(intentDef.description);

      // 2. Upsert intent (no-op if already exists by name)
      const { data: intent, error: intentError } = await docDb
        .from('intents')
        .upsert(
          { name: intentDef.name, description: intentDef.description, embedding },
          { onConflict: 'name' }
        )
        .select('id')
        .single();

      if (intentError || !intent) {
        results.push({ intent: intentDef.name, error: intentError?.message });
        continue;
      }

      // 3. Upsert aliases
      for (const alias of intentDef.aliases) {
        const phrase = normalizeAlias(alias);
        if (phrase) {
          await docDb
            .from('intent_aliases')
            .upsert({ phrase, intent_id: intent.id }, { onConflict: 'phrase' });
        }
      }

      // 4a. Handle legacy sampleClause format (existing 4 intents)
      if (intentDef.sampleClause) {
        const { data: clause, error: clauseError } = await docDb
          .from('clauses')
          .insert({ ...intentDef.sampleClause, version: 1, is_active: true })
          .select('id')
          .single();

        if (clauseError || !clause) {
          results.push({ intent: intentDef.name, error: 'Clause creation failed: ' + clauseError?.message });
          continue;
        }

        await docDb.from('rules').upsert(
          {
            intent_id: intent.id,
            clause_id: clause.id,
            document_type: intentDef.sampleClause.document_type,
          },
          { onConflict: 'intent_id, document_type' }
        );

        results.push({ intent: intentDef.name, status: 'seeded', intentId: intent.id, clauseId: clause.id });
        continue;
      }

      // 4b. Handle new clauses[] format (one clause + rule per document_type)
      if (intentDef.clauses && intentDef.clauses.length > 0) {
        const clauseResults: { document_type: string; clauseId: string }[] = [];

        for (const clauseDef of intentDef.clauses) {
          const { data: clause, error: clauseError } = await docDb
            .from('clauses')
            .insert({ ...clauseDef, version: 1, is_active: true })
            .select('id')
            .single();

          if (clauseError || !clause) {
            results.push({
              intent: intentDef.name,
              document_type: clauseDef.document_type,
              error: 'Clause creation failed: ' + clauseError?.message,
            });
            continue;
          }

          await docDb.from('rules').upsert(
            {
              intent_id: intent.id,
              clause_id: clause.id,
              document_type: clauseDef.document_type,
            },
            { onConflict: 'intent_id, document_type' }
          );

          clauseResults.push({ document_type: clauseDef.document_type, clauseId: clause.id });
        }

        results.push({
          intent: intentDef.name,
          status: 'seeded',
          intentId: intent.id,
          clauses: clauseResults,
        });
        continue;
      }

      results.push({ intent: intentDef.name, status: 'skipped — no clauses defined' });
    } catch (e: unknown) {
      results.push({ intent: intentDef.name, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ total: results.length, results });
}
