import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lead Generation System',
  description: 'Generate lead pages using AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
