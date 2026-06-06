import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareLink — NDIS Support Platform',
  description: 'A platform for NDIS participants and support workers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  )
}
