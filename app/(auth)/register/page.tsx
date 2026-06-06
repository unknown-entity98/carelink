'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types/database'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ndisNumber, setNdisNumber] = useState('')
  const [workerCheck, setWorkerCheck] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleRoleSelect(r: Role) {
    setRole(r)
    setStep(2)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Registration failed. Please try again.')
      setLoading(false)
      return
    }

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      role,
      ndis_number: role === 'participant' ? ndisNumber : null,
      worker_screening_check: role === 'worker' ? workerCheck : null,
    })

    if (profileError) {
      setError('Account created but profile setup failed. Please contact support.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
      {step === 1 ? (
        <>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Create your account</h1>
          <p className="text-sm text-stone-500 mb-6">First, tell us who you are</p>

          <div className="space-y-3">
            {([
              { value: 'participant', label: 'NDIS Participant', desc: 'I am accessing support services' },
              { value: 'worker', label: 'Support Worker', desc: 'I provide support to NDIS participants' },
              { value: 'guardian', label: 'Guardian / Nominee', desc: 'I manage someone else\'s NDIS plan' },
            ] as { value: Role; label: string; desc: string }[]).map((r) => (
              <button
                key={r.value}
                onClick={() => handleRoleSelect(r.value)}
                className="w-full text-left border border-stone-200 hover:border-teal-400 hover:bg-teal-50 rounded-xl p-4 transition-colors group"
              >
                <p className="font-medium text-stone-900 group-hover:text-teal-800">{r.label}</p>
                <p className="text-sm text-stone-500 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <p className="text-sm text-stone-500 text-center mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-700 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-teal-700 hover:underline mb-4 flex items-center gap-1"
            aria-label="Go back to role selection"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-stone-900 mb-6">
            Register as {role === 'worker' ? 'Support Worker' : role === 'participant' ? 'Participant' : 'Guardian'}
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-stone-700 mb-1">
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-stone-700 mb-1">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {role === 'participant' && (
              <div>
                <label htmlFor="ndis-number" className="block text-sm font-medium text-stone-700 mb-1">
                  NDIS number <span className="text-stone-400">(optional)</span>
                </label>
                <input
                  id="ndis-number"
                  type="text"
                  value={ndisNumber}
                  onChange={(e) => setNdisNumber(e.target.value)}
                  placeholder="43XXXXXXXX"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {role === 'worker' && (
              <div>
                <label htmlFor="worker-check" className="block text-sm font-medium text-stone-700 mb-1">
                  NDIS Worker Screening Check number <span className="text-stone-400">(optional)</span>
                </label>
                <input
                  id="worker-check"
                  type="text"
                  value={workerCheck}
                  onChange={(e) => setWorkerCheck(e.target.value)}
                  placeholder="WSC-XXXXXXXXXX"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-stone-400 mt-1">Not verified in this PoC demo</p>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
