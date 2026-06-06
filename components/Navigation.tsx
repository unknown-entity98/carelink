'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/participants', label: 'Participants', icon: '♿' },
  { href: '/shift-notes', label: 'Shift Notes', icon: '📋' },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex flex-col w-60 min-h-screen bg-teal-900 text-white p-4 gap-1 flex-shrink-0"
      >
        <div className="mb-6 px-2 py-3">
          <span className="text-xl font-bold text-white tracking-tight">CareLink</span>
          <span className="block text-xs text-teal-300 mt-0.5">NDIS Support Platform</span>
        </div>

        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-100 hover:bg-teal-800 hover:text-white'
              }`}
            >
              <span aria-hidden="true" className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div className="mt-auto">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-800 hover:text-white transition-colors"
          >
            <span aria-hidden="true" className="text-base w-5 text-center">→</span>
            Sign out
          </button>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex z-40"
      >
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                active ? 'text-teal-700' : 'text-stone-500'
              }`}
            >
              <span aria-hidden="true" className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
