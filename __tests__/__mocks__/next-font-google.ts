const createFontMock = (name: string) => (options?: any) => ({
  className: `mock-${name}`,
  variable: options?.variable || `--font-${name.toLowerCase().replace(/_/g, '-')}`,
  style: { fontFamily: name },
})

export const Lora = createFontMock('Lora')
export const Outfit = createFontMock('Outfit')
export const Source_Sans_3 = createFontMock('Source_Sans_3')
export const Playfair_Display = createFontMock('Playfair_Display')
export const Noto_Serif = createFontMock('Noto_Serif')
export const Inter = createFontMock('Inter')
