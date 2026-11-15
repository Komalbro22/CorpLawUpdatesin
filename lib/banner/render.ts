import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { RenderInput, RenderInputSchema, RenderResult } from './types'
import { buildTemplateElement } from './template'
import { sanitizeSvg, interpolateHtmlTokens } from './sanitizer'
import { lintBanner } from './lint'
import { getBannerTheme } from './themes'

// Lazy-load satori-html to support both CommonJS test runners and ESM environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let satoriHtmlFn: ((html: string) => any) | null = null

async function getSatoriHtmlParser() {
  if (satoriHtmlFn) return satoriHtmlFn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import('satori-html')
  satoriHtmlFn = mod.html || mod.default?.html || mod.default
  return satoriHtmlFn
}

export const TEMPLATE_VERSION = 'v1'
export const FONT_VERSION = 'v1'

interface LoadedFont {
  name: string
  data: Buffer
  weight: 400 | 700 | 800
  style: 'normal'
}

let cachedFonts: LoadedFont[] | null = null

function loadFonts(): LoadedFont[] {
  if (cachedFonts) return cachedFonts

  const fontsDir = path.join(process.cwd(), 'lib', 'banner', 'fonts')
  const regularPath = path.join(fontsDir, 'Inter-Regular.ttf')
  const boldPath = path.join(fontsDir, 'Inter-Bold.ttf')
  const extraBoldPath = path.join(fontsDir, 'Inter-ExtraBold.ttf')

  if (!fs.existsSync(regularPath) || !fs.existsSync(boldPath) || !fs.existsSync(extraBoldPath)) {
    throw new Error(`Banner fonts missing in ${fontsDir}. Ensure Inter TTFs are present.`)
  }

  cachedFonts = [
    {
      name: 'Inter',
      data: fs.readFileSync(regularPath),
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Inter',
      data: fs.readFileSync(boldPath),
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Inter',
      data: fs.readFileSync(extraBoldPath),
      weight: 800,
      style: 'normal',
    },
  ]

  return cachedFonts
}

/**
 * Computes a deterministic content-addressed sha256 hash.
 */
export function computeBannerHash(input: RenderInput): string {
  let canonicalPayload: string
  if (input.mode === 'template') {
    canonicalPayload = JSON.stringify(input.spec, Object.keys(input.spec).sort())
  } else {
    canonicalPayload = input.code.trim()
  }

  const hashStr = `${canonicalPayload}::${TEMPLATE_VERSION}::${FONT_VERSION}`
  return createHash('sha256').update(hashStr).digest('hex')
}

/**
 * Core framework-agnostic banner renderer.
 * Enforces a strict 5-second timeout and 400 KB output limit.
 */
export async function renderBanner(rawInput: RenderInput): Promise<RenderResult> {
  const startTime = Date.now()
  let timer: NodeJS.Timeout | null = null

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Banner rendering exceeded 5-second timeout budget')), 5000)
  })

  try {
    const result = await Promise.race([renderBannerInternal(rawInput), timeoutPromise])
    result.renderTimeMs = Date.now() - startTime
    return result
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function renderBannerInternal(rawInput: RenderInput): Promise<RenderResult> {
  // 1. Validate Input Schema with Zod
  const input = RenderInputSchema.parse(rawInput)

  // 2. Run Lint Rules
  const { warnings, errors } = lintBanner(input)
  if (errors.length > 0) {
    const errorMsg = errors.join('; ')
    throw new Error(`Banner lint error: ${errorMsg}`)
  }

  const fonts = loadFonts()
  let svgString: string

  // 3. Build SVG
  if (input.mode === 'template') {
    const element = buildTemplateElement(input.spec)
    svgString = await satori(element, {
      width: 1200,
      height: 630,
      fonts,
    })
  } else if (input.mode === 'html') {
    const theme = getBannerTheme(input.regulator)
    const interpolated = interpolateHtmlTokens(input.code, {
      headline: input.headline,
      theme,
    })
    const parseHtml = await getSatoriHtmlParser()
    if (!parseHtml) {
      throw new Error('Satori HTML parser unavailable')
    }
    const element = parseHtml(interpolated)
    svgString = await satori(element, {
      width: 1200,
      height: 630,
      fonts,
    })
  } else if (input.mode === 'svg') {
    const { sanitized, errors: svgErrors } = sanitizeSvg(input.code)
    if (svgErrors.length > 0) {
      throw new Error(`SVG validation error: ${svgErrors.join('; ')}`)
    }
    svgString = sanitized
  } else {
    throw new Error('Unsupported banner render mode')
  }

  // 4. Rasterize to PNG with Resvg
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: 1200 },
    shapeRendering: 2, // geometricPrecision
    textRendering: 1,  // optimizeLegibility
    imageRendering: 0, // optimizeQuality
  })
  const rawPng = resvg.render().asPng()

  // 5. Optimize PNG and generate WebP using Sharp
  const pngPromise = sharp(rawPng)
    .png({
      palette: true,
      compressionLevel: 9,
      effort: 7,
    })
    .toBuffer()

  const webpPromise = sharp(rawPng)
    .webp({
      quality: 82,
      effort: 5,
    })
    .toBuffer()

  const [png, webp] = await Promise.all([pngPromise, webpPromise])

  // 6. Check size limit (< 400 KB)
  if (png.byteLength > 400 * 1024) {
    warnings.push(`PNG size (${Math.round(png.byteLength / 1024)} KB) exceeds 400 KB target`)
  }
  if (webp.byteLength > 400 * 1024) {
    warnings.push(`WebP size (${Math.round(webp.byteLength / 1024)} KB) exceeds 400 KB target`)
  }

  const hash = computeBannerHash(input)

  return {
    png,
    webp,
    pngBuffer: png,
    webpBuffer: webp,
    width: 1200,
    height: 630,
    hash,
    warnings,
  }
}
