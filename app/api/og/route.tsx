/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const revalidate = 86400

const colorMap: Record<string, string> = {
    MCA: '#3B82F6',
    SEBI: '#10B981',
    RBI: '#8B5CF6',
    NCLT: '#F97316',
    IBC: '#EF4444',
    FEMA: '#14B8A6',
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const hasTitle = searchParams.has('title')
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'CorpLawUpdates.in — Corporate Law Intelligence'

        const category = searchParams.get('category')
        const badgeColor = category ? (colorMap[category.toUpperCase()] || '#3B82F6') : null

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#0F172A',
                        width: '100%',
                        height: '100%',
                        padding: '60px',
                        position: 'relative',
                    }}
                >
                    {/* Top Left Logo */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 28,
                            fontFamily: 'serif',
                            color: '#F59E0B',
                            fontWeight: 'bold',
                            marginBottom: 'auto',
                        }}
                    >
                        CorpLawUpdates.in
                    </div>

                    {/* Main Content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            marginTop: '40px',
                        }}
                    >
                        {category && (
                            <div
                                style={{
                                    display: 'flex',
                                    backgroundColor: badgeColor || '#3B82F6',
                                    color: 'white',
                                    borderRadius: 999,
                                    padding: '8px 20px',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginBottom: '24px',
                                    width: 'auto',
                                }}
                            >
                                {category.toUpperCase()}
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                fontSize: 56,
                                fontWeight: 'bold',
                                color: 'white',
                                lineHeight: 1.2,
                                maxHeight: '134px',
                                overflow: 'hidden',
                            }}
                        >
                            {title}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            marginTop: 'auto',
                        }}
                    >
                        <div style={{ display: 'flex', color: '#94A3B8', fontSize: 20 }}>
                            India's Free Corporate Law Intelligence Platform
                        </div>
                        <div style={{ display: 'flex', color: '#F59E0B', fontSize: 20, fontWeight: 'bold' }}>
                            corplawupdates.in
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
