-- Keep the downloadable generator aligned with the prescribed SH-4 field layout.
-- Source checked: MCA, Companies (Share Capital and Debentures) Rules, 2014, Form SH-4.
UPDATE document_templates
SET
  description = 'Editable Form SH-4 securities transfer form for physical securities under Section 56 of the Companies Act, 2013 and Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014.',
  template_content = $template$
FORM NO. SH-4
SECURITIES TRANSFER FORM
[Pursuant to section 56 of the Companies Act, 2013 and sub-rule (1) of rule 11 of the Companies (Share Capital and Debentures) Rules, 2014]

Date of execution: {{TRANSFER_DATE}}

FOR THE CONSIDERATION stated below, the Transferor(s) named do hereby transfer to the Transferee(s) named the securities specified below, subject to the conditions on which the securities are now held. The Transferee(s) agree to accept and hold the securities subject to those conditions.

CIN: {{COMPANY_CIN}}
Name of the company (in full): {{COMPANY_NAME}}
Name of stock exchange where the company is listed, if any: {{STOCK_EXCHANGE}}

DESCRIPTION OF SECURITIES
Kind / class of securities: {{SECURITY_CLASS}}
Nominal value of each security: ₹{{NOMINAL_VALUE}}
Amount called up per security: ₹{{CALLED_UP_VALUE}}
Amount paid up per security: ₹{{PAID_UP_VALUE}}
Number of securities being transferred (figures): {{NUMBER_OF_SECURITIES}}
Number of securities being transferred (words): {{NUMBER_OF_SECURITIES_WORDS}}
Consideration received (figures): ₹{{CONSIDERATION}}
Consideration received (words): {{CONSIDERATION_WORDS}}
Distinctive number: From {{DISTINCTIVE_FROM}} To {{DISTINCTIVE_TO}}
Corresponding certificate number(s): {{CERTIFICATE_NUMBERS}}

TRANSFEROR PARTICULARS
Name(s): {{TRANSFEROR_NAME}}
Folio No.: {{TRANSFEROR_FOLIO}}
Signature(s): ______________________________

TRANSFEREE PARTICULARS
Name(s): {{TRANSFEREE_NAME}}
Father's / Mother's / Spouse's name: {{TRANSFEREE_RELATIVE_NAME}}
Address: {{TRANSFEREE_ADDRESS}}
Email ID: {{TRANSFEREE_EMAIL}}
Occupation: {{TRANSFEREE_OCCUPATION}}
Signature(s): ______________________________

I/We certify that the duty payable on the transfer of the securities hereby transferred has been paid in accordance with the applicable law.

Signature of witness: ______________________________
Name of witness: {{WITNESS_NAME}}
Address of witness: {{WITNESS_ADDRESS}}

Important: This draft is for physical securities where Form SH-4 applies. Before execution, compare it with the MCA-prescribed form, verify stamp duty and transaction-specific approvals, and submit the duly stamped, dated and executed instrument with the relevant certificate or letter of allotment within the period in section 56, where applicable.
$template$,
  fields = $fields$[
    {"id":"TRANSFER_DATE","label":"Date of Execution","type":"date","required":true,"help_text":"Use the actual execution date."},
    {"id":"COMPANY_CIN","label":"Company CIN","type":"text","required":true,"placeholder":"e.g. U12345MH2020PTC123456"},
    {"id":"COMPANY_NAME","label":"Company Name (in full)","type":"text","required":true},
    {"id":"STOCK_EXCHANGE","label":"Stock Exchange (if listed)","type":"text","required":false,"placeholder":"Leave blank if not listed"},
    {"id":"SECURITY_CLASS","label":"Kind / Class of Securities","type":"text","required":true,"placeholder":"e.g. Equity shares"},
    {"id":"NOMINAL_VALUE","label":"Nominal Value per Security (₹)","type":"text","required":true},
    {"id":"CALLED_UP_VALUE","label":"Amount Called Up per Security (₹)","type":"text","required":true},
    {"id":"PAID_UP_VALUE","label":"Amount Paid Up per Security (₹)","type":"text","required":true},
    {"id":"NUMBER_OF_SECURITIES","label":"Number of Securities (figures)","type":"text","required":true},
    {"id":"NUMBER_OF_SECURITIES_WORDS","label":"Number of Securities (words)","type":"text","required":true},
    {"id":"CONSIDERATION","label":"Consideration Received (₹, figures)","type":"text","required":true},
    {"id":"CONSIDERATION_WORDS","label":"Consideration Received (words)","type":"text","required":true},
    {"id":"DISTINCTIVE_FROM","label":"Distinctive Number — From","type":"text","required":false,"help_text":"Use only where applicable to the certificate."},
    {"id":"DISTINCTIVE_TO","label":"Distinctive Number — To","type":"text","required":false},
    {"id":"CERTIFICATE_NUMBERS","label":"Corresponding Certificate Number(s)","type":"text","required":false},
    {"id":"TRANSFEROR_NAME","label":"Transferor Name(s)","type":"text","required":true},
    {"id":"TRANSFEROR_FOLIO","label":"Transferor Folio Number","type":"text","required":true},
    {"id":"TRANSFEREE_NAME","label":"Transferee Name(s)","type":"text","required":true},
    {"id":"TRANSFEREE_RELATIVE_NAME","label":"Transferee Father / Mother / Spouse Name","type":"text","required":true},
    {"id":"TRANSFEREE_ADDRESS","label":"Transferee Address","type":"textarea","required":true},
    {"id":"TRANSFEREE_EMAIL","label":"Transferee Email ID","type":"text","required":true},
    {"id":"TRANSFEREE_OCCUPATION","label":"Transferee Occupation","type":"text","required":true},
    {"id":"WITNESS_NAME","label":"Witness Name","type":"text","required":true},
    {"id":"WITNESS_ADDRESS","label":"Witness Address","type":"textarea","required":true}
  ]$fields$::jsonb,
  regulation_reference = 'Section 56, Companies Act, 2013; Rule 11 and Form SH-4, Companies (Share Capital and Debentures) Rules, 2014',
  source = 'Ministry of Corporate Affairs — Form SH-4',
  last_verified = '2026-09-04',
  ai_system_prompt = 'Generate only an editable draft that follows the field order of Form SH-4 prescribed under section 56 of the Companies Act, 2013 and rule 11 of the Companies (Share Capital and Debentures) Rules, 2014. Do not add unprescribed warranties, arbitration clauses, declarations, witnesses or party details. Retain all statutory field labels, do not claim a transfer is valid, and include a concise reminder to verify stamp duty and transaction-specific approvals before execution.'
WHERE slug = 'share-transfer-deed';
