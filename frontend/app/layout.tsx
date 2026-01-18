import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "EduNova - Educational Management System",
  description: "Comprehensive educational management platform for administrators, teachers, and students",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense>
            {children}
          </Suspense>
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  )
}
