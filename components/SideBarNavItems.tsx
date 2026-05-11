"use client"
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { sideBarMain, sideBarLibrary } from '@/data/SideBar'

interface Props {
  type: "main" | "library" // Better type safety
}

function SideBarNavItems({ type }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  
  const items = type === "main" ? sideBarMain : sideBarLibrary

  return (
    <div className='flex flex-row md:flex-col gap-2 md:gap-1.5 py-1 md:py-3 items-center md:items-stretch'>
      {items.map((item) => {
        const isActive = pathname === item.path || (type === "main" && pathname.startsWith(`${item.path}/`));

        return (
          <div 
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`
              group relative flex items-center justify-center lg:justify-start gap-0 lg:gap-3 px-3 py-2.5 rounded-xl cursor-pointer
              transition-all duration-300 ease-in-out flex-shrink-0
              ${isActive 
                ? 'bg-neutral-200 dark:bg-neutral-800/60 text-neutral-900 dark:text-white' 
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }
            `}
          >
            {/* 1. Active Indicator (Vertical on Desktop, Horizontal Top on Mobile) */}
            {isActive && (
              <>
                <div className="hidden md:block absolute left-0 w-1 h-6 bg-red-600 rounded-r-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-red-600 rounded-b-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              </>
            )}

            {/* 2. Icon with "Focus" logic */}
            <div className={`
              transition-all duration-300 mx-auto lg:mx-0
              ${isActive ? 'text-red-600 dark:text-red-500 scale-110' : 'group-hover:text-neutral-900 dark:group-hover:text-neutral-100 group-hover:scale-110'}
            `}>
              {React.cloneElement(item.icon as React.ReactElement, {
                size: 22,
                stroke: isActive ? 2 : 1.5
              })}
            </div>

            {/* 3. Label - Hidden on mobile/tablet */}
            <span className={`
              hidden lg:block font-figtree text-[15px] tracking-tight transition-all
              ${isActive ? 'font-semibold' : 'font-medium'}
            `}>
              {item.name}
            </span>

            {/* 4. Subtle "Active" Glow background */}
            {isActive && (
              <div className="hidden md:block absolute inset-0 bg-red-600/5 blur-xl rounded-xl -z-10" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SideBarNavItems