'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import Password from '@/components/Password'
import { useAppSelector } from '@/lib/redux/hooks'
import InfiniteLoader from '@/components/InfiniteLoader'
import { IconLockAccess } from '@tabler/icons-react'

function page() {
    const params = useParams();
    const { isLoading } = useAppSelector((state) => state.fileFolders)

  return (
    <div className='flex flex-col gap-6 w-full justify-center items-center min-h-screen px-4 pb-20'>
        <div className='flex flex-col items-center gap-3 text-center'>
            <div className='p-4 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-500 shadow-lg shadow-red-600/10'>
                <IconLockAccess size={36} strokeWidth={1.75} />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold font-figtree text-neutral-100'>Protected Resource</h2>
            <p className='text-sm text-neutral-400 max-w-sm'>
                This file or folder is password-protected. Enter the password below to access it.
            </p>
        </div>

        <Password fileFolderID={params.id ? params.id as string : undefined}/>

        {
            isLoading ? (
                <InfiniteLoader />
            ) : null
        }
    </div>
  )
}

export default page