import { createServiceClient } from '@/lib/supabase/server'
import type { Medication, Diagnosis } from '@/types/database'
import { formatDate } from '@/lib/utils'

export default async function MedicalPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()
  const { data: medical } = await service
    .from('medical_info')
    .select('*')
    .eq('participant_id', params.id)
    .single()

  if (!medical) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Medical Information</h2>
        <p className="text-stone-500 text-sm">No medical information on file.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-stone-800">Medical Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(medical.gp_name || medical.gp_phone) && (
          <section className="bg-white border border-stone-200 rounded-xl p-4" aria-labelledby="gp-heading">
            <h3 id="gp-heading" className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">General Practitioner</h3>
            <p className="font-medium text-stone-900">{medical.gp_name ?? '—'}</p>
            {medical.gp_phone && (
              <a href={`tel:${medical.gp_phone}`} className="text-sm text-teal-700 hover:underline mt-1 block">
                {medical.gp_phone}
              </a>
            )}
          </section>
        )}

        {(medical.specialist_name || medical.specialist_phone) && (
          <section className="bg-white border border-stone-200 rounded-xl p-4" aria-labelledby="specialist-heading">
            <h3 id="specialist-heading" className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Specialist</h3>
            <p className="font-medium text-stone-900">{medical.specialist_name ?? '—'}</p>
            {medical.specialist_phone && (
              <a href={`tel:${medical.specialist_phone}`} className="text-sm text-teal-700 hover:underline mt-1 block">
                {medical.specialist_phone}
              </a>
            )}
          </section>
        )}
      </div>

      {medical.medications && medical.medications.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-xl p-5" aria-labelledby="meds-heading">
          <h3 id="meds-heading" className="font-semibold text-stone-800 mb-3">Medications</h3>
          <div className="space-y-3">
            {medical.medications.map((med: Medication, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">{med.name}</span>
                    <span className="text-sm text-stone-600">{med.dose}</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5">{med.frequency}</p>
                  {med.notes && <p className="text-xs text-stone-400 mt-0.5 italic">{med.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {medical.diagnoses && medical.diagnoses.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-xl p-5" aria-labelledby="dx-heading">
          <h3 id="dx-heading" className="font-semibold text-stone-800 mb-3">Diagnoses</h3>
          <div className="space-y-3">
            {medical.diagnoses.map((dx: Diagnosis, i: number) => (
              <div key={i} className="py-2 border-b border-stone-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900">{dx.condition}</span>
                  {dx.diagnosed_date && (
                    <span className="text-xs text-stone-400">Diagnosed {formatDate(dx.diagnosed_date)}</span>
                  )}
                </div>
                {dx.notes && <p className="text-sm text-stone-600 mt-0.5">{dx.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medical.medicare_number && (
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Medicare number</p>
            <p className="font-medium text-stone-900 mt-1">{medical.medicare_number}</p>
          </div>
        )}
        {medical.health_insurance && (
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Health insurance</p>
            <p className="font-medium text-stone-900 mt-1">{medical.health_insurance}</p>
          </div>
        )}
      </div>
    </div>
  )
}
