'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ShiftNoteFormProps {
  participantId: string
  workerProfileId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ShiftNoteForm({
  participantId,
  workerProfileId,
  onSuccess,
  onCancel,
}: ShiftNoteFormProps) {
  const [noteText, setNoteText] = useState('')
  const [moodRating, setMoodRating] = useState<number>(3)
  const [incidentsOccurred, setIncidentsOccurred] = useState(false)
  const [incidentDescription, setIncidentDescription] = useState('')
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('shift_notes').insert({
      worker_profile_id: workerProfileId,
      participant_id: participantId,
      shift_date: shiftDate,
      note_text: noteText.trim(),
      mood_rating: moodRating,
      incidents_occurred: incidentsOccurred,
      incident_description: incidentsOccurred ? incidentDescription.trim() : null,
    })

    setLoading(false)
    if (insertError) {
      setError('Failed to save shift note. Please try again.')
    } else {
      onSuccess?.()
    }
  }

  const moodLabels = ['', 'Very low', 'Low', 'Neutral', 'Good', 'Great']

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Shift note form">
      <div>
        <label htmlFor="shift-date" className="block text-sm font-medium text-stone-700 mb-1">
          Shift date
        </label>
        <input
          id="shift-date"
          type="date"
          value={shiftDate}
          onChange={(e) => setShiftDate(e.target.value)}
          required
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label htmlFor="note-text" className="block text-sm font-medium text-stone-700 mb-1">
          Shift notes <span className="text-red-500">*</span>
        </label>
        <textarea
          id="note-text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          required
          rows={5}
          placeholder="Describe what happened during the shift..."
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-stone-700 mb-2">
          Participant mood: <span className="font-semibold text-teal-700">{moodLabels[moodRating]}</span>
        </legend>
        <div className="flex gap-2" role="group" aria-label="Mood rating">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={moodRating === v}
              aria-label={`Mood: ${moodLabels[v]}`}
              onClick={() => setMoodRating(v)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                moodRating === v
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-teal-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={incidentsOccurred}
            onChange={(e) => setIncidentsOccurred(e.target.checked)}
            className="w-4 h-4 accent-teal-700"
            aria-describedby="incidents-help"
          />
          <span className="text-sm font-medium text-stone-700">Incidents occurred during shift</span>
        </label>
        <p id="incidents-help" className="text-xs text-stone-500 mt-0.5 ml-6">
          Check this if any reportable incidents occurred
        </p>
      </div>

      {incidentsOccurred && (
        <div>
          <label htmlFor="incident-desc" className="block text-sm font-medium text-stone-700 mb-1">
            Incident description
          </label>
          <textarea
            id="incident-desc"
            value={incidentDescription}
            onChange={(e) => setIncidentDescription(e.target.value)}
            rows={3}
            placeholder="Describe the incident(s)..."
            className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !noteText.trim()}
          className="flex-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save shift note'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
