import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'GMVN Control Tower',
  description: 'Guest Feedback & Inventory Management — Garhwal Mandal Vikas Nigam',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
