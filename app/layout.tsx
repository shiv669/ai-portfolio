import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Grotesk, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const _syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: 'Shivam Gawali',
  description: 'Portfolio of Shivam Gawali',
  generator: 'Shivam Gawali',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.ico',
        type: 'image/svg+xml',
      },
    ],
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
