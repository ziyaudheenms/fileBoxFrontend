"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignUp, useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import axios from 'axios'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Cloud,
  Share2,
  Layers,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { getSodium } from '@/lib/sodium'  //used to load the Wasm version of libsodium asynchronously for cryptographic operations
import { cryptoResponce } from '@/data/crypto'
import { cryptoUserRegistration } from '@/lib/crypto/registration'
import { sessionVault } from '@/lib/crypto/session-vault'
import { persistSessionKeys } from '@/lib/crypto/sessionPersistance'
import { useClerk } from '@clerk/nextjs'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getSodium().then(() => setReady(true))   /// ensuring that the Wasm version of the libsodium library is fully loaded.
  }, [])


  const signupFeatures = [
    {
      icon: Cloud,
      title: '15 GB Free Cloud Storage',
      desc: 'Generous initial quota with seamless scalable upgrades',
    },
    {
      icon: Share2,
      title: 'Smart Sharing & Permissions',
      desc: 'Password protection, download limits, and link expiration',
    },
    {
      icon: Layers,
      title: 'Instant Multi-Format Previews',
      desc: 'Inspect media, documents, and code files directly in browser',
    },
  ]


  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isLoaded || !signUp) return

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password) {
      toast.error('Please fill in all the required fields.')
      return
    }

    setIsLoading(true)
    try {
      await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        emailAddress: email.trim(),
        password: password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      setIsVerifying(true)
      toast.info('Verification code sent to your email.')
    } catch (error: any) {
      console.error('Sign up error:', error)
      const errorMsg =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        'Something went wrong during sign up.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isLoaded || !signUp) return

    if (!verifyCode.trim()) {
      toast.error('Please enter the verification code.')
      return
    }

    setIsLoading(true)
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verifyCode.trim(),
      })

      if (signUpAttempt?.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
        })

        //Actually the clerk registration is completed and the user is set as logged in...
        // once the clerk Authentication is successfull we have to do the crypto registration
        const registration = await cryptoUserRegistration(password)


        if (!registration) {
          toast.error("Opss!!! cant complete the crypto registration.....")
          toast.info("trying again to initiate the cryto registration process")
        }
        else {
          const { payload, freshSession } = registration
          try {
            // here since the clerk session is verified as logged in, all the required data which that is used to create the record in the backend is analyzed from the reuest using clerk python SDK
            const jwtToken = await getToken()
            if (process.env.NEXT_PUBLIC_DOMAIN) {
              await axios.post(
                `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/createUser/`,
                {
                  payload: payload  // passing the crypto payload data which that we need
                },
                {
                  headers: {
                    authorization: `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              )
            }

            sessionVault.setKeys(freshSession.masterKey, freshSession.privateKey, freshSession.publicKey) // used to store the required variables in the in-memmory.
            
            await persistSessionKeys(
              freshSession.masterKey,
              freshSession.privateKey,
            );

            toast.success('Account created successfully! Welcome aboard.')
            router.push('/dashboard')

          } catch (apiError) {
            console.error('API createUser error:', apiError)
            sessionVault.clear() // clearing the sessionVault for safty
            await signOut()  // signing out from the clerk so that 
          }

        }


      } else {
        console.error('Sign-up status incomplete:', signUpAttempt?.status)
        toast.error('Verification could not be completed. Please try again.')
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid or expired verification code.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })
      toast.success('New verification code sent to your email.')
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to resend code.')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-background selection:bg-red-500/20">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/10 blur-[128px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]" />
      </div>

      {/* Left Column: Interactive Form */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        {/* Mobile / Top Header */}
        <div className="flex items-center justify-between pb-8">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600/20 to-orange-500/20 p-2 shadow-inner border border-red-500/20">
              <Image src="/file.svg" alt="FileBox Logo" width={22} height={22} className="brightness-90 dark:invert" />
            </div>
            <div>
              <span className="font-figtree text-lg font-bold tracking-tight text-foreground">FileBox</span>
            </div>
          </Link>
          <Link
            href="/sign-in"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            Already registered? <span className="font-semibold text-red-600 underline underline-offset-4">Sign In</span>
          </Link>
        </div>

        {/* Center Card Content */}
        <div className="mx-auto w-full max-w-md my-auto py-6">
          <AnimatePresence mode="wait">
            {!isVerifying ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-500 mb-3">
                    <Sparkles className="size-3.5" />
                    <span>Create Your Cloud</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground font-figtree">
                    Get started with FileBox
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Set up your workspace in under a minute. No credit card required.
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        First name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        Last name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <span className="text-muted-foreground font-mono text-xs">@</span>
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5 text-muted-foreground" />
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Lock className="size-3.5 text-muted-foreground" />
                      Password
                    </label>
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
                        <span>Setting up your cloud...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Started Free</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="verify-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center sm:text-left">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 mb-4 border border-red-500/20">
                    <KeyRound className="size-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground font-figtree">
                    Verify your email
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a verification code to <span className="font-semibold text-foreground">{email}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerification} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Verification Code</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="123456"
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
                        <span>Verifying code...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Sign Up</span>
                        <CheckCircle2 className="size-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsVerifying(false)}
                      className="text-muted-foreground hover:text-foreground transition"
                    >
                      ← Back to details
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-red-600 hover:text-red-700 font-medium transition"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground text-center sm:text-left pt-6">
          FileBox Cloud &bull; Fast, Secure, and Unlimited Sharing
        </div>
      </div>

      {/* Right Column: Distinct Sign-Up Branding (Cloud & Workspace Focused) */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative flex-col justify-between overflow-hidden bg-[#0a0c10] p-12 text-white border-l border-zinc-800/80">
        {/* Warm ambient flame glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-tr from-red-600/20 to-orange-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Top brand tag */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-[11px]">
            <Sparkles className="size-3.5 text-orange-400" />
            <span>CLOUD WORKSPACE</span>
          </div>
          <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[11px] font-medium text-orange-400">
            Free 15 GB
          </span>
        </div>

        {/* Center: Glowing Cloud Emblem + Name + Workspace Highlights */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-sm mx-auto space-y-6 py-4">
          {/* Main Logo in Cloud Emblem */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-red-500/30 to-orange-500/30 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-orange-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-orange-950/40">
              <Image src="/file.svg" alt="FileBox Cloud" width={52} height={52} className="invert brightness-200" priority />
            </div>
          </motion.div>

          {/* Brand Name & Growth Tagline */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-figtree text-white">
              FileBox <span className="text-orange-400 font-light">Cloud</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Unlock modern file storage, seamless sharing, and real-time collaboration.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="w-full pt-4 space-y-3 text-left border-t border-zinc-800/80">
            {signupFeatures.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 mt-0.5">
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
        <div className="relative z-10 text-center text-xs text-zinc-500">
          Sync across desktop, mobile, and web in real-time
        </div>
      </div>
    </div>
  )
}