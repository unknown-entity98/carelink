import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await createServiceClient()

    // Get approved links for this worker
    const { data: links } = await service
      .from('worker_participant_links')
      .select('participant_id')
      .eq('worker_profile_id', user.id)
      .eq('status', 'approved')

    if (!links || links.length === 0) {
      return NextResponse.json({ participants: [] })
    }

    const participantIds = links.map((l) => l.participant_id)

    const { data: participants, error } = await service
      .from('participants')
      .select('*')
      .in('id', participantIds)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
    }

    return NextResponse.json({ participants })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
