import { Lora, Outfit, Source_Sans_3 } from 'next/font/google'

export const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
})

export const fontVariables = `${lora.variable} ${outfit.variable} ${sourceSans.variable}`
