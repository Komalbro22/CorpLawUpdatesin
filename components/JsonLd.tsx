interface JsonLdProps {
  data: Record<string, unknown>
  id?: string
}

export default function JsonLd({ data, id }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, '\\u003c')
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
