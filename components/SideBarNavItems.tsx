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
    <div className='flex flex-col gap-1.5 py-3'>
      {items.map((item) => {
        const isActive = pathname === item.path || (type === "main" && pathname.startsWith(`${item.path}/`));

        return (
          <div 
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`
              group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
              transition-all duration-300 ease-in-out
              ${isActive 
                ? 'bg-neutral-800/60 text-white' 
                : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900'
              }
            `}
          >
            {/* 1. Active Indicator (Vertical Pill) */}
            {isActive && (
              <div className="absolute left-0 w-1 h-6 bg-red-600 rounded-r-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            )}

            {/* 2. Icon with "Focus" logic */}
            <div className={`
              transition-all duration-300 
              ${isActive ? 'text-red-500 scale-110' : 'group-hover:text-neutral-100 group-hover:scale-110'}
            `}>
              {React.cloneElement(item.icon as React.ReactElement, {
                size: 22,
                stroke: isActive ? 2 : 1.5
              })}
            </div>

            {/* 3. Label */}
            <span className={`
              font-figtree text-[15px] tracking-tight transition-all
              ${isActive ? 'font-semibold' : 'font-medium'}
            `}>
              {item.name}
            </span>

            {/* 4. Subtle "Active" Glow background */}
            {isActive && (
              <div className="absolute inset-0 bg-red-600/5 blur-xl rounded-xl -z-10" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SideBarNavItems