import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { config } from '@/config';

import { ThemeScript } from '@/components/providers/theme-script';
import { Providers } from '@/providers';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: config.app.name,
    template: `%s | ${config.app.name}`,
  },
  description:
    'Comprehensive CRM application for Long-Term Services and Supports (LTSS) business within Managed Care Organization (MCO) environments.',
  keywords: ['CRM', 'Healthcare', 'LTSS', 'MCO', 'Survey Management', 'Compliance'],
  authors: [{ name: 'CHC Insight Team' }],
  creator: 'CHC Insight',
  publisher: 'CHC Insight',
  robots: {
    index: config.app.environment === 'production',
    follow: config.app.environment === 'production',
  },
  metadataBase: new URL('http://localhost:3000'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />

      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
