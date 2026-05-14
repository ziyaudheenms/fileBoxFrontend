"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Cloud, Folder, ShieldCheck, Sparkles } from "lucide-react"

const featureItems = [
  {
    title: "Instant file previews",
    description: "Preview documents, images, and media without extra clicks.",
    icon: Sparkles,
  },
  {
    title: "Secure sharing",
    description: "Share with passwords, expiry links, and view-only access.",
    icon: ShieldCheck,
  },
  {
    title: "Smart folder sync",
    description: "Keep files updated across devices with one seamless sync.",
    icon: Folder,
  },
  {
    title: "Cloud-first backup",
    description: "Auto-save important files with intelligent version recovery.",
    icon: Cloud,
  },
]

const benefitItems = [
  {
    title: "Collaborate anywhere",
    description: "Share folders and files with teammates instantly, with permissions that stay under your control.",
  },
  {
    title: "Dashboard clarity",
    description: "Keep your workspace organized with tagged categories, favorites, and powerful search.",
  },
  {
    title: "Reliable compliance",
    description: "Audit file access and keep sensitive data safe with compliance-friendly security.",
  },
]

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.14),transparent_40%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.18),transparent_60%)] blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <nav className="mb-10 flex flex-col gap-4 rounded-full border border-border/70 bg-card/90 px-6 py-4 shadow-xl shadow-black/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600/15 text-red-600">CV</span>
            CloudVault
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <motion.a whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} href="#features" className="transition hover:text-red-600">Features</motion.a>
            <motion.a whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} href="#cta" className="transition hover:text-red-600">Start</motion.a>
            <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="#" className="rounded-full border border-red-600/20 bg-red-600/10 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-600/15">Sign in</motion.a>
          </div>
        </nav>

        <motion.section
          className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-3 rounded-full bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm shadow-red-600/10"
            >
              <span className="h-2 w-2 rounded-full bg-red-600" />
              New upgraded CloudVault experience
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.7 } }}
              className="space-y-6"
            >
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Store, secure, and share files with a bold red-focused cloud experience.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                CloudVault blends high-impact visuals with modern motion, built for teams who want fast organization and effortless sharing.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="#cta"
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition duration-300 hover:bg-red-700"
                >
                  Start Free Trial
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition duration-300 hover:border-red-600 hover:text-red-600"
                >
                  Explore Features
                </motion.a>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-black/5 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Upload speed</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">2.8x faster</p>
                <p className="mt-2 text-sm text-muted-foreground">Advanced caching keeps your workspace fluent across devices.</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-black/5 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Privacy first</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">AES-256 encryption</p>
                <p className="mt-2 text-sm text-muted-foreground">Protect sensitive data with built-in security controls.</p>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.75 } }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-4xl border border-red-600/20 bg-linear-to-br from-red-600/10 via-slate-950/75 to-slate-950/95 p-1 shadow-2xl shadow-red-600/15"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.22),transparent_40%)]" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 pb-6 pt-10">
              <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-red-600/20 blur-3xl" />
              <div className="relative h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950">
                <Image src="/hero-cover.svg" alt="CloudVault cover graphic" fill className="object-cover" priority />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/5 backdrop-blur-xl">
                  <p className="text-sm text-muted-foreground">Files synced</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">1.2K</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/5 backdrop-blur-xl">
                  <p className="text-sm text-muted-foreground">Secure shares</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">364</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          id="features"
          className="mt-20 rounded-4xl border border-border/70 bg-card/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-600">Built to move fast</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Interactive features for secure file workflows.</h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                CloudVault brings secure sharing, smart folders, and intuitive control into one polished app experience. Every interaction is designed to feel responsive, clean, and reliable.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featureItems.map((feature) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="group rounded-3xl border border-border/60 bg-background/80 p-6 shadow-lg shadow-black/5 transition duration-300 hover:border-red-600/30 hover:bg-red-600/5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-600/10 text-red-600 transition group-hover:bg-red-600/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
          <div className="mt-12 rounded-3xl border border-border/60 bg-background/90 p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              {benefitItems.map((benefit) => (
                <motion.div key={benefit.title} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }} className="rounded-3xl bg-card/95 p-6 shadow-sm shadow-black/5">
                  <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.25 }} className="mt-10 rounded-3xl border border-red-600/10 bg-red-600/5 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-red-600/90">Trusted by modern teams</p>
            <p className="mt-3 text-lg font-semibold text-foreground">Used by designers, founders, and operations teams who need reliable file workflows.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="rounded-full border border-border/60 bg-background/80 px-4 py-2 transition">Startup teams</motion.span>
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="rounded-full border border-border/60 bg-background/80 px-4 py-2 transition">Creative agencies</motion.span>
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="rounded-full border border-border/60 bg-background/80 px-4 py-2 transition">Enterprise security</motion.span>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          id="insights"
          className="mt-20 rounded-4xl border border-border/70 bg-card/90 p-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-600">What you get</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">A more complete workspace with fewer distractions.</h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                From easy onboarding to adaptive sharing controls, CloudVault is built to keep teams focused on what matters most — files, not friction.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-lg shadow-black/5">
                <p className="text-sm uppercase tracking-[0.24em] text-red-600">Smart search</p>
                <p className="mt-3 text-xl font-semibold text-foreground">Find files instantly</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Search across names, tags, and folder content without leaving the page.</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-lg shadow-black/5">
                <p className="text-sm uppercase tracking-[0.24em] text-red-600">Flexible sharing</p>
                <p className="mt-3 text-xl font-semibold text-foreground">Control every access point</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Grant view-only access, expiration links, or password protection in one click.</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-lg shadow-black/5">
                <p className="text-sm uppercase tracking-[0.24em] text-red-600">Team dashboards</p>
                <p className="mt-3 text-xl font-semibold text-foreground">Keep every project aligned</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">See recent activity, shared work, and favorite files from a single dashboard.</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-lg shadow-black/5">
                <p className="text-sm uppercase tracking-[0.24em] text-red-600">Version history</p>
                <p className="mt-3 text-xl font-semibold text-foreground">Recover older files fast</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Track changes and restore versions without losing anything important.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="cta"
          className="mt-20 rounded-4xl border border-red-600/20 bg-red-600/10 p-10 shadow-2xl shadow-red-600/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600/90">Ready for launch?</p>
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Upgrade to a cloud workspace that looks as powerful as it feels.</h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
              >
                Start Now
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-red-600/20 bg-background px-8 py-3 text-sm font-semibold text-foreground transition hover:border-red-600 hover:text-red-600"
              >
                View Features
              </motion.a>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
