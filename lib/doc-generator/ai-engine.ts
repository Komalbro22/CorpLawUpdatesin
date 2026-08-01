// lib/doc-generator/ai-engine.ts
import { AIDocumentModel, DocumentGenerationPayload, MVPDocumentMeta } from './types';

export const MVP_DOCUMENTS_META: MVPDocumentMeta[] = [
  {
    id: 'notice_board_meeting',
    title: 'Notice of Board Meeting & Agenda',
    shortDescription: 'Formally issue a Board Meeting Notice with dynamic agenda items adhering to SS-1 (2024 Revised).',
    actReference: 'Section 173 of Companies Act, 2013 read with Secretarial Standard-1 (SS-1 Revised 2024)',
    category: 'Board Meetings',
    estimatedMinutes: 2,
  },
  {
    id: 'board_resolution_additional_director',
    title: 'Board Resolution for Appointment of Additional Director',
    shortDescription: 'Certified true copy of Board Resolution under Section 161(1) for Additional Director.',
    actReference: 'Section 161(1) of Companies Act, 2013 read with Rule 8 & 18 of Director Rules 2014 & SS-1',
    category: 'Board Resolutions',
    estimatedMinutes: 2,
  },
  {
    id: 'dir2_consent_director',
    title: 'Form DIR-2 (Consent to Act as Director)',
    shortDescription: 'Formal written consent by proposed director to act as a Director of the Company.',
    actReference: 'Section 152(5) of Companies Act, 2013 read with Rule 8 of Director Rules 2014',
    category: 'Director Compliance',
    estimatedMinutes: 1,
  },
];

/**
 * Helper to execute Gemini AI requests with key rotation.
 */
async function runWithKeyRotation<T>(fn: (apiKey: string) => Promise<T>): Promise<T> {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
    process.env.GOOGLE_GEMINI_API_KEY_2 || '',
    process.env.GOOGLE_GEMINI_API_KEY_3 || '',
    process.env.GOOGLE_GEMINI_API_KEY_4 || '',
  ]
    .map(k => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    throw new Error(
      'No Gemini API keys found in environment variables (GOOGLE_GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY_2, etc.).'
    );
  }

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      return await fn(key);
    } catch (err: any) {
      console.warn(`[AI Document Generator] Request failed with key index ${i}. Error:`, err.message || err);
      lastError = err;
      const isQuotaError =
        err.message?.includes('429') ||
        err.message?.includes('403') ||
        err.message?.includes('quota') ||
        err.message?.includes('limit');
      if (isQuotaError && i < keys.length - 1) {
        console.log(`[AI Document Generator] Quota hit on key ${i}. Rotating to key ${i + 1}...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('All Gemini API keys failed.');
}

/**
 * Core AI generation engine that processes user inputs into a structured AIDocumentModel AST.
 */
export async function generateAIDocumentModel(payload: DocumentGenerationPayload): Promise<AIDocumentModel> {
  return runWithKeyRotation(async (apiKey) => {
    const promptText = buildPromptText(payload);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `AI Document Generation failed (status ${response.status}): ${response.statusText} ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
      const parsed: AIDocumentModel = JSON.parse(rawText.trim());
      parsed.generatedAt = parsed.generatedAt || new Date().toISOString();
      return parsed;
    } catch (parseErr) {
      console.error('Failed to parse AI JSON response:', rawText);
      throw new Error('AI returned an invalid document structure. Please try again.');
    }
  });
}

