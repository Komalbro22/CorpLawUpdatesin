import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

// UNSUBSCRIBE — marks as inactive
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({ 
      is_active: false,
      unsubscribed_at: new Date().toISOString()
    })
    .eq('id', params.id)

  if (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' }, 
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

// DELETE — permanently removes subscriber
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminSession()) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete' }, 
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
