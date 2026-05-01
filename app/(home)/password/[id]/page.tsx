'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import Password from '@/components/Password'
import { useAppSelector } from '@/lib/redux/hooks'
import InfiniteLoader from '@/components/InfiniteLoader'
function page() {
    const params = useParams();
    const { isLoading } = useAppSelector((state) => state.fileFolders)

  return (
    <div className='flex flex-col gap-2 w-full justify-center items-center h-screen'>
        <Password fileFolderID={params.id ? params.id as string : undefined}/>
        {
            isLoading ? (
                <InfiniteLoader />
            ) : (
                <div></div>
            )
        }
    </div>
  )
}

export default page