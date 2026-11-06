import React from 'react'

export function getColorBrightness(colorStr?: string): number | null {
    if (!colorStr || typeof colorStr !== 'string') return null;
    const s = colorStr.trim().toLowerCase();
    const hexMatch = s.match(/#([0-9a-f]{3,8})/i);
    if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3 || hex.length === 4) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }
    const rgbMatch = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }
    if (['white', 'snow', 'ghostwhite', 'aliceblue', 'ivory', 'floralwhite'].includes(s)) return 255;
    if (s === 'black') return 0;
    return null;
}

export function isBorderAmberOrGold(borderStr?: string): boolean {
    if (!borderStr || typeof borderStr !== 'string') return false;
    const b = borderStr.toLowerCase();
    return (
        b.includes('#c9a227') ||
        b.includes('#f59e0b') ||
        b.includes('#d97706') ||
        b.includes('#b45309') ||
        b.includes('amber') ||
        b.includes('gold') ||
        b.includes('yellow') ||
        b.includes('#eab308') ||
        b.includes('#ca8a04') ||
        b.includes('#d4af37') ||
        b.includes('rgb(201,162,39)') ||
        b.includes('rgb(201, 162, 39)') ||
        b.includes('rgb(245,158,11)') ||
        b.includes('rgb(245, 158, 11)')
    );
}

export function isBorderBlue(borderStr?: string): boolean {
    if (!borderStr || typeof borderStr !== 'string') return false;
    const b = borderStr.toLowerCase();
    return (
        b.includes('#3b82f6') ||
        b.includes('#2563eb') ||
        b.includes('#1d4ed8') ||
        b.includes('#1e40af') ||
        b.includes('blue') ||
        b.includes('#60a5fa')
    );
}

export function isBorderGreen(borderStr?: string): boolean {
    if (!borderStr || typeof borderStr !== 'string') return false;
    const b = borderStr.toLowerCase();
    return (
        b.includes('#22c55e') ||
        b.includes('#16a34a') ||
        b.includes('#15803d') ||
        b.includes('green') ||
        b.includes('#4ade80')
    );
}

export function isBorderRed(borderStr?: string): boolean {
    if (!borderStr || typeof borderStr !== 'string') return false;
    const b = borderStr.toLowerCase();
    return (
        b.includes('#ef4444') ||
        b.includes('#dc2626') ||
        b.includes('#b91c1c') ||
        b.includes('red') ||
        b.includes('rose') ||
        b.includes('#f87171')
    );
}

export function isBorderPurple(borderStr?: string): boolean {
    if (!borderStr || typeof borderStr !== 'string') return false;
    const b = borderStr.toLowerCase();
    return (
        b.includes('#8b5cf6') ||
        b.includes('#7c3aed') ||
        b.includes('#6d28d9') ||
        b.includes('purple') ||
        b.includes('violet') ||
        b.includes('#a78bfa')
    );
}

export function isDarkTableBg(bgStr?: string): boolean {
    if (!bgStr) return false;
    const b = bgStr.toLowerCase().replace(/\s+/g, '');
    const brightness = getColorBrightness(bgStr);
    if (brightness !== null && brightness < 110) return true;
    return (
        b.includes('#1a2a5e') ||
        b.includes('#0b2c4a') ||
        b.includes('#0b2c4d') ||
        b.includes('#0a1628') ||
        b.includes('#0f2447') ||
        b.includes('#0f4c81') ||
        b.includes('#1a3560') ||
        b.includes('#1e3a8a') ||
        b.includes('#0f172a') || 
        b.includes('#0f2342') ||
        b.includes('#0b1121') ||
        b.includes('#1e293b') ||
        b.includes('#1e3a5f') ||
        b.includes('#111827') ||
        b.includes('#1f2937') ||
        b.includes('#2d2d52') ||
        b.includes('#070c18') ||
        b.includes('#000000') ||
        b === 'black' ||
        b.includes('rgb(26,42,94)') ||
        b.includes('rgb(11,44,74)') ||
        b.includes('rgb(15,23,42)') ||
        b.includes('rgb(15,35,66)') ||
        b.includes('rgb(30,41,59)')
    );
}