function buildPromptText(payload: DocumentGenerationPayload): string {
  const { docType, company, director, meeting, additional } = payload;

  return `
You are a Master Corporate Secretary and FCS (Fellow of Institute of Company Secretaries of India) specializing in Indian Secretarial Practice under Companies Act, 2013 and ICSI Secretarial Standard-1 (SS-1 Revised version effective 1st April, 2024).

Your task is to generate a 100% legally compliant, audit-ready structured JSON document for: "${docType.toUpperCase()}".

User Provided Parameters:
- Company Name: ${company.companyName}
- CIN: ${company.cin}
- Registered Office: ${company.registeredOffice || 'N/A'}
${director ? `- Director Name: ${director.directorName}\n- DIN: ${director.din}\n- Address: ${director.address || 'N/A'}\n- Designation: ${director.designationCategory || 'Additional Director'}` : ''}
${meeting ? `- Meeting Date: ${meeting.meetingDate || 'N/A'}\n- Meeting Time: ${meeting.meetingTime || 'N/A'}\n- Venue: ${meeting.meetingVenue || 'N/A'}\n- Meeting Serial No.: ${meeting.serialNumber || 'N/A'}` : ''}
${additional ? `- Effective Date: ${additional.effectiveDate || 'N/A'}\n- Authorized Signatory: ${additional.authorizedSignatoryName || 'Director'} (${additional.authorizedSignatoryDesignation || 'Director'})\n- Regularization Contemplated: ${additional.isRegularizationContemplated ? 'Yes' : 'No'}\n- Custom Instructions: ${additional.customInstructions || 'None'}\n- Agenda Topics List: ${additional.agendaTopics?.join(', ') || 'Standard agendas'}` : ''}

MASTER ICSI SS-1 (REVISED 2024) COMPLIANCE RULES:

1. IF DOCUMENT IS "NOTICE_BOARD_MEETING":
   - "documentTitle": "NOTICE OF THE ${meeting?.serialNumber || '03/2026-27'} MEETING OF THE BOARD OF DIRECTORS OF ${company.companyName.toUpperCase()}".
   - "subTitle": "Issued Pursuant to Section 173(3) of the Companies Act, 2013 & Clause 1.2 & 1.3 of ICSI Secretarial Standard on Meetings of the Board of Directors (SS-1 Revised 2024)".
   - "introductoryText": Formal opening statement declaring date, time, venue, and meeting serial number.
   - "agendas": Array of SS-1 Clause 1.3 compliant agenda items:
     - Item 1: To elect a Chairman of the Meeting (SS-1 Clause 5.1).
     - Item 2: To grant leave of absence to Directors, if any (SS-1 Clause 4.2).
     - Item 3: To confirm and sign the Minutes of the previous Board Meeting (SS-1 Clause 7.3.5).
     - Item 4+: User's business topics (e.g. Appointment of Additional Director, Bank Account Opening, Approval of Accounts).
     - Last Item: To transact any other business with the permission of the Chair and consent of the majority of Directors present (SS-1 Clause 1.3.10).
   - MANDATORY NOTES IN "sections": Must include a section titled "NOTES & INSTRUCTIONS TO DIRECTORS" with mandatory statutory clauses:
     a) VIDEO CONFERENCING OPTION (SS-1 Clause 1.3.4 & Rule 3): "Directors are informed that they may attend and participate in the meeting through Video Conferencing (VC) or Other Audio Visual Means (OAVM) pursuant to Section 173(2) of the Companies Act, 2013 read with Rule 3 of Companies (Meetings of Board and its Powers) Rules, 2014. Any Director intending to participate through VC/OAVM is requested to communicate their intention at least 48 hours prior to the date of the meeting to the Company Secretary / Director (or send annual intimation at the beginning of the calendar year)."
     b) LEAVE OF ABSENCE & DISCLOSURE OF INTEREST (SS-1 Clause 4.2 & Section 184): "Directors unable to attend the meeting are requested to seek Leave of Absence in writing. Directors are requested to disclose any nature of concern or interest in any item of business to be transacted as required under Section 184 of the Companies Act, 2013."
     c) QUORUM REQUIREMENT (SS-1 Clause 3.4 & Section 174): "The quorum for the Board Meeting shall be one-third of the total strength of the Board or two Directors, whichever is higher, as per Section 174 of the Companies Act, 2013. Quorum shall be present throughout the meeting."
     d) NOTICE PERIOD & SERVICE (SS-1 Clause 1.3.6): "Notice of the Meeting is issued at least 7 days prior to the date of the meeting as per Section 173(3) of the Act and SS-1."
   - "concludingText": "By Order of the Board of Directors / For ${company.companyName}".

2. IF DOCUMENT IS "BOARD_RESOLUTION_ADDITIONAL_DIRECTOR":
   - "documentTitle": "CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${company.companyName.toUpperCase()}".
   - "subTitle": "Passed pursuant to Section 161(1) of the Companies Act, 2013 read with Rule 8 & Rule 18 of Director Rules, 2014 and ICSI SS-1".
   - Ensure all clauses use formal legalese ("RESOLVED THAT pursuant to...", "FURTHER RESOLVED THAT...").

3. IF DOCUMENT IS "DIR2_CONSENT_DIRECTOR":
   - "documentTitle": "FORM DIR-2 - CONSENT TO ACT AS A DIRECTOR OF A COMPANY".
   - "subTitle": "Pursuant to Section 152(5) of the Companies Act, 2013 and Rule 8 of Companies (Appointment and Qualification of Directors) Rules, 2014".

Return ONLY a valid JSON object matching this structure:
{
  "documentTitle": "string",
  "subTitle": "string",
  "companyDetails": {
    "name": "string",
    "cin": "string",
    "registeredAddress": "string"
  },
  "meetingDetails": {
    "date": "string",
    "time": "string",
    "venue": "string",
    "serialNumber": "string"
  },
  "introductoryText": "string",
  "agendas": [
    {
      "itemNumber": 1,
      "title": "string",
      "description": "string",
      "statutoryReference": "string"
    }
  ],
  "sections": [
    {
      "heading": "string",
      "clauses": ["string"]
    }
  ],
  "concludingText": "string",
  "signatories": [
    {
      "name": "string",
      "designation": "string",
      "dinOrPan": "string"
    }
  ],
  "statutoryCitations": ["string"],
  "complianceNotes": ["string"]
}
`;
}
