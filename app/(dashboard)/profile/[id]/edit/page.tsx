'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Participant } from '@/types/database'

export default function ProfileEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<Partial<Participant>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('participants').select('*').eq('profile_id', id).single()
      if (data) setForm(data)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('participants')
      .update({
        preferred_name: form.preferred_name,
        pronoun: form.pronoun,
        primary_disability: form.primary_disability,
        communication_profile: form.communication_profile,
      })
      .eq('profile_id', id)

    setSaving(false)
    if (error) {
      setError('Failed to save. Please try again.')
    } else {
      setSuccess(true)
    }
  }

  if (loading) return <div className="p-8 text-stone-400">Loading...</div>

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Edit profile</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <div>
            <label htmlFor="preferred-name" className="block text-sm font-medium text-stone-700 mb-1">
              Preferred name
            </label>
            <input
              id="preferred-name"
              type="text"
              value={form.preferred_name ?? ''}
              onChange={(e) => setForm({ ...form, preferred_name: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="pronoun" className="block text-sm font-medium text-stone-700 mb-1">
              Pronouns
            </label>
            <input
              id="pronoun"
              type="text"
              value={form.pronoun ?? ''}
              onChange={(e) => setForm({ ...form, pronoun: e.target.value })}
              placeholder="e.g. she/her, he/him, they/them"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="primary-disability" className="block text-sm font-medium text-stone-700 mb-1">
              Primary disability
            </label>
            <input
              id="primary-disability"
              type="text"
              value={form.primary_disability ?? ''}
              onChange={(e) => setForm({ ...form, primary_disability: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="comm-profile" className="block text-sm font-medium text-stone-700 mb-1">
              Communication profile
            </label>
            <textarea
              id="comm-profile"
              value={form.communication_profile ?? ''}
              onChange={(e) => setForm({ ...form, communication_profile: e.target.value })}
              rows={4}
              placeholder="Describe how you prefer to communicate..."
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            Profile saved successfully.
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