export function isWhiteTableColor(colorStr?: string): boolean {
    if (!colorStr) return false;
    const c = colorStr.toLowerCase().replace(/\s+/g, '');
    return c.includes('#fff') || c === 'white' || c.includes('rgb(255,255,255)');
}

export function parseStyle(styleInput: any, node?: any): React.CSSProperties {
    let styleVal = styleInput;
    if (!styleVal && node && node.properties && node.properties.style) {
        styleVal = node.properties.style;
    }
    
    if (!styleVal) return {};
    
    if (typeof styleVal === 'object') {
        return styleVal;
    }
    
    if (typeof styleVal === 'string') {
        const obj: any = {};
        styleVal.split(';').forEach(rule => {
            const parts = rule.split(':');
            if (parts.length >= 2) {
                const rawKey = parts[0].trim();
                const key = rawKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                const value = parts.slice(1).join(':').trim();
                if (key && value) {
                    obj[key] = value;
                }
            }
        });
        return obj;
    }
    
    return {};
}

export function processInlineStyles(
    styleObj: any,
    className: string = '',
    isContainer: boolean = false,
    isTableElement: boolean = false
): { processedStyle: any; processedClassName: string } {
    const processedStyle = { ...styleObj };
    const classes = className ? className.split(' ') : [];
    
    const bgVal = styleObj.background || styleObj.backgroundColor;
    const colorVal = styleObj.color;
    
    const heightStr = styleObj.height ? styleObj.height.toString().toLowerCase().trim() : '';
    const isSmallHeight = heightStr && (
        heightStr === '100%' ||
        (heightStr.endsWith('px') && parseFloat(heightStr) <= 60) ||
        (heightStr.endsWith('rem') && parseFloat(heightStr) <= 4) ||
        (heightStr.endsWith('em') && parseFloat(heightStr) <= 4) ||
        (heightStr.endsWith('vh') && parseFloat(heightStr) <= 10)
    );
    
    const isInlineOrBadge = 
        styleObj.display === 'inline' || 
        styleObj.display === 'inline-block' || 
        styleObj.display === 'inline-flex';
        
    const isProgressBarOrComponent = isSmallHeight || isInlineOrBadge || styleObj.maxHeight || (styleObj.overflow === 'hidden' && styleObj.height);
    
    if (bgVal && typeof bgVal === 'string') {
        const bgLower = bgVal.toLowerCase().replace(/\s+/g, '');
        
        const isYellowAmberBg = 
            bgLower.includes('#f7f3e8') || 
            bgLower.includes('rgb(247,243,232)') || 
            bgLower.includes('#fdf8e7') || 
            bgLower.includes('#fef9e7') || 
            bgLower.includes('#fef9ee') || 
            bgLower.includes('#fdf6e3') || 
            bgLower.includes('#f5f1e6') || 
            bgLower.includes('#f3ede3') || 
            bgLower.includes('#f9f7f3') || 
            bgLower.includes('#f8f4ee') || 
            bgLower.includes('#faf6ed') || 
            bgLower.includes('#f5efe6') || 
            bgLower.includes('#fffdf0') || 
            bgLower.includes('#fff9db') || 
            bgLower.includes('#fff8e1') || 
            bgLower.includes('#fffaed') || 
            bgLower.includes('#faf0be') || 
            bgLower.includes('#fff7ed') || 
            bgLower.includes('#fffbeb') || 
            bgLower.includes('#fef3c7') ||
            bgLower.includes('#fef9c3') ||
            bgLower.includes('#fef08a') ||
            bgLower.includes('#fff3cd') ||
            bgLower.includes('#fed7aa') || 
            bgLower.includes('#fffaf5') || 
            bgLower.includes('#ffedd5') || 
            bgLower.includes('#fefce8') || 
            bgLower.includes('#f9f7ec') || 
            bgLower.includes('#f7f3e3') || 
            bgLower.includes('#fff4e5') || 
            bgLower.includes('yellow') ||
            bgLower.includes('rgb(255,247,237)') ||
            bgLower.includes('rgb(255,251,235)') ||
            bgLower.includes('rgb(254,243,199)') ||
            bgLower.includes('rgb(254,240,138)') ||
            bgLower.includes('rgb(254,215,170)');

        const isBlueBg =
            bgLower.includes('#f4f6fb') ||
            bgLower.includes('#eef1f8') ||
            bgLower.includes('#eef3f8') ||
            bgLower.includes('#eef2fa') ||
            bgLower.includes('#eef1fa') ||
            bgLower.includes('#f0f4fa') ||
            bgLower.includes('#f0f7ff') ||
            bgLower.includes('#eff6ff') || 
            bgLower.includes('#f0f4ff') ||
            bgLower.includes('#f0f5ff') ||
            bgLower.includes('#f0f6ff') ||
            bgLower.includes('#f0f9ff') ||
            bgLower.includes('#e0f2fe') ||
            bgLower.includes('#bfdbfe') || 
            bgLower.includes('#e0e7ff') || 
            bgLower.includes('#eef2ff') || 
            bgLower.includes('#dbeafe') || 
            bgLower.includes('#e6e8ff') || 
            bgLower.includes('#e8eeff') || 
            bgLower.includes('#ecfeff') || 
            bgLower.includes('rgb(239,246,255)') ||
            bgLower.includes('rgb(240,249,255)') ||
            bgLower.includes('rgb(191,219,254)');

        const isGreenBg =
            bgLower.includes('#eef6ee') ||
            bgLower.includes('#f0fdf4') || 
            bgLower.includes('#dcfce7') ||
            bgLower.includes('#bbf7d0') || 
            bgLower.includes('#ecfdf3') || 
            bgLower.includes('#ecfdf5') || 
            bgLower.includes('#f0f4fa') || 
            bgLower.includes('#d1fae5') || 
            bgLower.includes('#d4edd9') || 
            bgLower.includes('#e8f5e9') || 
            bgLower.includes('#f3fdf7') || 
            bgLower.includes('rgb(240,253,244)') ||
            bgLower.includes('rgb(187,247,208)');

        const isRedBg =
            bgLower.includes('#fdecea') ||
            bgLower.includes('#fff5f5') ||
            bgLower.includes('#fef2f2') || 
            bgLower.includes('#ffe4e6') || 
            bgLower.includes('#fecaca') || 
            bgLower.includes('#faf4f4') || 
            bgLower.includes('#f5dada') || 
            bgLower.includes('rgb(254,242,242)') ||
            bgLower.includes('rgb(254,202,202)');

        const isPinkBg =
            bgLower.includes('#fdf2f8') || 
            bgLower.includes('#fbcfe8') || 
            bgLower.includes('rgb(253,242,248)') ||
            bgLower.includes('rgb(251,207,232)');

        const isPurpleBg =
            bgLower.includes('#f5f3ff') || 
            bgLower.includes('#faf8ff') || 
            bgLower.includes('#ddd6fe') || 
            bgLower.includes('#c7d2fe') || 
            bgLower.includes('#f5f0ff') || 
            bgLower.includes('#faf5ff') || 
            bgLower.includes('rgb(245,243,255)') ||
            bgLower.includes('rgb(250,248,255)');

        const isDarkBg = 
            bgLower.includes('#0b2c4a') || 
            bgLower.includes('#0b2c4d') || 
            bgLower.includes('#1a2a5e') || 
            bgLower.includes('#0a1628') || 
            bgLower.includes('#0f2447') || 
            bgLower.includes('#0f4c81') || 
            bgLower.includes('#1a3560') || 
            bgLower.includes('#1e3a8a') || 
            bgLower.includes('#1a1a1a') || 
            bgLower.includes('#0f172a') || 
            bgLower.includes('#0f2342') ||
            bgLower.includes('#0b1121') ||
            bgLower.includes('#1e293b') ||
            bgLower.includes('#1e3a5f') ||
            bgLower.includes('#111827') ||
            bgLower.includes('#1f2937') ||
            bgLower.includes('#2d2d52') ||
            bgLower.includes('#070c18') ||
            bgLower.includes('#000000') ||
            bgLower === 'black' ||
            bgLower.includes('rgb(15,23,42)') ||
            bgLower.includes('rgb(15,35,66)') ||
            bgLower.includes('rgb(30,41,59)');

        const isNeutralLightBg =
            bgLower.includes('#f4f6fb') ||
            bgLower.includes('#ffffff') ||
            bgLower.includes('#fff') ||
            bgLower === 'white' ||
            bgLower.includes('#f8fafc') ||
            bgLower.includes('#f1f5f9') ||
            bgLower.includes('#f9fafb') ||
            bgLower.includes('#f3f4f6') ||
            bgLower.includes('#e2e8f0') ||
            bgLower.includes('#dbe3ef') ||
            bgLower.includes('#e8edf4') ||
            bgLower.includes('#eef1f6') ||
            bgLower.includes('#f7f7f7') ||
            bgLower.includes('#fafafa') ||
            bgLower.includes('#fafbfc') ||
            bgLower.includes('#f9f9f9') ||
            bgLower.includes('#fcfcfc') ||
            bgLower.includes('#f5f5f5') ||
            bgLower.includes('#f7f8fa') ||
            bgLower.includes('#f7f9fc') ||
            bgLower.includes('#f8f4ee') ||
            bgLower.includes('#f9f7f3') ||
            bgLower.includes('#ddd8cc') ||
            bgLower.includes('rgb(255,255,255)') ||
            bgLower.includes('rgb(248,250,252)') ||
            bgLower.includes('rgb(241,245,249)') ||
            bgLower.includes('rgb(249,250,251)');

        const bgBrightness = getColorBrightness(bgVal);
        const isGenericLightBg = bgBrightness !== null && bgBrightness > 175;

        if (!isProgressBarOrComponent && !isTableElement) {
            const borderStr = (styleObj.border || styleObj.borderLeft || styleObj.borderColor || '').toString();
            const hasAmberBorder = isBorderAmberOrGold(borderStr);
            const hasBlueBorder = isBorderBlue(borderStr);
            const hasGreenBorder = isBorderGreen(borderStr);
            const hasRedBorder = isBorderRed(borderStr);
            const hasPurpleBorder = isBorderPurple(borderStr);

            if (isYellowAmberBg || (isGenericLightBg && hasAmberBorder)) {
                if (processedStyle.borderLeft || styleObj.borderLeft || hasAmberBorder) {
                    classes.push('dynamic-card-amber');
                } else {
                    classes.push('dynamic-box-amber');
                }
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isBlueBg || (isGenericLightBg && hasBlueBorder)) {
                if (processedStyle.borderLeft || styleObj.borderLeft || hasBlueBorder) {
                    classes.push('dynamic-card-blue');
                } else {
                    classes.push('dynamic-box-blue');
                }
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isGreenBg || (isGenericLightBg && hasGreenBorder)) {
                classes.push('dynamic-card-green');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isRedBg || (isGenericLightBg && hasRedBorder)) {
                classes.push('dynamic-card-red');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isPinkBg) {
                classes.push('dynamic-card-pink');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isPurpleBg || (isGenericLightBg && hasPurpleBorder)) {
                classes.push('dynamic-card-purple');
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isNeutralLightBg || isGenericLightBg) {
                if (processedStyle.borderLeft || styleObj.borderLeft || styleObj.border) {
                    classes.push('dynamic-card-neutral');
                } else {
                    classes.push('dynamic-box-neutral');
                }
                delete processedStyle.background;
                delete processedStyle.backgroundColor;
                delete processedStyle.border;
                delete processedStyle.borderColor;
            } else if (isDarkBg) {
                classes.push('dynamic-card-dark');
                if (processedStyle.color && typeof processedStyle.color === 'string') {
                    const c = processedStyle.color.toLowerCase().replace(/\s+/g, '');
                    if (c === '#0b2c4a' || c === '#1a2a5e' || c === '#0f172a' || c === '#1a1a2e' || c === '#1e3a5f' || c === '#000' || c === '#000000') {
                        delete processedStyle.color;
                    }
                }
            }
        }

        if (isTableElement && (isGenericLightBg || isNeutralLightBg || isBlueBg || isYellowAmberBg)) {
            delete processedStyle.background;
            delete processedStyle.backgroundColor;
            classes.push('bg-slate-50 dark:bg-slate-900/60');
        }
    }

    // Handle dark text color on canvas/containers in dark mode
    if (colorVal && typeof colorVal === 'string') {
        const cLower = colorVal.toLowerCase().replace(/\s+/g, '');
        const cBrightness = getColorBrightness(colorVal);
        const isDarkText = (cBrightness !== null && cBrightness < 110) ||
            cLower === '#0b2c4a' ||
            cLower === '#1a2a5e' ||
            cLower === '#0f2342' ||
            cLower === '#1a3560' ||
            cLower === '#1a1a2e' ||
            cLower === '#1e3a5f' ||
            cLower === '#0f172a' ||
            cLower === '#111827' ||
            cLower === '#1e293b' ||
            cLower === '#1f2937' ||
            cLower === '#374151' ||
            cLower === '#2d2d2d' ||
            cLower === '#3d3d3d' ||
            cLower === '#2c3e50' ||
            cLower === '#5d4037' ||
            cLower === '#000' ||
            cLower === '#000000' ||
            cLower === '#222' ||
            cLower === '#333' ||
            cLower === '#444' ||
            cLower === '#1a1a1a' ||
            cLower === '#145a32';

        const isMutedText = (cBrightness !== null && cBrightness >= 110 && cBrightness < 155) ||
            cLower === '#475569' ||
            cLower === '#334155' ||
            cLower === '#64748b' ||
            cLower === '#555' ||
            cLower === '#666' ||
            cLower === '#666666';

        if (isDarkText) {
            classes.push('dynamic-text-adaptive');
            delete processedStyle.color;
        } else if (isMutedText) {
            classes.push('text-slate-600 dark:text-slate-300!');
            delete processedStyle.color;
        }
    }

    // Handle light neutral borders in dark mode
    const borderVal = styleObj.border || styleObj.borderColor;
    if (borderVal && typeof borderVal === 'string') {
        const bLower = borderVal.toLowerCase().replace(/\s+/g, '');
        if (
            bLower.includes('#e2e8f0') ||
            bLower.includes('#e5e7eb') ||
            bLower.includes('#cbd5e1') ||
            bLower.includes('#d1d5db') ||
            bLower.includes('#eee') ||
            bLower.includes('#e0e0e0')
        ) {
            classes.push('dark:border-slate-800!');
        }
    }

    if (isContainer) {
        processedStyle.maxWidth = '100%';
        processedStyle.boxSizing = 'border-box';
        classes.push('max-w-full');
        if (processedStyle.width && typeof processedStyle.width === 'string' && processedStyle.width.endsWith('px')) {
            const num = parseFloat(processedStyle.width);
            if (num > 320) {
                processedStyle.maxWidth = '100%';
                processedStyle.width = '100%';
            }
        }
    }

    if (processedStyle.fontSize && typeof processedStyle.fontSize === 'string') {
        const fsLower = processedStyle.fontSize.toLowerCase().trim();
        if (
            fsLower === '1rem' ||
            fsLower === '1.05rem' ||
            fsLower === '1.1rem' ||
            fsLower === '16px' ||
            fsLower === '17px' ||
            fsLower === '17.5px' ||
            fsLower === '18px'
        ) {
            delete processedStyle.fontSize;
        }
    }
    
    return {
        processedStyle,
        processedClassName: Array.from(new Set(classes.filter(Boolean))).join(' ')
    };
}
