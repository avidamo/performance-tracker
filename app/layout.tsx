import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CAM Growth Vault',
  description: 'Internal performance tracking app for CAM goals, updates, and monthly summaries.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
