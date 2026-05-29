import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''

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

    let documentContent = ''
    let fellBackToStandard = false

    if (use_ai && template.ai_system_prompt) {
      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Missing Gemini API configuration for AI generation' },
          { status: 500 }
        )
      }

      // AI-powered generation
      const fieldsSummary = Object.entries(form_data || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      const promptText = `Generate a complete ${template.name} using these details:

${fieldsSummary}

Base template format:
${template.template_content}

Instructions:
1. Fill all {{PLACEHOLDERS}} with provided data.
2. CRITICAL FOR AI-ENHANCED GENERATION: Do not simply copy-paste raw user inputs from the form fields. Read, understand, and frame them in professional, polished Indian corporate legal terminology (e.g., if the user enters 'Rs. 10,000 per Board Meeting attended' in a remuneration field, frame it elegantly in the resolution: 'RESOLVED FURTHER THAT the sitting fees/remuneration payable to the Director shall be Rs. 10,000 (Rupees Ten Thousand only) per meeting of the Board attended by them...').
3. Always spell out numeric amounts in words, like 'Rs. 10,000 (Rupees Ten Thousand only)'.
4. Ensure all mandatory clauses per Companies Act / ICSI SS-1 are present.
5. If any field is empty, use appropriate placeholder text [TO BE FILLED].
6. Maintain exact formatting — do not add markdown wrapping or post-text notes.
7. Output only the final document text, nothing else.`

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

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
          console.warn('Gemini generation failed, falling back to standard substitution. Status:', response.status, errorJson)
          fellBackToStandard = true
        } else {
          const data = await response.json()
          documentContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          if (!documentContent) {
            fellBackToStandard = true
          }
        }
      } catch (err) {
        console.error('Gemini call failed with error, falling back:', err)
        fellBackToStandard = true
      }
    }

    if (!use_ai || !template.ai_system_prompt || fellBackToStandard) {
      // Simple template substitution
      documentContent = template.template_content
      Object.entries(form_data || {}).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        documentContent = documentContent.replace(
          regex, 
          String(value || `[${key}]`)
        )
      })
      
      // Replace any remaining placeholders
      documentContent = documentContent.replace(
        /{{[A-Z_]+}}/g,
        '[TO BE FILLED]'
      )
    }

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
