"use client"
import { IconClipboardCheckFilled, IconDashboard, IconFile, IconFileStack, IconFileStar, IconFileTypePdf, IconImageInPicture, IconStereoGlasses, IconTrash } from '@tabler/icons-react'
import React from 'react'
import { sideBarMain } from '@/data/SideBar'
import { sideBarLibrary } from '@/data/SideBar'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface Props {
  type: String
}

function SideBarNavItems({ type }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  if (type === "main") {
    return (
      <div className='flex flex-col gap-2 py-3'>

        {
          sideBarMain.map((item) => {

            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <div className={` p-2 rounded-xl font-figtree font-light text-lg flex items-center gap-2 ${isActive ? 'bg-neutral-800' : 'bg-neutral-900'} ${isActive ? 'text-neutral-100' : 'text-neutral-400'}  ${isActive ? 'border-l-3 border-neutral-100' : 'text-neutral-400'}`} key={item.id}  onClick={() => {
                router.push(item.path)
              }}>
                {item.icon}

                {item.name}
              </div>
            )
          })
        }
      </div>
    )
  }
  else if (type === "library") {
    return (
      <div className='flex flex-col gap-2 py-3'>
        {
          sideBarLibrary.map((item) => {
            const isActive = pathname === item.path
            return (
              <div className={` p-2 rounded-xl font-figtree font-light text-lg flex items-center gap-2 ${isActive ? 'bg-neutral-800' : 'bg-neutral-900'} ${isActive ? 'text-neutral-100' : 'text-neutral-400'}  ${isActive ? 'border-l-3 border-neutral-100' : 'text-neutral-400'}`} key={item.id}  onClick={() => {
                router.push(item.path)
              }}>

                {item.icon}
                {item.name}
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default SideBarNavItems