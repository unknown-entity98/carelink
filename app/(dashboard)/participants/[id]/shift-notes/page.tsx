'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ShiftNoteForm from '@/components/ShiftNoteForm'
import { formatDate, moodLabel } from '@/lib/utils'
import type { ShiftNote } from '@/types/database'

export default function ShiftNotesPage() {
  const params = useParams()
  const participantId = params.id as string
  const [notes, setNotes] = useState<ShiftNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from('shift_notes')
      .select('*')
      .eq('participant_id', participantId)
      .eq('worker_profile_id', user.id)
      .order('shift_date', { ascending: false })
      .limit(50)
    setNotes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [participantId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">Shift Notes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Add shift note
        </button>
      </div>

      {showForm && userId && (
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h3 className="font-semibold text-stone-800 mb-4">New shift note</h3>
          <ShiftNoteForm
            participantId={participantId}
            workerProfileId={userId}
            onSuccess={() => { setShowForm(false); load() }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-stone-400 text-sm">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-stone-500 text-sm">No shift notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="bg-white border border-stone-200 rounded-xl p-4"
              aria-label={`Shift note for ${formatDate(note.shift_date)}`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-medium text-stone-900 text-sm">{formatDate(note.shift_date)}</span>
                <div className="flex items-center gap-2">
                  {note.mood_rating && (
                    <span className="text-xs text-stone-500">
                      Mood: <span className="font-medium text-stone-700">{moodLabel(note.mood_rating)}</span>
                    </span>
                  )}
                  {note.incidents_occurred && (
                    <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium">
                      Incident
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed font-lora">{note.note_text}</p>
              {note.incidents_occurred && note.incident_description && (
                <div className="mt-3 pt-3 border-t border-red-100 bg-red-50 rounded-lg p-2">
                  <p className="text-xs font-semibold text-red-700 mb-1">Incident details</p>
                  <p className="text-sm text-red-900">{note.incident_description}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
