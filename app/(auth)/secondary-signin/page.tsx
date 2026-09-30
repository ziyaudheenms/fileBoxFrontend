"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  KeyRound,
  LockKeyhole,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function SecondarySignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isLoaded) return

    if (!email.trim() || !password) {
      toast.error('Please enter your email/username and password.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password: password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        console.error('Sign in status:', result.status)
        toast.error('Unable to complete sign in. Please verify your credentials.')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      const errorMsg =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        'Invalid credentials. Please check your email and password.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const signinFeatures = [
    {
      icon: LockKeyhole,
      title: 'Zero-Knowledge Vault',
      desc: 'Client-side encrypted file access for maximum privacy',
    },
    {
      icon: Zap,
      title: 'Instant Session Restore',
      desc: 'Jump straight into your recent files and active workspaces',
    },
    {
      icon: ShieldCheck,
      title: 'Real-Time Threat Protection',
      desc: 'Continuous anomaly detection on every file transfer',
    },
  ]

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-background selection:bg-red-500/20">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/10 blur-[128px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-red-500/10 blur-[140px]" />
      </div>

      {/* Left Column: Form Section */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        {/* Mobile / Top Header */}
        <div className="flex items-center justify-between pb-8">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 p-2 shadow-inner border border-red-500/20">
              <Image src="/file.svg" alt="FileBox Logo" width={22} height={22} className="brightness-90 dark:invert" />
            </div>
            <div>
              <span className="font-figtree text-lg font-bold tracking-tight text-foreground">FileBox</span>
            </div>
          </Link>
          <Link
            href="/secondary-sign-up"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            New here? <span className="font-semibold text-red-600 underline underline-offset-4">Create account</span>
          </Link>
        </div>

        {/* Center Card Content */}
        <div className="mx-auto w-full max-w-md my-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-500 mb-3">
                <KeyRound className="size-3.5" />
                <span>Vault Access</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-figtree">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your credentials to unlock your secured files and folders.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email / Identifier */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="name@domain.com or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('Please contact support or use standard sign-in for password recovery.')}
                    className="text-xs text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card/60 px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                />
                <label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Remember this device for 30 days
                </label>
              </div>

              <div id="clerk-captcha" />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition duration-200 hover:bg-red-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="size-5" />
                    <span>Unlocking your vault...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Vault</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/secondary-sign-up" className="font-semibold text-red-600 hover:underline">
                  Create account
                </Link>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground text-center sm:text-left pt-6">
          FileBox Vault &bull; 256-Bit SSL End-to-End Protection
        </div>
      </div>

      {/* Right Column: Distinct Sign-In Branding (Vault & Security Focused) */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative flex-col justify-between overflow-hidden bg-[#0a0a0c] p-12 text-white border-l border-zinc-800/80">
        {/* Subtle decorative concentric rings & dark ruby glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-red-600/15 blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wider text-zinc-400">VAULT STATUS: SECURE</span>
          </div>
          <span className="rounded-full bg-red-600/15 border border-red-500/30 px-2.5 py-1 text-[11px] font-medium text-red-400">
            TLS 1.3
          </span>
        </div>

        {/* Center: Large Glowing Vault Emblem + Name + Security Highlights */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-sm mx-auto space-y-6 py-4">
          {/* Logo in Vault Badge Frame */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-full bg-red-600/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-red-500/30 bg-gradient-to-b from-zinc-900 to-black p-5 shadow-2xl shadow-red-950">
              <Image src="/file.svg" alt="FileBox Vault" width={52} height={52} className="invert brightness-200" priority />
            </div>
          </motion.div>

          {/* Brand Name & Security Tagline */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-figtree text-white">
              FileBox <span className="text-red-500 font-light">Vault</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Your encrypted personal cloud, ready whenever you return.
            </p>
          </div>

          {/* Key Security Points */}
          <div className="w-full pt-4 space-y-3 text-left border-t border-zinc-800/80">
            {signinFeatures.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 mt-0.5">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 text-center text-xs text-zinc-500 font-mono text-[11px]">
          Encrypted Authentication Node &bull; AES-256
        </div>
      </div>
    </div>
  )
}
