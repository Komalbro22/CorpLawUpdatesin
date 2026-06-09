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

  // 1. Clean up party preamble details based on entity type (individual vs company/firm)
  // Individual cleanup: remove CIN reference, age if empty, registered office reference
  text = text
    .replace(/(an\s+individual,?\s+aged\s+\d+\s+years)\s*\/[^,]*CIN:[^,]*,\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, '$1, residing at')
    .replace(/(an\s+individual,?\s+aged\s+\d+\s+years)\s*\/[^,]*CIN:\s*,?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, '$1, residing at')
    .replace(/(an\s+individual,?\s+aged\s+\d+\s+years)\s*\/[^,]*CIN:\s*[^,]*,\s*residing\s+at/gi, '$1, residing at')
    .replace(/an\s+individual,?\s*\/[^,]*CIN:\s*,?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, 'an individual, residing at')
    .replace(/an\s+individual,?\s+residing\s+at\s*\/[^,]*office\s+at/gi, 'an individual, residing at')
    .replace(/an\s+individual,?\s+residing\s+at\s*\/[^,]*address\s+at/gi, 'an individual, residing at')

  // 2. Company / Firm / LLP cleanup: remove age reference, clean up registered office
  text = text
    .replace(/,\s*aged\s*\d*\s*years\s*\/(\s*CIN:\s*[A-Z0-9]+),?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, ', $1, having registered office at')
    .replace(/,\s*aged\s*\d*\s*years\s*\/(\s*CIN:\s*,?\s*),?\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, ', having registered office at')
    .replace(/,\s*aged\s*\d*\s*years\s*,\s*(residing\s+at\s*\/)?\s*having\s+(registered|residential)?\s*office\s+at/gi, ', having registered office at')

  // 3. Clean up slash choices in party descriptions if any are left
  text = text
    .replace(/residing\s+at\s*\/\s*having\s+registered\s+office\s+at/gi, 'residing at')
    .replace(/residing\s+at\s*\/\s*having\s+its\s+registered\s+office\s+at/gi, 'residing at')
    .replace(/aged\s+\d+\s+years\s*\/\s*CIN:\s*,?\s*/gi, '')

  // 4. Grammar and preposition cleanup
  text = text
    .replace(/borne\s+by\s+shared\s+equally/gi, 'shared equally')
    .replace(/borne\s+by\s+shared/gi, 'shared')

  // 5. Area description cleanups to avoid unit duplication (e.g. "1 Acre sq. ft. / sq. mtrs.")
  text = text
    .replace(/(\d+)\s*(acre|acres|sq\.\s*ft|sq\s*ft|square\s*feet|sq\.\s*mtrs?|square\s*meters?)\.?\s*sq\.\s*ft\.?\s*\/\s*sq\.\s*mtrs?\.?/gi, '$1 $2')

  // 6. Clean up trailing empty labels/sections at the end of the document
  text = text
    .replace(/Notarized\/Registered\s+at:\s*$/gmi, '')
    .replace(/Registration\s+Office\s+Details:\s*$/gmi, '')

  // 7. Common typo corrections in legal/currency text
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
  // Format standard am/pm separators: 11.00 am -> 11:00 am
  formatted = formatted.replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');
  // Format standard am/pm case and spacing: 11:00 am -> 11:00 A.M.
  formatted = formatted.replace(/\b(am|pm)\b/gi, (match) => {
    return match.toUpperCase().split('').join('.') + '.';
  });
  // Also catch generic AM / PM without word bounds or with periods already
  formatted = formatted.replace(/a\.?m\.?/gi, 'A.M.');
  formatted = formatted.replace(/p\.?m\.?/gi, 'P.M.');
  // Ensure double periods aren't created (e.g. A.M.. -> A.M.)
  formatted = formatted.replace(/A\.M\.\./g, 'A.M.');
  formatted = formatted.replace(/P\.M\.\./g, 'P.M.');
  return formatted;
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

    // Format dates to Indian legal format (e.g. 27th May, 2026) and format times (e.g. 11:00 A.M.)
    if (form_data && typeof form_data === 'object') {
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

    // Client IP Parsing (split proxy chains, take first value)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '127.0.0.1'

    // Load rate limit and whitelist settings
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
${customInstructions ? `\nUser's Custom Instructions / Special Conditions / Reasons for Generation:\n${customInstructions}\n` : ''}

Base template format:
${template.template_content}

Instructions:
1. Fill all {{PLACEHOLDERS}} with provided data.
2. CRITICAL FOR AI-ENHANCED GENERATION: Do not simply copy-paste raw user inputs from the form fields. Read, understand, and frame them in professional, polished Indian corporate legal terminology (e.g., if the user enters 'Rs. 10,000 per Board Meeting attended' in a remuneration field, frame it elegantly in the resolution: 'RESOLVED FURTHER THAT the sitting fees/remuneration payable to the Director shall be Rs. 10,000 (Rupees Ten Thousand only) per meeting of the Board attended by them...').
3. Always spell out numeric amounts in words, like 'Rs. 10,000 (Rupees Ten Thousand only)'.
4. Ensure all mandatory clauses per Companies Act / ICSI SS-1 / other applicable acts are present.
5. If any field is empty, use appropriate placeholder text [TO BE FILLED]. If optional fields like Schedule I or Schedule II are empty, write '[None described / Not applicable]' or adjust based on the user's custom instructions.
${customInstructions ? `6. Weave the user's custom instructions, reasons, and special conditions naturally and professionally into the draft's clauses.\n` : ''}7. Maintain exact formatting — do not add markdown wrapping or post-text notes.
8. Output only the final document text, nothing else.`

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
            
            // Extract token usage metadata
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

      // Build fields map for easy lookup of requirement status
      const fieldsMap = new Map<string, any>()
      if (template.fields && Array.isArray(template.fields)) {
        template.fields.forEach((f: any) => {
          fieldsMap.set(f.id, f)
        })
      }

      // First, substitute fields present in form_data
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

      // Next, replace any defined fields that were not passed in form_data at all
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
      
      // Replace any other remaining placeholders that are not in template fields
      documentContent = documentContent.replace(
        /{{[A-Z_]+}}/g,
        '[TO BE FILLED]'
      )

      // Append custom instructions if present, so they are not ignored
      const customInstructions = form_data?.custom_instructions || ''
      if (customInstructions && String(customInstructions).trim()) {
        const trimmedIns = String(customInstructions).trim()
        const customBlock = `\n\nADDITIONAL CONDITIONS / SPECIAL CLAUSES:\n${trimmedIns}\n\n`
        
        if (documentContent.includes('IN WITNESS WHEREOF')) {
          documentContent = documentContent.replace('IN WITNESS WHEREOF', `${customBlock}IN WITNESS WHEREOF`)
        } else {
          documentContent = documentContent + customBlock
        }
      }

      // Post-process the text to clean up consecutive commas, spaces before commas, trailing commas, etc.
      // caused by empty optional fields.
      documentContent = documentContent
        // Replace multiple consecutive commas (with optional whitespace) with a single comma
        .replace(/,\s*(,\s*)+/g, ', ')
        // Remove spaces before commas
        .replace(/\s+,\s*/g, ', ')
        // Remove a comma right before a period (e.g. "something, .")
        .replace(/,\s*\./g, '.')
        // Clean up a trailing comma right before the end of a line or paragraph
        .replace(/,\s*$/gm, '')
        .trim()
    }

    // Post-process the generated text to clean up phrasing, slashes, prepositions, empty labels, and common spelling typos
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
