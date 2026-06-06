import { createServiceClient } from '@/lib/supabase/server'
import type { SupportManual } from '@/types/database'

const categoryLabels: Record<string, string> = {
  daily_routine: 'Daily Routine',
  communication: 'Communication',
  mobility: 'Mobility',
  personal_care: 'Personal Care',
  general: 'General',
}

export default async function ManualPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()
  const { data: manuals } = await service
    .from('support_manuals')
    .select('*')
    .eq('participant_id', params.id)
    .order('is_critical', { ascending: false })

  if (!manuals || manuals.length === 0) {
    return <p className="text-stone-500 text-sm">No support manual entries on file.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Support Manual</h2>
      {manuals.map((manual: SupportManual) => (
        <article
          key={manual.id}
          aria-label={manual.title}
          className={`bg-white border rounded-xl overflow-hidden ${
            manual.is_critical
              ? 'border-red-200 border-l-4 border-l-red-500 bg-red-50'
              : 'border-stone-200'
          }`}
        >
          <div className="px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-stone-900">{manual.title}</h3>
                  {manual.is_critical && (
                    <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                      Critical
                    </span>
                  )}
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                    {categoryLabels[manual.category] ?? manual.category}
                  </span>
                </div>
                <div className="mt-3 text-sm text-stone-700 leading-relaxed font-lora whitespace-pre-wrap">
                  {manual.content}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
