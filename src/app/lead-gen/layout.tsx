import React from 'react'
import '@/styles/globals.css' // Import global CSS for Tailwind

export default function LeadGenLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background font-sans antialiased">{children}</div>
}
