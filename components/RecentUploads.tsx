import { IconClock, IconFileUpload } from '@tabler/icons-react'
import React from 'react'

function RecentUploads() {
  return (
    <div><div className='border border-neutral-800 py-5 px-5 rounded-xl flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-neutral-800 p-2 rounded-lg '>
                <IconClock stroke={2} height={25} width={25} className='text-neutral-400' />
              </div>
              <div>
                <h3 className='text-neutral-100 font-figtree font-bold '>Recent Uploads</h3>
                <p className='text-neutral-400 font-sans font-light'>Last Uploaded Files</p>
              </div>
            </div>
            <div className='p-2 flex flex-col gap-2 border-t-2 border-neutral-800'>
              <div className='flex items-center gap-2'>
                <div className='bg-neutral-800 p-2 rounded-lg'>
                  <IconFileUpload stroke={2} height={20} width={20} className='text-neutral-400' />
                </div>
                <div>
                  <h3 className='text-neutral-100 font-figtree font-light'>filename</h3>
                  <p className='text-neutral-100 font-sans text-sm'>14mb <span className='text-neutral-400'>about 3 months ago</span></p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div className='bg-neutral-800 p-2 rounded-lg'>
                  <IconFileUpload stroke={2} height={20} width={20} className='text-neutral-400' />
                </div>
                <div>
                  <h3 className='text-neutral-100 font-figtree font-light'>filename</h3>
                  <p className='text-neutral-100 font-sans text-sm'>14mb <span className='text-neutral-400'>about 3 months ago</span></p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div className='bg-neutral-800 p-2 rounded-lg'>
                  <IconFileUpload stroke={2} height={20} width={20} className='text-neutral-400' />
                </div>
                <div>
                  <h3 className='text-neutral-100 font-figtree font-light'>filename</h3>
                  <p className='text-neutral-100 font-sans text-sm'>14mb <span className='text-neutral-400'>about 3 months ago</span></p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div className='bg-neutral-800 p-2 rounded-lg'>
                  <IconFileUpload stroke={2} height={20} width={20} className='text-neutral-400' />
                </div>
                <div>
                  <h3 className='text-neutral-100 font-figtree font-light'>filename</h3>
                  <p className='text-neutral-100 font-sans text-sm'>14mb <span className='text-neutral-400'>about 3 months ago</span></p>
                </div>
              </div>
            </div>
          </div></div>
  )
}

export default RecentUploads