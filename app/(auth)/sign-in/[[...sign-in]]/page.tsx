"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignIn, useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
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
  CheckCircle2,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import axios from 'axios'
import { loginCryptoSesions } from '@/lib/crypto/loginFlow'
import { sessionVault } from '@/lib/crypto/session-vault'
import { persistSessionKeys } from '@/lib/crypto/sessionPersistance'
import { useClerk } from '@clerk/nextjs'

type SecondFactorStrategy = 'phone_code' | 'totp' | 'backup_code'

export default function SignInPage() {


  const { signOut } = useClerk()

  // THIS USEEFFECT IS FOR CLEANING THE CLERK SESSION TRACKING SINCE WE ARE BUILDING ENCRYPTED SYSTEM EACH TIME THE USER OPENS THE APP FROM BROWSER THAY HAVE TO LOGINNNN
  useEffect(() => {
    // Automatically sign out any lingering session when entering the login page
    const clearLingeringSession = async () => {
      try {
        await signOut()
        sessionVault.clear() // clearing the sessionVault for safty
      } catch (err) {
        console.info('clerk session is clear.')
      }
    }
    clearLingeringSession()
  }, [signOut])


  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const { getToken } = useAuth()
  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [verifyCode, setVerifyCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Second-factor verification states
  const [isSecondFactor, setIsSecondFactor] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<SecondFactorStrategy>('totp')
  const [availableSecondFactors, setAvailableSecondFactors] = useState<any[]>([])


  const getTheCryptoSession = async () => {
    try {
      const jwtToken = await getToken()
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/security-sessions/`,
        {
          headers: {
            authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (res.data.status_code === 5000) {
        const sessionData = res.data.data

        // generating the payload to pass to our login flow
        const payload = {
          password: password,
          salt: sessionData.key_encryption_key_salt,
          encryptedMasterKey: sessionData.user_encrypted_master_key,
          encryptedPrivateKey: sessionData.user_encrypted_private_key,
          masterkeyNonce: sessionData.user_encrypted_master_key_nonce,
          privateKeyNonce: sessionData.user_encrypted_private_key_nonce,
          publicKey: sessionData.user_public_key,
        }

        const loggedInSession = await loginCryptoSesions(payload)

        if (loggedInSession == null) {
          toast.info("Cant complete the login with the crypto")
          return
        }

        sessionVault.setKeys(loggedInSession.masterKey, loggedInSession.privateKey, sessionData.user_public_key) // used to store the required variables in the in-memmory.

        await persistSessionKeys(
          loggedInSession.masterKey,
          loggedInSession.privateKey,
        );

        toast.success('Logged In successfully !')
        router.push('/dashboard')

      } else {
        toast.info(res.data.message)
      }
    } catch (error) {
      console.error('Error fetching crypto session:', error)
      toast.error('Failed to initialize security session.')
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

  // 1. Initial Sign-in Attempt
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isLoaded || !signIn) return

    if (!identifier.trim() || !password) {
      toast.error('Please enter your email/username and password.')
      return
    }

    setIsLoading(true)
    try {
      const signInAttempt = await signIn.create({
        identifier: identifier.trim(),
        password: password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        toast.success('Welcome back! Vault unlocked.')
        // WE HAVE TO ACCESS THE LOGIN CRYPTO FUNCTION HERE
        await getTheCryptoSession()
      } else if (signInAttempt.status === 'needs_second_factor') {

        const factors = signInAttempt.supportedSecondFactors || []
        setAvailableSecondFactors(factors)

        const hasTotp = factors.some((f) => f.strategy === 'totp')
        const hasPhone = factors.some((f) => f.strategy === 'phone_code')

        let defaultStrat: SecondFactorStrategy = 'totp'

        if (hasTotp) {
          defaultStrat = 'totp'
        } else if (hasPhone) {
          defaultStrat = 'phone_code'
          await signIn.prepareSecondFactor({ strategy: 'phone_code' })
          toast.info('Verification code sent to your phone.')
        } else if (factors.length > 0) {
          defaultStrat = factors[0].strategy as SecondFactorStrategy
        }

        setSelectedStrategy(defaultStrat)
        setIsSecondFactor(true)
      } else {
        console.warn('Sign-in status unhandled:', signInAttempt.status)
        toast.error(`Sign in status: ${signInAttempt.status}. Please check your credentials.`)
      }
    } catch (err: any) {
      console.error('Sign-in error:', err)
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid credentials. Please check your email/username and password.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Second-Factor Verification Attempt
  const handleSecondFactorVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isLoaded || !signIn) return

    if (!verifyCode.trim()) {
      toast.error('Please enter the verification code.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: selectedStrategy,
        code: verifyCode.trim(),
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Second-factor verification successful! Vault unlocked.')
        // LOGIN CRYPTO FUNCTION HANDLING
        await getTheCryptoSession()
      } else {
        console.error('Second factor verification status:', result.status)
        toast.error(`Verification status: ${result.status}`)
      }
    } catch (err: any) {
      console.error('Second factor verification error:', err)
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid verification code. Please try again.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code for phone 2FA
  const handleResendCode = async () => {
    if (!isLoaded || !signIn) return
    setIsLoading(true)
    try {
      if (selectedStrategy === 'phone_code') {
        await signIn.prepareSecondFactor({ strategy: 'phone_code' })
        toast.success('New SMS verification code sent!')
      }
    } catch (err: any) {
      console.error('Resend error:', err)
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Failed to resend code.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Switch 2FA Strategy
  const handleSwitchStrategy = async (strategy: SecondFactorStrategy) => {
    setSelectedStrategy(strategy)
    setVerifyCode('')
    if (strategy === 'phone_code') {
      try {
        await signIn?.prepareSecondFactor({ strategy: 'phone_code' })
        toast.info('Verification code sent to your phone.')
      } catch (err: any) {
        toast.error(err?.errors?.[0]?.longMessage || 'Failed to prepare phone verification.')
      }
    }
  }


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
            href="/sign-up"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            New here? <span className="font-semibold text-red-600 underline underline-offset-4">Create account</span>
          </Link>
        </div>

        {/* Center Card Content */}
        <div className="mx-auto w-full max-w-md my-auto py-6">
          <AnimatePresence mode="wait">
            {!isSecondFactor ? (
              <motion.div
                key="signin-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
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
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
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
                        onClick={() => toast.info('Please contact support or reset password via your account settings.')}
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
                    <Link href="/sign-up" className="font-semibold text-red-600 hover:underline">
                      Create account
                    </Link>
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="2fa-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center sm:text-left">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 mb-4 border border-red-500/20">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground font-figtree">
                    Two-Step Verification
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedStrategy === 'totp' && 'Enter the 6-digit code generated by your authenticator app.'}
                    {selectedStrategy === 'phone_code' && 'Enter the SMS verification code sent to your phone.'}
                    {selectedStrategy === 'backup_code' && 'Enter one of your emergency recovery backup codes.'}
                  </p>
                </div>

                <form onSubmit={handleSecondFactorVerification} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Verification Code</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder={selectedStrategy === 'backup_code' ? 'Enter backup code' : '123456'}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      className="w-full tracking-widest text-center text-xl font-mono font-bold rounded-xl border border-border bg-card/60 px-4 py-3 text-foreground transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="size-5" />
                        <span>Verifying & unlocking...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify and Unlock Vault</span>
                        <CheckCircle2 className="size-4" />
                      </>
                    )}
                  </button>

                  <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                    {selectedStrategy === 'phone_code' && (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 font-medium transition"
                      >
                        Didn't receive SMS? Resend code
                      </button>
                    )}

                    {availableSecondFactors.length > 1 && (
                      <div className="flex flex-wrap justify-center items-center gap-1.5 mt-1">
                        <span className="text-muted-foreground w-full text-center mb-1">Try another method:</span>
                        {availableSecondFactors.map((factor, idx) => {
                          if (factor.strategy === selectedStrategy) return null
                          const labels: Record<string, string> = {
                            totp: 'Authenticator App',
                            phone_code: 'SMS Code',
                            backup_code: 'Backup Code',
                          }
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSwitchStrategy(factor.strategy)}
                              className="rounded-lg border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground hover:bg-card hover:border-red-500/50 transition"
                            >
                              Use {labels[factor.strategy] || factor.strategy}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsSecondFactor(false)
                        setVerifyCode('')
                      }}
                      className="text-muted-foreground hover:text-foreground transition pt-2"
                    >
                      &larr; Back to sign in
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
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