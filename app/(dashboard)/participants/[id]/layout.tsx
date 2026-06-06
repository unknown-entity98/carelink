import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAvatarUrl } from '@/lib/utils'

const tabs = [
  { href: '', label: 'Overview' },
  { href: '/manual', label: 'Support Manual' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/dietary', label: 'Dietary' },
  { href: '/medical', label: 'Medical' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/bsp', label: 'BSP' },
  { href: '/shift-notes', label: 'Shift Notes' },
]

export default async function ParticipantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  // Verify access
  const { data: link } = await service
    .from('worker_participant_links')
    .select('id')
    .eq('worker_profile_id', user.id)
    .eq('participant_id', params.id)
    .eq('status', 'approved')
    .single()

  if (!link) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto mt-12">
        <div className="text-5xl mb-4" aria-hidden="true">🔒</div>
        <h1 className="text-xl font-semibold text-stone-900 mb-2">Access denied</h1>
        <p className="text-stone-500 text-sm mb-6">
          You are not approved to view this participant&apos;s profile.
          Please contact your support coordinator to request access.
        </p>
        <Link href="/dashboard" className="text-teal-700 hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const { data: participant } = await service
    .from('participants')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!participant) notFound()

  const photoUrl = participant.profile_photo_url ?? getAvatarUrl(participant.preferred_name ?? 'user')
  const base = `/participants/${params.id}`

  return (
    <div className="flex flex-col h-full">
      {/* Participant header */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-4">
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          <Image
            src={photoUrl}
            alt={`Photo of ${participant.preferred_name}`}
            width={52}
            height={52}
            className="rounded-full bg-stone-100 border border-stone-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-stone-900 text-lg">{participant.preferred_name}</h1>
              {participant.pronoun && (
                <span className="text-sm text-stone-500">({participant.pronoun})</span>
              )}
            </div>
            <p className="text-sm text-stone-500 truncate">{participant.primary_disability}</p>
          </div>
          <Link
            href={`/chat/${params.id}`}
            className="ml-auto flex-shrink-0 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            AI assistant
          </Link>
        </div>

        {/* Tab nav */}
        <nav
          aria-label="Participant sections"
          className="flex gap-1 mt-4 overflow-x-auto max-w-5xl mx-auto"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={`${base}${tab.href}`}
              className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-700 transition-colors whitespace-nowrap"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
