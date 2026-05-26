// src/lib/template-engine.ts
// Secure and simple client/server legal template compiler.

/**
 * Replace placeholders like {company_name} or {{company_name}} in template text with active values.
 */
export function populateTemplate(bodyText: string, variables: Record<string, string | null | undefined>): string {
  let compiled = bodyText

  Object.entries(variables).forEach(([key, val]) => {
    const valueToInsert = val !== undefined && val !== null ? String(val) : `[Insert ${key.replace(/_/g, ' ').toUpperCase()}]`
    
    // Support both single-curly {placeholder} and double-curly {{placeholder}} tags
    compiled = compiled.replaceAll(`{${key}}`, valueToInsert)
    compiled = compiled.replaceAll(`{{${key}}}`, valueToInsert)
  })

  return compiled
}

/**
 * Checks for required variables that are empty or null.
 */
export function getMissingFields(
  requiredFields: { key: string; label: string; hint?: string }[], 
  variables: Record<string, any>
): { key: string; label: string; hint?: string }[] {
  return requiredFields.filter((field) => {
    const val = variables[field.key]
    return val === undefined || val === null || val === 'null' || val === ''
  })
}
