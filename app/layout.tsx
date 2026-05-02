// app/layout.tsx (server component)
import './globals.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Instrument_Sans, Syne } from 'next/font/google'
import ClientProviders from './ClientProvider';
import AppShell from './ui/AppShell';

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-accent",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'IntelliFone',
    template: '%s | IntelliFone',
  },
  description: 'AI-powered phone marketplace with damage detection and smart recommendations.',
  icons: {
    icon: [
      { url: '/if-logo.png', type: 'image/png' },
    ],
    shortcut: '/if-logo.png',
    apple: '/if-logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${syne.variable}`}>
        <ClientProviders>
          <AppShell> {children}</AppShell>  
        </ClientProviders>
      </body>
    </html>
  )
}
