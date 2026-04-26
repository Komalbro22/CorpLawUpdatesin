import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params

        if (!slug) {
            return Response.json(
                { error: 'Slug required' },
                { status: 400 }
            )
        }

        // Get current views
        const { data, error } = await supabaseAdmin
            .from('updates')
            .select('views')
            .eq('slug', slug)
            .single()

        if (error || !data) {
            return Response.json(
                { error: 'Article not found' },
                { status: 404 }
            )
        }

        // Increment views
        const { data: updated, error: updateError } =
            await supabaseAdmin
                .from('updates')
                .update({ views: (data.views || 0) + 1 })
                .eq('slug', slug)
                .select('views')
                .single()

        if (updateError) {
            return Response.json(
                { error: 'Update failed' },
                { status: 500 }
            )
        }

        return Response.json({
            views: updated?.views || 0,
            slug
        })

    } catch (err) {
        console.error('Views update error:', err)
        return Response.json(
            { error: 'Internal error' },
            { status: 500 }
        )
    }
}

// Only POST allowed — no GET
export async function GET() {
    return Response.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}
