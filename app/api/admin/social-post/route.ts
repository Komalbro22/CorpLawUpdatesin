import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { TwitterApi } from 'twitter-api-v2'

export async function POST(request: Request) {
    if (!verifyAdminSession()) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const body = await request.json()
    const { title, summary, slug, category, platforms } = body

    const url = `https://www.corplawupdates.in/updates/${slug}`

    const hashtags: Record<string, string> = {
        MCA: '#MCA #CompaniesAct #Compliance',
        SEBI: '#SEBI #Securities #ListedCompanies',
        RBI: '#RBI #MonetaryPolicy #Banking',
        NCLT: '#NCLT #Insolvency #CorporateLaw',
        IBC: '#IBC #Insolvency #Bankruptcy',
        FEMA: '#FEMA #ForeignExchange #RBI',
    }

    const tags = hashtags[category] || '#CorporateLaw #Compliance'

    const tweetText = `📋 ${title}\n\n${summary?.slice(0, 200)}...\n\n🔗 ${url}\n\n${tags} #CS #IndianLaw`

    const linkedinText = `📋 New Update on CorpLawUpdates.in\n\n${title}\n\n${summary?.slice(0, 500)}...\n\n🔗 Read full analysis: ${url}\n\n${tags} #CompanySecretary #LegalUpdates #India`

    const results: Record<string, string> = {}

    // Post to X via Twitter API v2 with OAuth 1.0a
    if (platforms.includes('twitter')) {
        try {
            const twitterClient = new TwitterApi({
                appKey: process.env.TWITTER_API_KEY!,
                appSecret: process.env.TWITTER_API_SECRET!,
                accessToken: process.env.TWITTER_ACCESS_TOKEN!,
                accessSecret: process.env.TWITTER_ACCESS_SECRET!,
            })

            await twitterClient.v2.tweet(tweetText)
            results.twitter = 'posted'
        } catch (err) {
            console.error('Twitter error:', err)
            results.twitter = 'failed'
        }
    }

    // Post to LinkedIn via API
    if (platforms.includes('linkedin')) {
        try {
            const linkedinRes = await fetch(
                'https://api.linkedin.com/v2/ugcPosts',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                        'X-Restli-Protocol-Version': '2.0.0',
                    },
                    body: JSON.stringify({
                        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
                        lifecycleState: 'PUBLISHED',
                        specificContent: {
                            'com.linkedin.ugc.ShareContent': {
                                shareCommentary: {
                                    text: linkedinText,
                                },
                                shareMediaCategory: 'ARTICLE',
                                media: [
                                    {
                                        status: 'READY',
                                        description: {
                                            text: summary?.slice(0, 200) || '',
                                        },
                                        originalUrl: url,
                                        title: {
                                            text: title,
                                        },
                                    },
                                ],
                            },
                        },
                        visibility: {
                            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                        },
                    }),
                }
            )
            if (linkedinRes.ok) {
                results.linkedin = 'posted'
            } else {
                const err = await linkedinRes.text()
                console.error('LinkedIn error:', err)
                results.linkedin = 'failed'
            }
        } catch {
            results.linkedin = 'error'
        }
    }

    return NextResponse.json({ results })
}
