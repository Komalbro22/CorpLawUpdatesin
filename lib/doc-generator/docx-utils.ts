import { TextRun, Paragraph } from 'docx'

/**
 * Sanitizes strings for OpenXML documents:
 * - Trims leading/trailing whitespace
 * - Strips invalid control characters that cause XML parsing errors in MS Word
 */
export function cleanText(text: string | null | undefined): string {
  if (!text) return ''
  return String(text)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
}

/**
 * Converts a text string (potentially containing \n newlines) into an array of TextRuns.
 * In OpenXML, raw newline characters inside <w:t> tags corrupt the document in MS Word.
 * This helper breaks lines using { break: 1 } (<w:br/>) instead, ensuring 100% compliance.
 */
type TextRunOptions = Exclude<ConstructorParameters<typeof TextRun>[0], string>

export function safeTextRuns(
  text: string | null | undefined,
  options: Partial<TextRunOptions> = {}
): TextRun[] {
  if (!text) return []
  const clean = String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')

  const lines = clean.split('\n')
  return lines.map(
    (line, idx) =>
      new TextRun({
        ...options,
        text: line,
        break: idx > 0 ? 1 : undefined,
      })
  )
}
