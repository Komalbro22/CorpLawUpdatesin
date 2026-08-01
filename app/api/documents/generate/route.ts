import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const GEMINI_KEYS = [
  process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
  process.env.GOOGLE_GEMINI_API_KEY_2 || '',
  process.env.GOOGLE_GEMINI_API_KEY_3 || '',
  process.env.GOOGLE_GEMINI_API_KEY_4 || '',
].map(k => k.trim()).filter(Boolean)

function cleanGeneratedLegalContent(content: string): string {
  let text = content

  // 1. Fix duplicated "Account Account" or "Current Account Account" template bugs
  text = text
    .replace(/\b(Current|Savings|Cash Credit|Overdraft|Escrow|Fixed Deposit)\s+Account\s+Account\b/gi, '$1 Account')
    .replace(/\bAccount\s+Account\b/gi, 'Account')

  // 2. Fix duplicated prepositions (e.g. "at at registered office")
  text = text
    .replace(/\bat\s+at\b/gi, 'at')
    .replace(/\bAT\s+AT\b/g, 'AT')
    .replace(/\bat\s+registered\s+office\b/gi, 'at the Registered Office of the Company')

  // 3. Clean up party preamble details based on entity type (individual vs company/firm)
  text = text
    .replace(/(an\s+individual,?\s+aged\s+\d+\s+years)\s*\/[^,]*CIN:[^,]*,\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, '$1, residing at')
    .replace(/(an\s+individual,?\s+aged\s+\d+\s+years)\s*\/[^,]*CIN:\s*,?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, '$1, residing at')
    .replace(/(an\s+individual,?\s+aged\s+\d+\s+years)\s*\/[^,]*CIN:\s*[^,]*,\s*residing\s+at/gi, '$1, residing at')
    .replace(/an\s+individual,?\s*\/[^,]*CIN:\s*,?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, 'an individual, residing at')
    .replace(/an\s+individual,?\s+residing\s+at\s*\/[^,]*office\s+at/gi, 'an individual, residing at')
    .replace(/an\s+individual,?\s+residing\s+at\s*\/[^,]*address\s+at/gi, 'an individual, residing at')

  // 4. Company / Firm / LLP cleanup: remove age reference, clean up registered office
  text = text
    .replace(/,\s*aged\s*\d*\s*years\s*\/(\s*CIN:\s*[A-Z0-9]+),?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, ', $1, having registered office at')
    .replace(/,\s*aged\s*\d*\s*years\s*\/(\s*CIN:\s*,?\s*),?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, ', having registered office at')
    .replace(/,\s*aged\s*\d*\s*years\s*,\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, ', having registered office at')

  // 5. Clean up slash choices in party descriptions if any are left
  text = text
    .replace(/residing\s+at\s*\/\s*having\s+registered\s+office\s+at/gi, 'residing at')
    .replace(/residing\s+at\s*\/\s*having\s+its\s+registered\s+office\s+at/gi, 'residing at')
    .replace(/aged\s+\d+\s+years\s*\/\s*CIN:\s*,?\s*/gi, '')

  // 6. Grammar and preposition cleanup
  text = text
    .replace(/borne\s+by\s+shared\s+equally/gi, 'shared equally')
    .replace(/borne\s+by\s+shared/gi, 'shared')

  // 7. Area description cleanups to avoid unit duplication
  text = text
    .replace(/(\d+)\s*(acre|acres|sq\.\s*ft|sq\s*ft|square\s*feet|sq\.\s*mtrs?|square\s*meters?)\.?\s*sq\.\s*ft\.?\s*\/\s*sq\.\s*mtrs?\.?/gi, '$1 $2')

  // 8. Clean up trailing empty labels/sections at the end of the document
  text = text
    .replace(/Notarized\/Registered\s+at:\s*$/gmi, '')
    .replace(/Registration\s+Office\s+Details:\s*$/gmi, '')

  // 9. Common typo corrections in legal/currency text
  text = text
    .replace(/\bthirt\b/gi, 'thirty')
    .replace(/\bfourty\b/gi, 'forty')

  return text
}

function formatDateToIndianLegal(dateStr: string): string {
  if (!dateStr) return dateStr;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  
  const year = parseInt(match[1]);
  const monthIdx = parseInt(match[2]) - 1;
  const day = parseInt(match[3]);
  
  if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return dateStr;
  }
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = months[monthIdx];
  
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";
  
  return `${day}${suffix} ${monthName}, ${year}`;
}

