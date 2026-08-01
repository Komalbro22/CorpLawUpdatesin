// lib/doc-generator/types.ts

export type MVPDocumentType =
  | 'notice_board_meeting'
  | 'board_resolution_additional_director'
  | 'dir2_consent_director';

export interface MVPDocumentMeta {
  id: MVPDocumentType;
  title: string;
  shortDescription: string;
  actReference: string;
  category: 'Board Meetings' | 'Board Resolutions' | 'Director Compliance';
  estimatedMinutes: number;
}

export interface CompanyDetailsInput {
  companyName: string;
  cin: string;
  registeredOffice: string;
  email?: string;
}

export interface DirectorDetailsInput {
  directorName: string;
  din: string;
  pan?: string;
  address?: string;
  nationality?: string;
  designationCategory?: 'Non-Executive Director' | 'Executive Director' | 'Independent Director' | 'Additional Director';
}

export interface MeetingDetailsInput {
  meetingDate?: string;
  meetingTime?: string;
  meetingVenue?: string;
  serialNumber?: string; // e.g., "02/2026-27"
}

export interface AdditionalParamsInput {
  effectiveDate?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryDesignation?: string;
  isRegularizationContemplated?: boolean;
  agendaTopics?: string[]; // For Notice of Board Meeting
  customInstructions?: string;
}

export interface DocumentGenerationPayload {
  docType: MVPDocumentType;
  company: CompanyDetailsInput;
  director?: DirectorDetailsInput;
  meeting?: MeetingDetailsInput;
  additional?: AdditionalParamsInput;
}

// AI Output AST Schema that feeds into the DOCX compiler & preview UI
export interface AIDocumentSection {
  heading?: string;
  clauses: string[];
}

export interface AIAgendaItem {
  itemNumber: number;
  title: string;
  description: string;
  statutoryReference?: string;
}

export interface AISignatory {
  name: string;
  designation: string;
  dinOrPan?: string;
}

export interface AIDocumentModel {
  documentTitle: string;
  subTitle?: string;
  companyDetails: {
    name: string;
    cin: string;
    registeredAddress?: string;
  };
  meetingDetails?: {
    date?: string;
    time?: string;
    venue?: string;
    serialNumber?: string;
  };
  introductoryText?: string;
  agendas?: AIAgendaItem[];
  sections: AIDocumentSection[];
  concludingText?: string;
  signatories: AISignatory[];
  statutoryCitations: string[];
  complianceNotes: string[];
  generatedAt: string;
}
