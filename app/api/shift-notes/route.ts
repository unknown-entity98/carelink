import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const participantId = searchParams.get('participantId')
    const service = await createServiceClient()

    let query = service
      .from('shift_notes')
      .select('*')
      .eq('worker_profile_id', user.id)
      .order('shift_date', { ascending: false })

    if (participantId) {
      // Verify worker has access
      const { data: link } = await service
        .from('worker_participant_links')
        .select('id')
        .eq('worker_profile_id', user.id)
        .eq('participant_id', participantId)
        .eq('status', 'approved')
        .single()

      if (!link) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      query = query.eq('participant_id', participantId)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch shift notes' }, { status: 500 })
    }

    return NextResponse.json({ shiftNotes: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { participant_id, shift_date, note_text, mood_rating, incidents_occurred, incident_description } = body

    if (!participant_id || !shift_date || !note_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const service = await createServiceClient()

    // Verify worker access
    const { data: link } = await service
      .from('worker_participant_links')
      .select('id')
      .eq('worker_profile_id', user.id)
      .eq('participant_id', participant_id)
      .eq('status', 'approved')
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data, error } = await service.from('shift_notes').insert({
      worker_profile_id: user.id,
      participant_id,
      shift_date,
      note_text,
      mood_rating,
      incidents_occurred: incidents_occurred ?? false,
      incident_description,
    }).select().single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create shift note' }, { status: 500 })
    }

    return NextResponse.json({ shiftNote: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
