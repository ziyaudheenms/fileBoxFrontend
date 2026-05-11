import Navbar from '@/components/navbar'
import SideBarNavItems from '@/components/SideBarNavItems'
import { ThemeToggle } from '@/components/ThemeToggle'
import { IconFileRss } from '@tabler/icons-react'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className='flex flex-col md:flex-row h-screen overflow-hidden'>
        <div className='bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl w-auto md:w-20 lg:w-[20%] h-16 md:h-screen fixed inset-x-4 bottom-4 md:inset-auto md:relative z-50 flex md:flex-col items-center md:items-stretch border border-neutral-200/50 dark:border-neutral-800/50 md:border-y-0 md:border-l-0 md:border-r md:rounded-none rounded-2xl flex-shrink-0 shadow-2xl md:shadow-none transition-all'>

          {/* Logo Section - Hidden on Mobile */}
          <div className='hidden md:flex items-center md:justify-center lg:justify-start gap-3 py-6 md:px-0 lg:px-4 border-b-2 border-neutral-200 dark:border-neutral-800 flex-shrink-0'>
            <div className='bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black p-2 rounded-lg'>
              <IconFileRss stroke={2} height={30} width={30} />
            </div>
            <div className="hidden lg:block">
              <h3 className='font-figtree font-extrabold text-neutral-900 dark:text-neutral-100 text-xl'>CloudVault</h3>
              <h6 className='font-light font-sans text-sm text-neutral-500 dark:text-neutral-400'>Your Cloud Storage</h6>
            </div>
          </div>

          {/* Navigation Section */}
          <div className='flex md:flex-col md:py-3 px-2 flex-grow overflow-x-auto no-scrollbar md:overflow-visible items-center justify-around md:justify-start md:items-stretch w-full md:h-auto'>
            <h5 className='hidden lg:block text-neutral-500 dark:text-neutral-400 text-sm mt-2 mb-1 px-2'>MAIN</h5>
            <SideBarNavItems type={"main"} />

            <div className="hidden md:block w-full h-[1px] bg-neutral-200 dark:bg-neutral-800 my-2" />

            <h5 className='hidden lg:block text-neutral-500 dark:text-neutral-400 text-sm mt-2 mb-1 px-2'>LIBRARY</h5>
            <SideBarNavItems type={"library"} />

            {/* Theme Toggle */}
            <div className="flex-shrink-0 items-center md:mt-auto md:mb-4 px-2 flex justify-center lg:justify-start">
              <div className="md:hidden flex items-center justify-center p-2 mt-1">
                <ThemeToggle />
              </div>
              <div className="hidden md:flex items-center gap-3 mt-4">
                <ThemeToggle />
                <span className="hidden lg:block text-sm font-medium text-neutral-500 dark:text-neutral-400">Theme Toggle</span>
              </div>
            </div>
          </div>

        </div>

        <div className='bg-white dark:bg-neutral-950 w-full h-screen pb-24 md:pb-0 overflow-y-scroll no-scrollbar'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default layout