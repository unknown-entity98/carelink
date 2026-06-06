import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { streamChat } from '@/lib/ai/provider'
import { buildContext, ParticipantProfile } from '@/lib/ai/buildContext'
import { buildSystemPrompt } from '@/lib/ai/prompts'
import type { ChatMessage } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    // Authenticate the worker
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      message: string
      messages: ChatMessage[]
      participantId: string
      sessionId: string
    }

    const { message, messages, participantId } = body

    if (!message || !participantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service client to bypass RLS for fetching participant profile
    // (RLS already verified worker has access via the link check below)
    const service = await createServiceClient()

    // Verify worker is approved for this participant
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

    // Fetch participant profile data (server-side only — never sent to browser)
    const [
      { data: participant },
      { data: manuals },
      { data: incidents },
      { data: dietary },
      { data: contacts },
      { data: medical },
      { data: bsp },
    ] = await Promise.all([
      service.from('participants').select('*').eq('id', participantId).single(),
      service.from('support_manuals').select('*').eq('participant_id', participantId),
      service.from('incident_types').select('*').eq('participant_id', participantId),
      service.from('dietary_requirements').select('*').eq('participant_id', participantId),
      service.from('emergency_contacts').select('*').eq('participant_id', participantId),
      service.from('medical_info').select('*').eq('participant_id', participantId).single(),
      service.from('behaviour_support_plans').select('*').eq('participant_id', participantId).single(),
    ])

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    const profile: ParticipantProfile = {
      participant,
      manuals: manuals ?? [],
      incidents: incidents ?? [],
      dietary: dietary ?? [],
      contacts: contacts ?? [],
      medical: medical ?? null,
      bsp: bsp ?? null,
    }

    // Build minimum-data context based on the worker's message topic
    const participantContext = buildContext(profile, message)
    const systemPrompt = buildSystemPrompt(participantContext)

    // Record session (not message content — by design)
    await service
      .from('chat_sessions')
      .upsert({ id: body.sessionId, worker_profile_id: user.id, participant_id: participantId })
      .select()

    // Stream AI response
    const stream = await streamChat(messages, systemPrompt)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { error: 'The AI assistant is temporarily unavailable.' },
      { status: 503 }
    )
  }
}
