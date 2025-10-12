import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { config } from '@/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
