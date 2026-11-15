/* eslint-disable @typescript-eslint/no-explicit-any */
import { Visual, BannerTheme } from './types'
import { getIconElement } from './icons'

export function renderVisual(visual: Visual, theme: BannerTheme): any {
  switch (visual.type) {
    case 'calendar_shift':
      return renderCalendarShift(visual, theme)
    case 'stat_cards':
      return renderStatCards(visual, theme)
    case 'before_after':
      return renderBeforeAfter(visual, theme)
    case 'date_card':
      return renderDateCard(visual, theme)
    case 'stamp':
      return renderStamp(visual, theme)
    case 'icon_panel':
      return renderIconPanel(visual, theme)
    default:
      return renderIconPanel({ type: 'icon_panel', icon: 'building-bank', caption: undefined, label: undefined }, theme)
  }
}

/**
 * Visual 1: Calendar Shift
 * Two white calendar cards, arrow, red strike on old date, green chip on new date
 */
function renderCalendarShift(visual: Extract<Visual, { type: 'calendar_shift' }>, theme: BannerTheme) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        width: '440px',
        height: '380px',
      },
      children: [
        // From Calendar Card
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '180px',
              height: '240px',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            },
            children: [
              // Card Header
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.accent,
                    height: '56px',
                    color: theme.dark,
                    fontSize: '24px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  },
                  children: visual.from.month,
                },
              },
              // Card Body
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '84px',
                    fontWeight: 800,
                    color: theme.bg,
                    position: 'relative',
                  },
                  children: [
                    visual.from.day,
                    // Red X strike
                    visual.strike && {
                      type: 'div',
                      props: {
                        style: {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#EF4444',
                          fontSize: '110px',
                          fontWeight: 900,
                          opacity: 0.85,
                        },
                        children: '✕',
                      },
                    },
                  ].filter(Boolean),
                },
              },
            ],
          },
        },

        // Arrow
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '40px',
              fontWeight: 800,
            },
            children: '➔',
          },
        },

        // To Calendar Card + Chip
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '180px',
                    height: '240px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                    border: '3px solid #10B981',
                  },
                  children: [
                    // Card Header
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#10B981',
                          height: '56px',
                          color: '#FFFFFF',
                          fontSize: '24px',
                          fontWeight: 800,
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                        },
                        children: visual.to.month,
                      },
                    },
                    // Card Body
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '84px',
                          fontWeight: 800,
                          color: theme.bg,
                        },
                        children: visual.to.day,
                      },
                    },
                  ],
                },
              },
              // Green Chip under new deadline
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                  },
                  children: visual.toLabel || 'NEW DEADLINE',
                },
              },
            ],
          },
        },
      ],
    },
  }
}

/**
 * Visual 2: Stat Cards
 * 1-3 stacked white cards (label above, big value below, optional chip)
 */
function renderStatCards(visual: Extract<Visual, { type: 'stat_cards' }>, theme: BannerTheme) {
  const count = visual.items.length
  const cardHeight = count === 1 ? '320px' : count === 2 ? '170px' : '110px'
  const valueSize = count === 1 ? '72px' : count === 2 ? '52px' : '38px'

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '16px',
        width: '440px',
        height: '380px',
      },
      children: visual.items.map((card, idx) => ({
        type: 'div',
        key: idx,
        props: {
          style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px 28px',
            height: cardHeight,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25)',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  maxWidth: '260px',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '22px',
                        fontWeight: 700,
                        color: theme.dark,
                        lineHeight: 1.2,
                      },
                      children: card.label,
                    },
                  },
                  card.chip && {
                    type: 'span',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content',
                        fontSize: '13px',
                        fontWeight: 800,
                        backgroundColor: theme.accent,
                        color: theme.dark,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        marginTop: '4px',
                      },
                      children: card.chip,
                    },
                  },
                ].filter(Boolean),
              },
            },
            {
              type: 'span',
              props: {
                style: {
                  fontSize: valueSize,
                  fontWeight: 800,
                  color: theme.bg,
                  letterSpacing: '-1px',
                },
                children: card.value,
              },
            },
          ],
        },
      })),
    },
  }
}

/**
 * Visual 3: Before / After
 * Old value struck through ➔ New value with change direction badge
 */
