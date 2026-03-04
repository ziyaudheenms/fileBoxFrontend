import Navbar from '@/components/navbar'
import SideBar from '@/components/sidebar'
import SideBarNavItems from '@/components/SideBarNavItems'
import { IconFileRss } from '@tabler/icons-react'
import React from 'react'

function layout({children} : {children: React.ReactNode}) {
  return (
    <div >
        <div className='flex'>
        <div className='bg-neutral-900 w-[23%] h-screen'>
          <div className='flex items-center gap-3 py-6 px-4 border-b-2 border-b-neutral-800'>
            <div className='bg-neutral-100 p-2 rounded-lg '>
              <IconFileRss stroke={2} height={30} width={30}/>
            </div>
            <div>
              <h3 className='font-figtree font-extrabold text-neutral-100 text-xl'>CloudVault</h3>
              <h6 className='font-light font-sans text-sm text-neutral-400'>Your Cloud Storage</h6>
            </div>
          </div>
          <div className='py-3 px-2'>
            <h5 className='text-neutral-400 text-sm'>MAIN</h5>
            <SideBarNavItems type={"main"}/>
            <h5 className='text-neutral-400 text-sm'>LIBRARY</h5>
            <SideBarNavItems type={"library"}/>
          </div>
        </div>
        <div className='bg-neutral-950 w-full h-screen overflow-y-scroll no-scrollbar'>
          {children}
        </div>
        </div>
        
      
    </div>
  )
}

export default layout