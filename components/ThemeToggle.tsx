"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-500 opacity-50">
        <Moon size={20} />
      </div>
    )
  }

  const isDark = (resolvedTheme || theme) === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex items-center justify-center lg:justify-between w-auto md:w-full px-2.5 lg:px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:outline-none"
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="flex items-center gap-0 lg:gap-3">
        <div className="relative flex items-center justify-center w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:text-red-500 text-neutral-500 dark:text-neutral-400">
          {isDark ? (
            <Moon size={20} strokeWidth={1.75} className="transition-transform duration-300" />
          ) : (
            <Sun size={20} strokeWidth={1.75} className="transition-transform duration-300 text-amber-500" />
          )}
        </div>
        {showLabel && (
          <span className="hidden lg:block font-figtree text-[15px] font-medium tracking-tight">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        )}
      </div>

      {showLabel && (
        <div className="hidden lg:flex items-center w-8 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full p-0.5 transition-colors duration-300 ml-2">
          <div
            className={`w-3 h-3 rounded-full transition-transform duration-300 ${
              isDark ? "translate-x-4 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "translate-x-0 bg-white shadow-xs"
            }`}
          />
        </div>
      )}
    </button>
  )
}

