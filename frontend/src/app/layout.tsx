import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'CHC Insight CRM',
  description: 'Comprehensive CRM application for Long-Term Services and Supports (LTSS)',
  keywords: ['CRM', 'Healthcare', 'LTSS', 'Survey Management'],
  authors: [{ name: 'CHC Insight Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div id="root">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}