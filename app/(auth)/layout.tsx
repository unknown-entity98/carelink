import PrivacyBanner from '@/components/PrivacyBanner'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <PrivacyBanner />
      <div className="flex min-h-[calc(100vh-36px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-3xl font-bold text-teal-800 tracking-tight">CareLink</span>
            <p className="text-stone-500 text-sm mt-1">NDIS Support Platform</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
