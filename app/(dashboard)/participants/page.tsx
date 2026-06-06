import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import ParticipantCard from '@/components/ParticipantCard'
import type { Participant, ShiftNote } from '@/types/database'

export default async function ParticipantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = await createServiceClient()
  const { data: links } = await service
    .from('worker_participant_links')
    .select('participant_id')
    .eq('worker_profile_id', user.id)
    .eq('status', 'approved')

  let participants: Participant[] = []
  if (links && links.length > 0) {
    const ids = links.map((l) => l.participant_id)
    const { data } = await service.from('participants').select('*').in('id', ids)
    participants = data ?? []
  }

  const criticalMap: Record<string, boolean> = {}
  const lastNoteMap: Record<string, ShiftNote> = {}

  for (const p of participants) {
    const [{ data: manuals }, { data: dietary }, { data: note }] = await Promise.all([
      service.from('support_manuals').select('id').eq('participant_id', p.id).eq('is_critical', true).limit(1),
      service.from('dietary_requirements').select('id').eq('participant_id', p.id).eq('severity', 'life_threatening').limit(1),
      service.from('shift_notes').select('*').eq('participant_id', p.id).eq('worker_profile_id', user.id).order('shift_date', { ascending: false }).limit(1).single(),
    ])
    criticalMap[p.id] = (manuals?.length ?? 0) > 0 || (dietary?.length ?? 0) > 0
    if (note) lastNoteMap[p.id] = note as ShiftNote
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">My Participants</h1>
      {participants.length === 0 ? (
        <div className="bg-stone-100 rounded-xl p-8 text-center text-stone-500">
          No participants linked to your account. Contact your support coordinator.
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              lastShiftNote={lastNoteMap[p.id] ?? null}
              hasCritical={criticalMap[p.id] ?? false}
              workerId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
