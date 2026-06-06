import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PrivacyBanner from '@/components/PrivacyBanner'
import Navigation from '@/components/Navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PrivacyBanner />
      <div className="flex flex-1">
        <Navigation />
        <main
          className="flex-1 min-w-0 pb-16 md:pb-0"
          id="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
