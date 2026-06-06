import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ParticipantCard from '@/components/ParticipantCard'
import { formatDate } from '@/lib/utils'
import type { Participant, ShiftNote } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = await createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isWorker = profile?.role === 'worker'

  // Fetch linked participants for workers
  let participants: Participant[] = []
  let recentNotes: (ShiftNote & { participants: Participant })[] = []

  if (isWorker) {
    const { data: links } = await service
      .from('worker_participant_links')
      .select('participant_id')
      .eq('worker_profile_id', user.id)
      .eq('status', 'approved')

    if (links && links.length > 0) {
      const ids = links.map((l) => l.participant_id)
      const { data } = await service.from('participants').select('*').in('id', ids)
      participants = data ?? []
    }

    const { data: notes } = await service
      .from('shift_notes')
      .select('*, participants(*)')
      .eq('worker_profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    recentNotes = (notes as (ShiftNote & { participants: Participant })[]) ?? []
  }

  // For each participant, check if they have critical manuals or life-threatening dietary
  const criticalMap: Record<string, boolean> = {}
  const lastNoteMap: Record<string, ShiftNote> = {}

  for (const p of participants) {
    const [{ data: manuals }, { data: dietary }, { data: latestNote }] = await Promise.all([
      service.from('support_manuals').select('is_critical').eq('participant_id', p.id).eq('is_critical', true).limit(1),
      service.from('dietary_requirements').select('severity').eq('participant_id', p.id).eq('severity', 'life_threatening').limit(1),
      service.from('shift_notes').select('*').eq('participant_id', p.id).eq('worker_profile_id', user.id).order('shift_date', { ascending: false }).limit(1).single(),
    ])
    criticalMap[p.id] = (manuals?.length ?? 0) > 0 || (dietary?.length ?? 0) > 0
    if (latestNote) lastNoteMap[p.id] = latestNote as ShiftNote
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {isWorker ? (
        <div className="space-y-8">
          <section aria-labelledby="participants-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="participants-heading" className="text-lg font-semibold text-stone-800">
                Your participants
              </h2>
              <Link href="/participants" className="text-sm text-teal-700 hover:underline">
                View all
              </Link>
            </div>

            {participants.length === 0 ? (
              <div className="bg-stone-100 rounded-xl p-6 text-center text-stone-500 text-sm">
                No participants linked to your account yet. Contact your support coordinator.
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
          </section>

          {recentNotes.length > 0 && (
            <section aria-labelledby="activity-heading">
              <h2 id="activity-heading" className="text-lg font-semibold text-stone-800 mb-4">
                Recent activity
              </h2>
              <div className="space-y-2">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900 text-sm">
                          {note.participants?.preferred_name ?? 'Participant'}
                        </span>
                        <span className="text-xs text-stone-400">{formatDate(note.shift_date)}</span>
                        {note.incidents_occurred && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                            Incident
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 mt-1 line-clamp-2">{note.note_text}</p>
                    </div>
                    <Link
                      href={`/participants/${note.participant_id}/shift-notes`}
                      className="text-xs text-teal-700 hover:underline flex-shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
          <p className="text-stone-600">
            Participant dashboard coming soon. Contact your support coordinator to get started.
          </p>
          <Link
            href={`/profile/${user.id}/edit`}
            className="mt-4 inline-block bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            Edit my profile
          </Link>
        </div>
      )}
    </div>
  )
}
