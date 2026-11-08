interface JsonLdProps {
  data?: Record<string, unknown>
  schema?: Record<string, unknown>
  id?: string
}

export default function JsonLd({ data, schema, id }: JsonLdProps) {
  const payload = data || schema || {}
  const jsonString = JSON.stringify(payload).replace(/</g, '\\u003c')
  return (
    <script
      id={id}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: jsonString
      }}
    />
  )
}
