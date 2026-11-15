import { IconName } from './types'

// Whitelisted pure SVG paths (Lucide standard vectors)
const ICON_PATHS: Record<IconName, string[]> = {
  'building-bank': [
    'M3 21h18',
    'M3 10h18',
    'M5 6l7-3 7 3',
    'M4 10v11',
    'M20 10v11',
    'M8 14v4',
    'M12 14v4',
    'M16 14v4',
  ],
  coins: [
    'M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2-3.94-.694m-5.154 6.2-.347 1.97M18 7l4.242 4.243-1.414 1.414L16.586 8.414 18 7zm-8 8l4.243 4.243-1.415 1.414L8.586 16.414 10 15z',
  ],
  'file-check': [
    'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z',
    'polyline:14 2 14 8 20 8',
    'path:m9 15 2 2 4-4',
  ],
  'chart-line': [
    'path:m22 7-8.5 8.5-5-5L2 17',
    'polyline:16 7 22 7 22 13',
  ],
  scale: [
    'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z',
    'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z',
    'path:M7 21h10',
    'path:M12 3v18',
    'path:M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2',
  ],
  building: [
    'rect:4 2 16 20 2',
    'path:M9 22v-4h6v4',
    'path:M8 6h.01',
    'path:M16 6h.01',
    'path:M12 6h.01',
    'path:M12 10h.01',
    'path:M12 14h.01',
    'path:M16 10h.01',
    'path:M16 14h.01',
    'path:M8 10h.01',
    'path:M8 14h.01',
  ],
  users: [
    'path:M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'circle:9 7 4',
    'path:M22 21v-2a4 4 0 0 0-3-3.87',
    'path:M16 3.13a4 4 0 0 1 0 7.75',
  ],
  receipt: [
    'path:M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z',
    'path:M16 8h-6',
    'path:M16 12h-6',
    'path:M14 16h-4',
  ],
  globe: [
    'circle:12 12 10',
    'path:M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20',
    'path:M2 12h20',
  ],
  gavel: [
    'path:m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8',
    'path:m16 16 6-6',
    'path:m8 8 6-6',
    'path:m9 7 8 8',
    'path:m21 11-8-8',
  ],
  'shield-check': [
    'path:M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    'path:m9 12 2 2 4-4',
  ],
  'message-square-text': [
    'path:M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    'path:M13 8H7',
    'path:M17 12H7',
  ],
  calendar: [
    'path:M8 2v4',
    'path:M16 2v4',
    'rect:3 4 18 18 2',
    'path:M3 10h18',
  ],
  'alert-triangle': [
    'path:m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z',
    'path:M12 9v4',
    'path:M12 17h.01',
  ],
  clock: [
    'circle:12 12 10',
    'polyline:12 6 12 12 16 14',
  ],
}

/**
 * Generates pure SVG string for an icon from the whitelist.
 */
export function getIconSvg(name: IconName, color = '#FFFFFF', size = 48): string {
  const elements = ICON_PATHS[name] || ICON_PATHS['building-bank']
  const inner = elements.map(def => {
    if (def.startsWith('circle:')) {
      const [, cx, cy, r] = def.split(/[:\s]+/)
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    }
    if (def.startsWith('rect:')) {
      const [, x, y, width, height, rx] = def.split(/[:\s]+/)
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx || 0}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    }
    if (def.startsWith('polyline:')) {
      const points = def.replace('polyline:', '').trim()
      return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    }
    const d = def.startsWith('path:') ? def.replace('path:', '') : def
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${inner}</svg>`
}

/**
 * Returns Satori-compatible VNode object for an icon.
 */
export function getIconElement(name: IconName, color = '#FFFFFF', size = 48) {
  const elements = ICON_PATHS[name] || ICON_PATHS['building-bank']
  return {
    type: 'svg',
    props: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      style: { width: size, height: size },
      children: elements.map((def, idx) => {
        if (def.startsWith('circle:')) {
          const [, cx, cy, r] = def.split(/[:\s]+/)
          return {
            type: 'circle',
            key: idx,
            props: { cx, cy, r, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
          }
        }
        if (def.startsWith('rect:')) {
          const [, x, y, width, height, rx] = def.split(/[:\s]+/)
          return {
            type: 'rect',
            key: idx,
            props: { x, y, width, height, rx: rx || 0, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
          }
        }
        if (def.startsWith('polyline:')) {
          const points = def.replace('polyline:', '').trim()
          return {
            type: 'polyline',
            key: idx,
            props: { points, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
          }
        }
        const d = def.startsWith('path:') ? def.replace('path:', '') : def
        return {
          type: 'path',
          key: idx,
          props: { d, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
        }
      })
    }
  }
}