function formatTimeToIndianLegal(timeStr: string): string {
  if (!timeStr) return timeStr;
  let formatted = timeStr.trim();
  formatted = formatted.replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');
  formatted = formatted.replace(/\b(am|pm)\b/gi, (match) => {
    return match.toUpperCase().split('').join('.') + '.';
  });
  formatted = formatted.replace(/a\.?m\.?/gi, 'A.M.');
  formatted = formatted.replace(/p\.?m\.?/gi, 'P.M.');
  formatted = formatted.replace(/A\.M\.\./g, 'A.M.');
  formatted = formatted.replace(/P\.M\.\./g, 'P.M.');
  return formatted;
}

/**
 * Pre-generation validation check for deterministic logic errors
 */
function validatePreGeneration(formData: Record<string, any>): string | null {
  // Check Date Logic: Certification Date cannot be before Meeting Date
  const meetingDateStr = formData.MEETING_DATE || formData.meeting_date || formData.date_of_meeting;
  const certDateStr = formData.CERTIFICATION_DATE || formData.certification_date || formData.certified_date;

  if (meetingDateStr && certDateStr) {
    const dMeeting = new Date(meetingDateStr);
    const dCert = new Date(certDateStr);
    if (!isNaN(dMeeting.getTime()) && !isNaN(dCert.getTime())) {
      if (dCert < dMeeting) {
        return `Pre-Validation Error: Certification date (${certDateStr}) cannot be prior to the Board Meeting date (${meetingDateStr}).`;
      }
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { 
      template_slug, 
      form_data, 
      use_ai,
      session_id 
    } = await request.json()

    if (!template_slug) {
      return NextResponse.json(
        { error: 'Missing template_slug' },
        { status: 400 }
      )
    }

    // Run Pre-generation Validation Checklist
    const preValidationError = validatePreGeneration(form_data || {});
    if (preValidationError) {
      return NextResponse.json(
        { error: preValidationError },
        { status: 422 }
      )
    }

    // Get template
    const { data: template, error } = await supabaseAdmin
      .from('document_templates')
      .select('*')
      .eq('slug', template_slug)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Sanitize account types and signing mode
    if (form_data && typeof form_data === 'object') {
      // Fix account type duplication: e.g. "Current Account" -> "Current" if template appends " Account"
      if (form_data.ACCOUNT_TYPE) {
        form_data.ACCOUNT_TYPE = String(form_data.ACCOUNT_TYPE).replace(/\s+Account$/i, '');
      }

      // Deterministic Signing Mode phrase resolution
      // If all signatories are set to SINGLY -> mode phrase is "severally"
      // If all JOINTLY -> "jointly"
      // If both -> "jointly or severally"
      const sigModes = Object.keys(form_data)
        .filter(k => k.includes('SIGN') && k.includes('MODE'))
        .map(k => String(form_data[k]).toUpperCase());

      if (sigModes.length > 0) {
        const allSingly = sigModes.every(m => m.includes('SINGLY') || m.includes('SEVERALLY'));
        const allJointly = sigModes.every(m => m.includes('JOINTLY'));
        if (allSingly) {
          form_data.SIGNING_MODE_PHRASE = 'severally';
        } else if (allJointly) {
          form_data.SIGNING_MODE_PHRASE = 'jointly';
        } else {
          form_data.SIGNING_MODE_PHRASE = 'jointly or severally';
        }
      }

      // Format dates & times to Indian legal format
      if (template.fields && Array.isArray(template.fields)) {
        template.fields.forEach((f: any) => {
          if (f.type === 'date' && form_data[f.id]) {
            form_data[f.id] = formatDateToIndianLegal(form_data[f.id]);
          }
        });
      }
      
      Object.keys(form_data).forEach(key => {
        if (key.includes('TIME') && typeof form_data[key] === 'string') {
          form_data[key] = formatTimeToIndianLegal(form_data[key]);
        }
      });
    }

    // Client IP Parsing
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '127.0.0.1'

    // Load rate limit settings
    const { data: settingsData } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['max_requests_per_ip_daily', 'max_tokens_per_ip_daily', 'whitelisted_ips'])

    const maxRequests = parseInt(settingsData?.find(s => s.key === 'max_requests_per_ip_daily')?.value || '50', 10)
    const maxTokens = parseInt(settingsData?.find(s => s.key === 'max_tokens_per_ip_daily')?.value || '100000', 10)
    const whitelistedIpsStr = settingsData?.find(s => s.key === 'whitelisted_ips')?.value || '127.0.0.1'
    const whitelistedIps = whitelistedIpsStr.split(',').map((s: string) => s.trim()).filter(Boolean)

    const isWhitelisted = whitelistedIps.includes(ip)

    // Rate Limit Checks
    if (use_ai && !isWhitelisted) {
      const startOfToday = new Date()
      startOfToday.setUTCHours(0, 0, 0, 0)
      const startOfTodayIso = startOfToday.toISOString()

      const { data: usageData, error: usageError } = await supabaseAdmin
        .from('generated_documents')
        .select('total_tokens')
        .eq('ip_address', ip)
        .eq('generation_type', 'ai')
        .gte('created_at', startOfTodayIso)

      if (!usageError && usageData) {
        const requestsToday = usageData.length
        const tokensToday = usageData.reduce((acc, row) => acc + (row.total_tokens || 0), 0)

        if (requestsToday >= maxRequests || tokensToday >= maxTokens) {
          return NextResponse.json(
            { error: 'Daily document generation limit exceeded for your IP address. Please try again tomorrow.' },
            { status: 429 }
          )
        }
      }
    }

    let documentContent = ''
    let fellBackToStandard = false
    let promptTokens = 0
    let completionTokens = 0
    let totalTokens = 0
    let generationType: 'ai' | 'standard' | 'fallback' = 'standard'

    if (use_ai && template.ai_system_prompt) {
      if (GEMINI_KEYS.length === 0) {
        return NextResponse.json(
          { error: 'Missing Gemini API configuration for AI generation' },
          { status: 500 }
        )
      }

      // AI-powered generation parameters
      const customInstructions = form_data?.custom_instructions || ''
      const filteredFormData = { ...form_data }
      delete filteredFormData.custom_instructions

      const fieldsSummary = Object.entries(filteredFormData || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      const promptText = `Generate a complete ${template.name} using these details:

${fieldsSummary}
${customInstructions ? `\nUser's Custom Instructions / Special Conditions:\n${customInstructions}\n` : ''}

Base template format:
${template.template_content}

Instructions:
1. Fill all {{PLACEHOLDERS}} with provided data. Ensure CIN (${form_data?.CIN || form_data?.cin || 'N/A'}) and Registered Office are prominently displayed in the document header block.
2. CRITICAL FOR AI-ENHANCED GENERATION: Do not simply copy-paste raw user inputs from the form fields. Read, understand, and frame them in professional, polished Indian corporate legal terminology.
3. Always spell out numeric amounts in words, like 'Rs. 10,000 (Rupees Ten Thousand only)'.
4. Ensure all mandatory clauses per Companies Act / ICSI SS-1 / other applicable acts are present.
${customInstructions ? `5. CUSTOM INSTRUCTIONS DRAFTING RULE:
   - Convert the user's custom instructions into one or more formal "RESOLVED FURTHER THAT [formal legal text]." clauses.
   - Placement: Insert these clauses BEFORE the signature block ("FOR [Company Name]"), as the last "RESOLVED FURTHER THAT" clause inside the resolution body — NEVER place them after signatures or as raw bullet points.
   - Drafting Register: Third-person, passive-formal ("be and is hereby authorized to..."), matching Indian board resolutions under Companies Act, 2013 / SS-1.
   - Reuse the exact company name, bank name, account name, and signatory names defined earlier.
   - Do NOT output bullet points, markdown, or emojis.
   - Do NOT introduce scope creep or unrelated actions.
` : ''}6. Maintain exact legal formatting — output only the final document text, nothing else.
`

      // Attempt Gemini API call with key rotation
      let generationSuccess = false
      for (let i = 0; i < GEMINI_KEYS.length; i++) {
        const apiKey = GEMINI_KEYS[i]
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                role: 'user', 
                parts: [{ text: `System Instructions: ${template.ai_system_prompt}\n\n${promptText}` }] 
              }]
            })
          })

          if (!response.ok) {
            const errorJson = await response.json().catch(() => ({}))
            console.warn(`Gemini generation failed with key index ${i}. Status:`, response.status, errorJson)
            
            const isQuotaError = 
              response.status === 429 || 
              response.status === 403 || 
              JSON.stringify(errorJson).toLowerCase().includes('quota') ||
              JSON.stringify(errorJson).toLowerCase().includes('limit')
              
            if (isQuotaError && i < GEMINI_KEYS.length - 1) {
              console.log(`Rotating to next Gemini key index ${i + 1}...`)
              continue
            }
            break
          }

          const data = await response.json()
          documentContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          
          if (documentContent) {
            generationSuccess = true
            generationType = 'ai'
            
            if (data.usageMetadata) {
              promptTokens = data.usageMetadata.promptTokenCount || 0
              completionTokens = data.usageMetadata.candidatesTokenCount || 0
              totalTokens = data.usageMetadata.totalTokenCount || 0
            }
            break
          }
        } catch (err) {
          console.error(`Gemini call failed on key index ${i}:`, err)
          if (i < GEMINI_KEYS.length - 1) {
            continue
          }
        }
      }

      if (!generationSuccess) {
        fellBackToStandard = true
        generationType = 'fallback'
      }
    }

    if (!use_ai || !template.ai_system_prompt || fellBackToStandard) {
      // Simple template substitution
      documentContent = template.template_content

      const fieldsMap = new Map<string, any>()
      if (template.fields && Array.isArray(template.fields)) {
        template.fields.forEach((f: any) => {
          fieldsMap.set(f.id, f)
        })
      }

      Object.entries(form_data || {}).forEach(([key, value]) => {
        if (key === 'custom_instructions') return

        const field = fieldsMap.get(key)
        const isRequired = field ? field.required !== false : true
        const regex = new RegExp(`{{${key}}}`, 'g')

        let replacement = ''
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          replacement = String(value).trim()
        } else {
          replacement = isRequired ? `[${key}]` : ''
        }

        documentContent = documentContent.replace(regex, replacement)
      })

      if (template.fields && Array.isArray(template.fields)) {
        template.fields.forEach((f: any) => {
          if (f.id === 'custom_instructions') return
          const regex = new RegExp(`{{${f.id}}}`, 'g')
          if (documentContent.includes(`{{${f.id}}}`)) {
            const isRequired = f.required !== false
            const replacement = isRequired ? `[${f.id}]` : ''
            documentContent = documentContent.replace(regex, replacement)
          }
        })
      }
      
      documentContent = documentContent.replace(
        /{{[A-Z_]+}}/g,
        '[TO BE FILLED]'
      )

      // Append custom instructions as formal resolution clause before signature block
      const customInstructions = form_data?.custom_instructions || ''
      if (customInstructions && String(customInstructions).trim()) {
        const trimmedIns = String(customInstructions).trim()
        const customClause = `RESOLVED FURTHER THAT the Company be and is hereby authorized to ${trimmedIns}.`
        const customBlock = `\n\n${customClause}\n\n`
        
        if (documentContent.includes('FOR ')) {
          documentContent = documentContent.replace(/FOR\s+([A-Z0-9\s.()-]+)/i, `${customBlock}FOR $1`)
        } else if (documentContent.includes('IN WITNESS WHEREOF')) {
          documentContent = documentContent.replace('IN WITNESS WHEREOF', `${customBlock}IN WITNESS WHEREOF`)
        } else {
          documentContent = documentContent + customBlock
        }
      }

      documentContent = documentContent
        .replace(/,\s*(,\s*)+/g, ', ')
        .replace(/\s+,\s*/g, ', ')
        .replace(/,\s*\./g, '.')
        .replace(/,\s*$/gm, '')
        .trim()
    }

    // Post-process the generated text to clean up bugs
    documentContent = cleanGeneratedLegalContent(documentContent)

    // Save to database
    const { data: saved, error: saveError } = await supabaseAdmin
      .from('generated_documents')
      .insert({
        template_id: template.id,
        template_name: template.name,
        form_data: form_data || {},
        original_content: documentContent,
        edited_content: documentContent,
        session_id: session_id || null,
        status: 'draft',
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        ip_address: ip,
        generation_type: generationType,
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json(
        { error: `Failed to persist generated document: ${saveError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document_id: saved?.id,
      content: documentContent,
      template_name: template.name,
      fell_back: fellBackToStandard,
    })

  } catch (error: any) {
    console.error('Document generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate document' },
      { status: 500 }
    )
  }
}
