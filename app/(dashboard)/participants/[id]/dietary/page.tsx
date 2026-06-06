import { createServiceClient } from '@/lib/supabase/server'
import { severityColor } from '@/lib/utils'
import type { DietaryRequirement } from '@/types/database'

const typeLabels: Record<string, string> = {
  allergy: 'Allergy',
  intolerance: 'Intolerance',
  preference: 'Preference',
  texture: 'Texture',
  religious: 'Religious',
  medical: 'Medical',
}

const severityLabels: Record<string, string> = {
  life_threatening: 'LIFE-THREATENING',
  serious: 'Serious',
  mild: 'Mild',
  preference: 'Preference',
}

export default async function DietaryPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()
  const { data: dietary } = await service
    .from('dietary_requirements')
    .select('*')
    .eq('participant_id', params.id)
    .order('severity', { ascending: true })

  if (!dietary || dietary.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Dietary Requirements</h2>
        <p className="text-stone-500 text-sm">No dietary requirements on file.</p>
      </div>
    )
  }

  const lifeThreateningItems = dietary.filter((d: DietaryRequirement) => d.severity === 'life_threatening')
  const otherItems = dietary.filter((d: DietaryRequirement) => d.severity !== 'life_threatening')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Dietary Requirements</h2>

      {lifeThreateningItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span aria-hidden="true">⚠️</span> Life-threatening — must be observed at all times
          </h3>
          <div className="space-y-3">
            {lifeThreateningItems.map((item: DietaryRequirement) => (
              <div key={item.id}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-red-700 text-white px-2 py-0.5 rounded">
                    {typeLabels[item.requirement_type] ?? item.requirement_type}
                  </span>
                  <span className="font-medium text-red-900">{item.description}</span>
                </div>
                {item.notes && <p className="text-sm text-red-700 mt-1">{item.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {otherItems.length > 0 && (
        <div className="space-y-3">
          {otherItems.map((item: DietaryRequirement) => (
            <article
              key={item.id}
              className={`bg-white border rounded-xl p-4 ${severityColor(item.severity)}`}
              aria-label={`${item.description} — ${severityLabels[item.severity]}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                      {typeLabels[item.requirement_type] ?? item.requirement_type}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded border">
                      {severityLabels[item.severity] ?? item.severity}
                    </span>
                  </div>
                  <p className="font-medium text-stone-900 mt-1.5">{item.description}</p>
                  {item.notes && <p className="text-sm text-stone-600 mt-1">{item.notes}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
