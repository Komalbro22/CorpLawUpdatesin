import { RenderInput } from './types'

export interface LintResult {
  warnings: string[]
  errors: string[]
}

export function lintBanner(input: RenderInput): LintResult {
  const warnings: string[] = []
  const errors: string[] = []

  if (input.mode === 'template') {
    const { spec } = input

    // Headline checks
    if (spec.headline.length > 70) {
      errors.push(`Headline is ${spec.headline.length} chars (maximum allowed is 70)`)
    } else if (spec.headline.length > 52) {
      warnings.push(`Headline is ${spec.headline.length} chars (over 52 chars may cause tight spacing)`)
    } else if (spec.headline.length < 8) {
      errors.push('Headline must be at least 8 characters')
    }

    // Sub checks
    if (spec.sub) {
      if (spec.sub.length > 100) {
        errors.push(`Sub-headline is ${spec.sub.length} chars (maximum is 100)`)
      } else if (spec.sub.length > 90) {
        warnings.push(`Sub-headline is ${spec.sub.length} chars (over 90 chars may crowd layout)`)
      }
    }

    // Action chip checks
    if (spec.action) {
      if (spec.action.length > 46) {
        errors.push(`Action chip is ${spec.action.length} chars (maximum is 46)`)
      } else if (spec.action.length > 42) {
        warnings.push(`Action chip is ${spec.action.length} chars (over 42 chars may overflow)`)
      }
    }

    // Alt text checks
    if (!spec.alt || spec.alt.trim().length < 20) {
      errors.push('Alt text must be at least 20 characters for accessibility and SEO')
    } else if (spec.alt.length > 140) {
      errors.push(`Alt text is ${spec.alt.length} chars (maximum is 140)`)
    }

    // Card value checks across visual modules
    if (spec.visual.type === 'stat_cards') {
      spec.visual.items.forEach((item, idx) => {
        if (item.value.length > 9) {
          errors.push(`Card #${idx + 1} value "${item.value}" exceeds 9 characters`)
        }
      })
    } else if (spec.visual.type === 'before_after') {
      if (spec.visual.before.value.length > 9) {
        errors.push(`Before value "${spec.visual.before.value}" exceeds 9 characters`)
      }
      if (spec.visual.after.value.length > 9) {
        errors.push(`After value "${spec.visual.after.value}" exceeds 9 characters`)
      }
    }
  } else if (input.mode === 'html') {
    // Code mode: HTML subset
    if (!input.alt || input.alt.trim().length < 20) {
      errors.push('Alt text must be at least 20 characters')
    }

    // Font-size under 22px warning
    const fontSizeMatches = input.code.matchAll(/font-size:\s*(\d+)px/gi)
    for (const match of fontSizeMatches) {
      const size = parseInt(match[1], 10)
      if (size < 22) {
        warnings.push(`Detected font-size: ${size}px. Rules recommend minimum 22px for readability on social feeds.`)
        break
      }
    }

    // Satori constraint: <div> with multiple children requires display:flex
    // Detect multi-element tags without display:flex in their inline styles
    if (/<div\b(?![^>]*display\s*:\s*flex)[^>]*>[\s\S]*?<[a-z0-9]+[\s\S]*?<[a-z0-9]+/i.test(input.code)) {
      warnings.push('Satori layout engine requires display:flex on any container with multiple children.')
    }

    if (input.code.length > 65536) {
      errors.push('HTML code exceeds 64 KB limit')
    }
  } else if (input.mode === 'svg') {
    if (!input.alt || input.alt.trim().length < 20) {
      errors.push('Alt text must be at least 20 characters')
    }
    if (input.code.length > 65536) {
      errors.push('SVG code exceeds 64 KB limit')
    }
  }

  return { warnings, errors }
}
