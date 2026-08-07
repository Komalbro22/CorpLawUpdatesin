/**
 * Error Logger & Telemetry Module for CorpLawUpdates.in
 * Standardizes error capturing, logging, sanitization, and remote error reporting.
 */

export interface ErrorLogContext {
  component?: string
  action?: string
  digest?: string
  userId?: string
  metadata?: Record<string, unknown>
}

/**
 * Log an error with structured context and optional remote telemetry dispatch.
 */
export function logError(error: unknown, context: ErrorLogContext = {}): void {
  const timestamp = new Date().toISOString()
  const normalizedError = error instanceof Error ? error : new Error(String(error))

  const payload = {
    timestamp,
    message: normalizedError.message,
    name: normalizedError.name,
    stack: normalizedError.stack,
    digest: context.digest,
    component: context.component || 'UnknownComponent',
    action: context.action || 'UnknownAction',
    metadata: context.metadata || {},
  }

  // Structured console logging for dev and server logs
  console.error(`[ErrorLogger] [${payload.component}:${payload.action}]`, payload.message, payload)

  // Remote Telemetry Hook (e.g., Sentry / Datadog / Custom Telemetry Webhook)
  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: unknown, ctx?: unknown) => void } }).Sentry) {
    (window as unknown as { Sentry: { captureException: (e: unknown, ctx?: unknown) => void } }).Sentry.captureException(normalizedError, {
      tags: { component: payload.component, action: payload.action },
      extra: payload,
    })
  }
}

/**
 * Returns a user-friendly, sanitized error message to display in UI components.
 * Prevents internal stack traces or database schema details from leaking.
 */
export function getSanitizedErrorMessage(error: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback
  const message = error instanceof Error ? error.message : String(error)

  // Filter out internal system leak patterns (e.g., SQL queries, Postgres error codes, file paths)
  if (
    message.includes('PG::') ||
    message.includes('supabaseAdmin') ||
    message.includes('relation "') ||
    message.includes('syntax error at') ||
    message.includes('ECONNREFUSED')
  ) {
    return fallback
  }

  return message.slice(0, 300)
}
