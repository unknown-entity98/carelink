import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'
import { randomUUID } from 'crypto'

export default async function ChatPage({ params }: { params: { participantId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  // Verify access
  const { data: link } = await service
    .from('worker_participant_links')
    .select('id')
    .eq('worker_profile_id', user.id)
    .eq('participant_id', params.participantId)
    .eq('status', 'approved')
    .single()

  if (!link) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto mt-12">
        <div className="text-5xl mb-4" aria-hidden="true">🔒</div>
        <h1 className="text-xl font-semibold text-stone-900 mb-2">Access denied</h1>
        <p className="text-stone-500 text-sm">
          You are not approved to support this participant. Contact your support coordinator.
        </p>
      </div>
    )
  }

  const [{ data: participant }, { data: incidents }] = await Promise.all([
    service.from('participants').select('*').eq('id', params.participantId).single(),
    service.from('incident_types').select('*').eq('participant_id', params.participantId),
  ])

  if (!participant) {
    return <div className="p-8 text-center text-stone-500">Participant not found.</div>
  }

  const sessionId = randomUUID()

  return (
    <div className="h-[calc(100vh-84px)] md:h-[calc(100vh-36px)] flex flex-col">
      <ChatWindow
        participant={participant}
        incidents={incidents ?? []}
        workerProfileId={user.id}
        sessionId={sessionId}
      />
    </div>
  )
}
