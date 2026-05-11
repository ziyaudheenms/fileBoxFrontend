import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import StoreProvider from '@/providers/storeProvider'
import { ThemeProvider } from "@/components/theme-provider"


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CloudVault',
  description: 'Your Cloud Storage',
}


export default function RootLayout({
  
  children,
}: Readonly<{
  children: React.ReactNode
}>)


{
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>
              {children}
            </StoreProvider>
            <Toaster richColors/>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}