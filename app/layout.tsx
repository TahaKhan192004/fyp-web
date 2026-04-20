// app/layout.tsx (server component)
import './globals.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ClientProviders from './ClientProvider';
import AppShell from './ui/AppShell';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'IntelliFone',
    template: '%s | IntelliFone',
  },
  description: 'AI-powered phone marketplace with damage detection and smart recommendations.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <AppShell> {children}</AppShell>  
        </ClientProviders>
      </body>
    </html>
  )
}
