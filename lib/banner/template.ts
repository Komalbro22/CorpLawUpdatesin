/* eslint-disable @typescript-eslint/no-explicit-any */
import { BannerSpecData } from './types'
import { getBannerTheme, IMPACT_COLORS } from './themes'
import { renderVisual } from './visuals'

export function buildTemplateElement(spec: BannerSpecData): any {
  const theme = getBannerTheme(spec.regulator)
  const impactColor = IMPACT_COLORS[spec.impact] || IMPACT_COLORS.Medium

  // Font size calculation based on headline length
  const headlineFontSize = spec.headline.length > 45 ? '58px' : spec.headline.length > 30 ? '64px' : '70px'

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        backgroundColor: theme.bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter',
      },
      children: [
        // 1. Decorative Circle (560px at right -140, top -150)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-150px',
              right: '-140px',
              width: '560px',
              height: '560px',
              borderRadius: '999px',
              backgroundColor: theme.circle,
              opacity: 0.8,
            },
          },
        },

        // 2. Top Header Bar
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '40px',
              left: '64px',
              right: '64px',
              height: '52px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            children: [
              // Top-Left: White pill with regulator code (26px, weight 800) and full name (19px)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    padding: '8px 22px',
                    borderRadius: '999px',
                    gap: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '26px',
                          fontWeight: 800,
                          color: theme.bg,
                          letterSpacing: '1px',
                        },
                        children: spec.regulator,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '19px',
                          fontWeight: 600,
                          color: '#475569',
                          borderLeft: '1.5px solid #CBD5E1',
                          paddingLeft: '12px',
                        },
                        children: theme.fullName,
                      },
                    },
                  ],
                },
              },

              // Top-Right: Date label + Impact dot + Impact label (22px)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '22px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                        },
                        children: spec.dateLabel,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '12px',
                          height: '12px',
                          borderRadius: '999px',
                          backgroundColor: impactColor,
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '22px',
                          fontWeight: 700,
                          color: impactColor,
                        },
                        children: `${spec.impact} Impact`,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 3. Middle Content Area (Left Column + Right Column)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '118px',
              left: '64px',
              right: '64px',
              height: '422px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              // Left Column (x 64, y 118, width 620)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '620px',
                    gap: '20px',
                  },
                  children: [
                    // Headline: 62-72px, weight 800, line-height 1.05
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: headlineFontSize,
                          fontWeight: 800,
                          lineHeight: 1.08,
                          color: '#FFFFFF',
                          letterSpacing: '-1px',
                          textWrap: 'balance',
                        },
                        children: spec.headline,
                      },
                    },

                    // Sub: 30px #E2E8F0
                    spec.sub && {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 400,
                          lineHeight: 1.3,
                          color: '#E2E8F0',
                          maxWidth: '580px',
                        },
                        children: spec.sub,
                      },
                    },

                    // Action Chip: accent background, theme.dark text, 26px bold
                    spec.action && {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          width: 'fit-content',
                          backgroundColor: theme.accent,
                          color: theme.dark,
                          fontSize: '26px',
                          fontWeight: 800,
                          padding: '8px 24px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.25)',
                          marginTop: '4px',
                        },
                        children: spec.action,
                      },
                    },
                  ].filter(Boolean),
                },
              },

              // Right Column (x 700, y 120, width 440)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '440px',
                    height: '400px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: [renderVisual(spec.visual, theme)],
                },
              },
            ],
          },
        },

        // 4. Footer Strip (70px high in accent color)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '0px',
              left: '0px',
              right: '0px',
              height: '70px',
              backgroundColor: theme.accent,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '64px',
              paddingRight: '64px',
            },
            children: [
              // Left: CorpLawUpdates.in (28px, 800) + Corporate Law Intelligence (24px)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '16px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 800,
                          color: theme.dark,
                          letterSpacing: '-0.5px',
                        },
                        children: 'CorpLawUpdates.in',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '22px',
                          fontWeight: 600,
                          color: theme.dark,
                          opacity: 0.85,
                          borderLeft: `2px solid ${theme.dark}40`,
                          paddingLeft: '16px',
                        },
                        children: 'Corporate Law Intelligence',
                      },
                    },
                  ],
                },
              },

              // Right: Three skewed bars in theme.dark
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '12px',
                          height: '32px',
                          backgroundColor: theme.dark,
                          transform: 'skewX(-20deg)',
                          borderRadius: '2px',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '12px',
                          height: '32px',
                          backgroundColor: theme.dark,
                          transform: 'skewX(-20deg)',
                          borderRadius: '2px',
                          opacity: 0.7,
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '12px',
                          height: '32px',
                          backgroundColor: theme.dark,
                          transform: 'skewX(-20deg)',
                          borderRadius: '2px',
                          opacity: 0.4,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }
}
