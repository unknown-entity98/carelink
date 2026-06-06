import { createServiceClient } from '@/lib/supabase/server'
import IncidentCard from '@/components/IncidentCard'
import type { IncidentType } from '@/types/database'

export default async function IncidentsPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()
  const { data: incidents } = await service
    .from('incident_types')
    .select('*')
    .eq('participant_id', params.id)
    .order('when_to_call_000', { ascending: false })

  if (!incidents || incidents.length === 0) {
    return <p className="text-stone-500 text-sm">No incident protocols on file.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">Incident Protocols</h2>
        <p className="text-xs text-stone-400">Tap &quot;View response steps&quot; to expand</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
        <strong>Reminder:</strong> In any situation with immediate risk to life, call 000 first.
      </div>

      <div className="space-y-3">
        {incidents.map((incident: IncidentType) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  )
}
