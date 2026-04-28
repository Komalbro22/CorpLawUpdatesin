import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import crypto from 'crypto'

// OAuth 1.0a signing function
function generateOAuthHeader(
    method: string,
    url: string,
    params: Record<string, string>
): string {
    const oauthParams: Record<string, string> = {
        oauth_consumer_key:
            process.env.TWITTER_API_KEY || '',
        oauth_nonce:
            crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp:
            Math.floor(Date.now() / 1000).toString(),
        oauth_token:
            process.env.TWITTER_ACCESS_TOKEN || '',
        oauth_version: '1.0',
    }

    // Combine all params for signature
    const allParams = { ...params, ...oauthParams }

    // Sort and encode params
    const sortedParams = Object.keys(allParams)
        .sort()
        .map(k =>
            `${encodeURIComponent(k)}=` +
            `${encodeURIComponent(allParams[k])}`
        )
        .join('&')

    // Build signature base string
    const signatureBase = [
        method.toUpperCase(),
        encodeURIComponent(url),
        encodeURIComponent(sortedParams),
    ].join('&')

    // Build signing key
    const signingKey = [
        encodeURIComponent(
            process.env.TWITTER_API_SECRET || ''
        ),
        encodeURIComponent(
            process.env.TWITTER_ACCESS_SECRET || ''
        ),
    ].join('&')

    // Generate HMAC-SHA1 signature
    const signature = crypto
        .createHmac('sha1', signingKey)
        .update(signatureBase)
        .digest('base64')

    oauthParams.oauth_signature = signature

    // Build Authorization header
    const headerParams = Object.keys(oauthParams)
        .sort()
        .map(k =>
            `${encodeURIComponent(k)}=` +
            `"${encodeURIComponent(oauthParams[k])}"`
        )
        .join(', ')

    return `OAuth ${headerParams}`
}

// Post tweet function
async function postTweet(text: string): Promise<boolean> {
    const url = 'https://api.twitter.com/2/tweets'
    const body = JSON.stringify({ text })

    const authHeader = generateOAuthHeader('POST', url, {})

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body,
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Twitter API error:', error)
        return false
    }

    return true
}

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

    const linkedinText = `📋 New Update on CorpLawUpdates.in\n\n${title}\n\n${summary?.slice(0, 500)}...\n\n🔗 Read full analysis: ${url}\n\n${tags} #CompanySecretary #LegalUpdates #India`

    const results: Record<string, string> = {}

    // Post to X via Twitter API v2 with OAuth 1.0a
    if (platforms.includes('twitter')) {
        try {
            const tweetText =
                `📋 ${title}\n\n` +
                `${summary?.slice(0, 200)}...\n\n` +
                `🔗 ${url}\n\n` +
                `${tags} #CS #IndianLaw`

            const success = await postTweet(tweetText)
            results.twitter = success ? 'posted' : 'failed'
        } catch (err) {
            console.error('Twitter error:', err)
            results.twitter = 'error'
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
