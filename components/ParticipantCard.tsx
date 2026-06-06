'use client'

import Image from 'next/image'
import Link from 'next/link'
import AlertBadge from './AlertBadge'
import { formatDate, getAvatarUrl } from '@/lib/utils'
import type { Participant, ShiftNote } from '@/types/database'

interface ParticipantCardProps {
  participant: Participant
  lastShiftNote?: ShiftNote | null
  hasCritical?: boolean
  workerId?: string
}

export default function ParticipantCard({
  participant,
  lastShiftNote,
  hasCritical = false,
}: ParticipantCardProps) {
  const photoUrl = participant.profile_photo_url ?? getAvatarUrl(participant.preferred_name ?? 'user')

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex gap-4 items-start hover:border-teal-300 transition-colors">
      <div className="relative flex-shrink-0">
        <Image
          src={photoUrl}
          alt={`Photo of ${participant.preferred_name}`}
          width={56}
          height={56}
          className="rounded-full bg-stone-100 border border-stone-200"
        />
        <span className="absolute -top-1 -right-1">
          <AlertBadge hasCritical={hasCritical} />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-stone-900 truncate">{participant.preferred_name}</h3>
          {participant.pronoun && (
            <span className="text-xs text-stone-500 flex-shrink-0">({participant.pronoun})</span>
          )}
        </div>
        <p className="text-sm text-stone-600 mt-0.5 truncate">{participant.primary_disability}</p>
        {lastShiftNote ? (
          <p className="text-xs text-stone-400 mt-1">
            Last shift: {formatDate(lastShiftNote.shift_date)}
          </p>
        ) : (
          <p className="text-xs text-stone-400 mt-1">No shift notes yet</p>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        <Link
          href={`/participants/${participant.id}`}
          className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Profile
        </Link>
        <Link
          href={`/chat/${participant.id}`}
          className="text-xs bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition-colors text-center"
        >
          Start shift
        </Link>
      </div>
    </div>
  )
}
