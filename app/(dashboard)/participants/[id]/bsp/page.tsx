import { createServiceClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function BspPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()
  const { data: bsp } = await service
    .from('behaviour_support_plans')
    .select('*')
    .eq('participant_id', params.id)
    .single()

  if (!bsp) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Behaviour Support Plan</h2>
        <p className="text-stone-500 text-sm">No behaviour support plan on file.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">{bsp.title}</h2>
          {bsp.last_reviewed && (
            <p className="text-sm text-stone-500 mt-0.5">
              Last reviewed: {formatDate(bsp.last_reviewed)}
              {bsp.reviewed_by && ` by ${bsp.reviewed_by}`}
            </p>
          )}
        </div>
        {bsp.document_url && (
          <a
            href={bsp.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-sm text-teal-700 hover:underline border border-teal-300 px-3 py-1.5 rounded-lg"
          >
            View PDF
          </a>
        )}
      </div>

      {bsp.summary && (
        <section className="bg-white border border-stone-200 rounded-xl p-5" aria-labelledby="summary-heading">
          <h3 id="summary-heading" className="font-semibold text-stone-800 mb-2">Summary</h3>
          <p className="text-stone-700 leading-relaxed font-lora text-sm">{bsp.summary}</p>
        </section>
      )}

      {bsp.triggers && bsp.triggers.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5" aria-labelledby="triggers-heading">
          <h3 id="triggers-heading" className="font-semibold text-amber-900 mb-3">
            Known triggers
          </h3>
          <ul className="space-y-2" aria-label="List of known triggers">
            {bsp.triggers.map((trigger: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span aria-hidden="true" className="mt-0.5 text-amber-600">•</span>
                {trigger}
              </li>
            ))}
          </ul>
        </section>
      )}

      {bsp.de_escalation_strategies && bsp.de_escalation_strategies.length > 0 && (
        <section className="bg-teal-50 border border-teal-200 rounded-xl p-5" aria-labelledby="deescalation-heading">
          <h3 id="deescalation-heading" className="font-semibold text-teal-900 mb-3">
            De-escalation strategies
          </h3>
          <ol className="space-y-2" aria-label="De-escalation steps">
            {bsp.de_escalation_strategies.map((strategy: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-teal-900">
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center mt-0.5"
                >
                  {i + 1}
                </span>
                {strategy}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