function renderBeforeAfter(visual: Extract<Visual, { type: 'before_after' }>, theme: BannerTheme) {
  const changeBg = visual.change === 'up' ? '#10B981' : visual.change === 'down' ? '#EF4444' : '#64748B'
  const changeLabel = visual.change === 'up' ? '▲ INCREASED' : visual.change === 'down' ? '▼ DECREASED' : 'REVISED'

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        width: '440px',
        height: '380px',
      },
      children: [
        // Main Container Card
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              gap: '16px',
            },
            children: [
              // Before Block
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '14px',
                    borderBottom: '2px dashed #E2E8F0',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '22px', fontWeight: 600, color: '#64748B' },
                        children: visual.before.label || 'Previous',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '40px',
                          fontWeight: 700,
                          color: '#94A3B8',
                          textDecoration: 'line-through',
                        },
                        children: visual.before.value,
                      },
                    },
                  ],
                },
              },

              // After Block
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '24px', fontWeight: 800, color: theme.dark },
                        children: visual.after.label || 'Revised New',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '54px',
                          fontWeight: 800,
                          color: theme.bg,
                        },
                        children: visual.after.value,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // Change Pill
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              backgroundColor: changeBg,
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 800,
              padding: '8px 24px',
              borderRadius: '999px',
              letterSpacing: '1px',
            },
            children: changeLabel,
          },
        },
      ],
    },
  }
}

/**
 * Visual 4: Date Card
 * Single large calendar card for consultation papers or deadlines
 */
function renderDateCard(visual: Extract<Visual, { type: 'date_card' }>, theme: BannerTheme) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        width: '440px',
        height: '380px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '260px',
              height: '300px',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            },
            children: [
              // Header
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.accent,
                    padding: '12px',
                    color: theme.dark,
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '16px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' },
                        children: visual.label,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '24px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' },
                        children: visual.month,
                      },
                    },
                  ],
                },
              },
              // Body
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '110px',
                    fontWeight: 800,
                    color: theme.bg,
                  },
                  children: visual.day,
                },
              },
            ],
          },
        },
        visual.caption && {
          type: 'span',
          props: {
            style: {
              fontSize: '22px',
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
            },
            children: visual.caption,
          },
        },
      ].filter(Boolean),
    },
  }
}

/**
 * Visual 5: Stamp
 * Large angled stamp (FAKE, CONFIRMED, CLARIFIED, WITHDRAWN)
 */
function renderStamp(visual: Extract<Visual, { type: 'stamp' }>, theme: BannerTheme) {
  const stampColor = visual.text === 'FAKE' ? '#EF4444' : visual.text === 'CONFIRMED' ? '#10B981' : theme.accent

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        width: '440px',
        height: '380px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `6px solid ${stampColor}`,
              color: stampColor,
              fontSize: '54px',
              fontWeight: 900,
              letterSpacing: '4px',
              padding: '16px 40px',
              borderRadius: '18px',
              transform: 'rotate(-8deg)',
              boxShadow: `0 0 20px ${stampColor}44`,
            },
            children: visual.text,
          },
        },
        visual.claim && {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px 20px',
              width: '380px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            },
            children: {
              type: 'span',
              props: {
                style: {
                  fontSize: '22px',
                  fontWeight: 600,
                  color: theme.dark,
                  lineHeight: 1.3,
                  textAlign: 'center',
                },
                children: `"${visual.claim}"`,
              },
            },
          },
        },
      ].filter(Boolean),
    },
  }
}

/**
 * Visual 6: Icon Panel (Fallback)
 * Concentric rings with icon
 */
function renderIconPanel(visual: Extract<Visual, { type: 'icon_panel' }>, theme: BannerTheme) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        width: '440px',
        height: '380px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '240px',
              height: '240px',
              borderRadius: '999px',
              backgroundColor: theme.circle,
              border: `8px solid ${theme.accent}66`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            },
            children: {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '180px',
                  borderRadius: '999px',
                  backgroundColor: '#FFFFFF',
                },
                children: getIconElement(visual.icon, theme.bg, 96),
              },
            },
          },
        },
        visual.caption && {
          type: 'span',
          props: {
            style: {
              fontSize: '22px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.5px',
              textAlign: 'center',
            },
            children: visual.caption,
          },
        },
      ].filter(Boolean),
    },
  }
}
