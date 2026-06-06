import { createServiceClient } from '@/lib/supabase/server'
import type { EmergencyContact } from '@/types/database'

export default async function ContactsPage({ params }: { params: { id: string } }) {
  const service = await createServiceClient()
  const { data: contacts } = await service
    .from('emergency_contacts')
    .select('*')
    .eq('participant_id', params.id)
    .order('is_primary_contact', { ascending: false })

  if (!contacts || contacts.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Emergency Contacts</h2>
        <p className="text-stone-500 text-sm">No emergency contacts on file.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Emergency Contacts</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
        In an emergency, call <strong>000</strong> first, then notify contacts below.
      </div>

      <div className="space-y-3">
        {contacts.map((contact: EmergencyContact) => (
          <article
            key={contact.id}
            className={`bg-white border rounded-xl p-4 ${
              contact.is_primary_contact ? 'border-teal-300 ring-1 ring-teal-200' : 'border-stone-200'
            }`}
            aria-label={`${contact.full_name} — ${contact.relationship}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-900">{contact.full_name}</h3>
                  {contact.is_primary_contact && (
                    <span className="text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500 mt-0.5">{contact.relationship}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <a
                  href={`tel:${contact.phone_primary}`}
                  className="block text-teal-700 hover:underline font-medium text-sm"
                  aria-label={`Call ${contact.full_name} on ${contact.phone_primary}`}
                >
                  {contact.phone_primary}
                </a>
                {contact.phone_secondary && (
                  <a
                    href={`tel:${contact.phone_secondary}`}
                    className="block text-stone-500 hover:underline text-xs mt-0.5"
                    aria-label={`Secondary number: ${contact.phone_secondary}`}
                  >
                    {contact.phone_secondary}
                  </a>
                )}
              </div>
            </div>
            {contact.notes && (
              <p className="text-sm text-stone-600 mt-2 pt-2 border-t border-stone-100">{contact.notes}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
