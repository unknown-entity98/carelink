import { createServiceClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { SupportManual, DietaryRequirement } from '@/types/database'

export default async function ParticipantOverviewPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()

  const [
    { data: participant },
    { data: criticalManuals },
    { data: lifeThreatDietary },
  ] = await Promise.all([
    service.from('participants').select('*').eq('id', params.id).single(),
    service.from('support_manuals').select('*').eq('participant_id', params.id).eq('is_critical', true),
    service.from('dietary_requirements').select('*').eq('participant_id', params.id).eq('severity', 'life_threatening'),
  ])

  if (!participant) return null

  const hasCritical = (criticalManuals?.length ?? 0) > 0 || (lifeThreatDietary?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      {hasCritical && (
        <section
          aria-labelledby="critical-alerts-heading"
          className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-4"
        >
          <h2 id="critical-alerts-heading" className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span aria-hidden="true">⚠️</span> Critical alerts
          </h2>
          <div className="space-y-2">
            {criticalManuals?.map((m: SupportManual) => (
              <div key={m.id} className="text-sm text-red-900">
                <span className="font-medium">{m.title}:</span> {m.content.slice(0, 150)}{m.content.length > 150 ? '…' : ''}
              </div>
            ))}
            {lifeThreatDietary?.map((d: DietaryRequirement) => (
              <div key={d.id} className="text-sm text-red-900">
                <span className="font-medium">ALLERGY — {d.requirement_type}:</span> {d.description}
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="basic-info-heading" className="bg-white border border-stone-200 rounded-xl p-5">
        <h2 id="basic-info-heading" className="font-semibold text-stone-800 mb-4">Profile overview</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">Preferred name</dt>
            <dd className="text-stone-900 mt-1">{participant.preferred_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">Pronouns</dt>
            <dd className="text-stone-900 mt-1">{participant.pronoun ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">Date of birth</dt>
            <dd className="text-stone-900 mt-1">{formatDate(participant.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">Primary disability</dt>
            <dd className="text-stone-900 mt-1">{participant.primary_disability ?? '—'}</dd>
          </div>
          {participant.secondary_disabilities && participant.secondary_disabilities.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">Secondary conditions</dt>
              <dd className="text-stone-900 mt-1">{participant.secondary_disabilities.join(', ')}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">Communication profile</dt>
            <dd className="text-stone-900 mt-1 leading-relaxed font-lora">{participant.communication_profile ?? '—'}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
