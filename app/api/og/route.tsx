import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'CorpLawUpdates.in'
  const category = searchParams.get('category') || ''

  const categoryColors: Record<string, string> = {
    mca: '#3b82f6',
    sebi: '#22c55e',
    rbi: '#a855f7',
    nclt: '#f97316',
    ibc: '#ef4444',
    fema: '#14b8a6',
  }

  const categoryColor = categoryColors[category.toLowerCase()] || '#f59e0b'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e3a5f',
          padding: '60px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* TOP BAR — amber accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          backgroundColor: '#f59e0b',
          display: 'flex',
        }} />

        {/* LOGO ROW */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
          marginTop: '8px',
        }}>
          {/* C circle with scales icon — text based */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '4px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}>
            <span style={{
              fontSize: '28px',
              color: '#f59e0b',
              fontWeight: 'bold',
            }}>⚖</span>
          </div>

          {/* Site name */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
            <span style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}>Corp</span>
            <span style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#f59e0b',
              letterSpacing: '-0.5px',
            }}>Law</span>
            <span style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}>Updates</span>
            <span style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#f59e0b',
              letterSpacing: '-0.5px',
            }}>.in</span>
          </div>
        </div>

        {/* CATEGORY BADGE */}
        {category && (
          <div style={{
            display: 'flex',
            marginBottom: '24px',
          }}>
            <div style={{
              backgroundColor: categoryColor,
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '6px 20px',
              borderRadius: '100px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              display: 'flex',
            }}>
              {category.toUpperCase()}
            </div>
          </div>
        )}

        {/* ARTICLE TITLE */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: title.length > 80 ? '36px' : title.length > 60 ? '42px' : '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.3,
            margin: 0,
            letterSpacing: '-0.5px',
            display: 'flex',
            maxWidth: '1000px',
          }}>
            {title}
          </h1>
        </div>

        {/* BOTTOM ROW */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '24px',
          marginTop: '24px',
        }}>
          {/* Left — regulators */}
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            {['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA'].map((reg) => (
              <div
                key={reg}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                {reg}
              </div>
            ))}
          </div>

          {/* Right — tagline */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '2px',
          }}>
            <span style={{
              color: '#f59e0b',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
            }}>
              India&apos;s Free Corporate Law Intelligence Platform
            </span>
            <span style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              display: 'flex',
            }}>
              corplawupdates.in · Free Forever · No Login Required
            </span>
          </div>
        </div>

        {/* BOTTOM BAR — amber accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          backgroundColor: '#f59e0b',
          display: 'flex',
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
