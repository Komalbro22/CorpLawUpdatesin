-- Migration: 20260904010000_correct_registered_office_resolution_template.sql
-- Description: Align 'board-resolution-registered-office-change' template in document_templates
-- with Section 12(5)(a) of Companies Act, 2013 read with Rule 25 & 27 of Companies (Incorporation) Rules, 2014.

UPDATE document_templates
SET
  name = 'Board Resolution — Change of Registered Office (Within Same City / Town / Village)',
  description = 'Certified true copy of Board Resolution for shifting registered office within the local limits of the same city, town, or village pursuant to Section 12(5)(a) of Companies Act, 2013 and Rule 25 & 27 of Companies (Incorporation) Rules, 2014, with Form INC-22 filing authorization.',
  template_content = $template$
CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {{COMPANY_NAME}} HELD ON {{MEETING_DATE}} AT {{MEETING_TIME}} AT {{MEETING_VENUE}}

CIN: {{COMPANY_CIN}}
Current Registered Office: {{OLD_ADDRESS}}

DIRECTORS PRESENT:
{{DIRECTORS_PRESENT}}

IN THE CHAIR:
{{CHAIRPERSON_NAME}} (DIN: {{CHAIRPERSON_DIN}})

IN ATTENDANCE:
{{CS_NAME}} (Company Secretary, Membership No.: {{CS_MEMBERSHIP_NO}})

───────────────────────────────────────────────────────────────────────────────
ITEM NO. 1: SHIFTING OF REGISTERED OFFICE OF THE COMPANY WITHIN LOCAL LIMITS
───────────────────────────────────────────────────────────────────────────────

"RESOLVED THAT pursuant to the provisions of Section 12(5)(a) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014 (including any statutory modifications or re-enactments thereof for the time being in force), and subject to the Articles of Association of the Company, the consent and approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company:

FROM:
{{OLD_ADDRESS}}

TO:
{{NEW_ADDRESS}}

within the local limits of the same city, town, or village, with effect from {{EFFECTIVE_DATE}}.

RESOLVED FURTHER THAT the Board takes on record the proof of address for the new registered office, including the latest utility bill (not older than two months) and the No Objection Certificate (NOC) / Rent Agreement executed with the owner of the premises, {{LANDLORD_NAME}}.

RESOLVED FURTHER THAT {{DIRECTOR_NAME}}, Director (DIN: {{DIRECTOR_DIN}}) and/or {{CS_NAME}}, Company Secretary (Membership No.: {{CS_MEMBERSHIP_NO}}) of the Company, be and are hereby severally authorized to digitally sign, certify, and file e-Form INC-22 (Notice of situation or change of situation of registered office) with the Registrar of Companies within the statutory timeline of 30 days from the date of this resolution, along with requisite statutory attachments and fees, as prescribed under Section 12 of the Companies Act, 2013.

RESOLVED FURTHER THAT the authorized signatories be and are hereby severally authorized to submit intimations and applications for change of registered office address to statutory authorities including the GST Department (Form GST REG-14 for core field amendment), Income Tax Department (PAN/TAN update), Banks and Financial Institutions, Central / State Labor authorities, and to arrange necessary amendments on the company's name boards, official stationery, letterheads, and website."

───────────────────────────────────────────────────────────────────────────────
CERTIFIED TRUE COPY

For and on behalf of
{{COMPANY_NAME}}


________________________________________
{{CHAIRPERSON_NAME}}
Chairperson / Director
DIN: {{CHAIRPERSON_DIN}}
Date: {{MEETING_DATE}}
Place: {{MEETING_VENUE}}


Countersigned & Certified by:
________________________________________
{{CS_NAME}}
Company Secretary
Membership No.: {{CS_MEMBERSHIP_NO}}
$template$,
  fields = $fields$[
    {"id":"COMPANY_NAME","label":"Company Name","type":"text","placeholder":"e.g. SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED","required":true},
    {"id":"COMPANY_CIN","label":"Company CIN","type":"text","placeholder":"e.g. U72900DL2024PTC999999","required":true},
    {"id":"MEETING_DATE","label":"Board Meeting Date","type":"date","required":true},
    {"id":"MEETING_TIME","label":"Meeting Time","type":"text","placeholder":"e.g. 11:00 AM IST","required":true},
    {"id":"MEETING_VENUE","label":"Meeting Venue / Place","type":"text","placeholder":"e.g. New Delhi","required":true},
    {"id":"DIRECTORS_PRESENT","label":"Directors Present","type":"textarea","placeholder":"1. Sample Director (DIN: 09999999)\n2. Alternate Director (DIN: 08888888)","required":true},
    {"id":"CHAIRPERSON_NAME","label":"Chairperson Name","type":"text","placeholder":"e.g. Sample Director","required":true},
    {"id":"CHAIRPERSON_DIN","label":"Chairperson DIN","type":"text","placeholder":"e.g. 09999999","required":true},
    {"id":"OLD_ADDRESS","label":"Current Registered Office Address","type":"textarea","placeholder":"Full existing address with PIN code","required":true},
    {"id":"NEW_ADDRESS","label":"New Registered Office Address","type":"textarea","placeholder":"Full new address with PIN code","required":true},
    {"id":"EFFECTIVE_DATE","label":"Effective Date of Address Shifting","type":"date","required":true},
    {"id":"LANDLORD_NAME","label":"Landlord / Premises Owner Name","type":"text","placeholder":"e.g. Premise Owner Enterprises","required":true},
    {"id":"DIRECTOR_NAME","label":"Authorized Director Name","type":"text","placeholder":"e.g. Sample Director","required":true},
    {"id":"DIRECTOR_DIN","label":"Authorized Director DIN","type":"text","placeholder":"e.g. 09999999","required":true},
    {"id":"CS_NAME","label":"Company Secretary Name","type":"text","placeholder":"e.g. CS Sample Sharma","required":false},
    {"id":"CS_MEMBERSHIP_NO","label":"CS Membership Number","type":"text","placeholder":"e.g. A99999","required":false}
  ]$fields$::jsonb,
  regulation_reference = 'Section 12(5)(a), Companies Act, 2013; Rule 25 & 27, Companies (Incorporation) Rules, 2014; Form INC-22',
  source = 'Ministry of Corporate Affairs — e-Form INC-22 & ICSI SS-1 Secretarial Standard on Board Meetings',
  last_verified = '2026-09-04',
  ai_system_prompt = 'Generate a strictly compliant Board Resolution for shifting of registered office within the same city, town, or village pursuant to Section 12(5)(a) of the Companies Act, 2013 and Rule 25 and 27 of the Companies (Incorporation) Rules, 2014. Expressly mandate Form INC-22 filing within 30 days, landlord NOC and utility bill verification, and intimation to banks and GST authorities. Output in certified true copy format.'
WHERE slug = 'board-resolution-registered-office-change';
