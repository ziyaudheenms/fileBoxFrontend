'use client'
import { IconServer } from '@tabler/icons-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner';

interface StorageStatusProps {
  id: number;
  author: string;
  clerk_user_storage_limit: string;
  clerk_user_used_storage: string;
  total_document_storage: string;
  total_image_storage: string;
  total_other_storage: string;
  storage_percentage_used: number;
}

function StorageUpdate() {
  const { getToken } = useAuth()
  const [storageDetails, setStorageDetails] = useState<StorageStatusProps>({} as StorageStatusProps)
  const [loading ,setLoading] = useState(false)

  const getStorageUpdate = async () => {
    setLoading(true)
    const jwtToken = await getToken()
    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/storage/status/`, {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((res) => {
        console.log("Storage status:", res.data);
        setStorageDetails(res.data)
      })
      .catch((err) => {
        toast.error("Error fetching storage status.")
      }
      )
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    getStorageUpdate()
  },[])

  return (
    <div>
      <div className='group border border-neutral-800 py-5 px-5 rounded-xl flex flex-col gap-4 bg-neutral-900/40 hover:border-red-900/50 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer '>
        <div className='flex items-center gap-2'>
          <div className='relative flex items-center justify-center p-2.5 rounded-lg 
                  bg-neutral-950 border border-neutral-800 
                  group-hover:scale-110 group-hover:border-red-500/40 
                  group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]
                  transition-all duration-500'>
            <IconServer stroke={2} className='text-red-500 group-hover:text-red-500 z-10 transition-colors duration-300' size={24} />
          </div>
          <div>
            <h3 className='group-hover:translate-x-1 group-hover:text-white transition-all duration-300 ease-out font-figtree text-neutral-100 text-lg font-medium tracking-tight '>Storage</h3>
            <p className='font-sans text-neutral-500 text-xm'>Cloud Storage Usage</p>
          </div>

        </div>
        <div>
          <div className='border-b-2 border-neutral-800'>
            <div className='w-full h-2 bg-neutral-800 text-neutral-800 rounded-full'>
              <div
                className='h-2 bg-red-500 text-neutral-800 rounded-full'
                style={{ width: `${storageDetails.storage_percentage_used}%` }}
              ></div>
            </div>
            <div className='flex items-center justify-between font-sans py-2'>
              <h5 className='text-neutral-400'>{storageDetails?.clerk_user_used_storage} used</h5>
              <h5 className='text-neutral-100'>{storageDetails?.clerk_user_storage_limit} free</h5>
            </div>
          </div>

        </div>
        <div className='flex flex-wrap items-center justify-between w-full'>
          <div className='flex flex-col items-center justify-center '>
            <div className='h-2 w-2 bg-red-600 rounded-full'></div>
            <h5 className='text-neutral-400 font-sans font-light text-sm'>Images</h5>
            <h3 className='text-neutral-100 font-figtree text-lg font-bold'>{storageDetails?.total_image_storage}</h3>
          </div>
          <div className='flex flex-col items-center justify-center '>
            <div className='h-2 w-2 bg-blue-600 rounded-full'></div>
            <h5 className='text-neutral-400 font-sans font-light text-sm'>Documents</h5>
            <h3 className='text-neutral-100 font-figtree text-lg font-bold'>{storageDetails?.total_document_storage}</h3>
          </div>
          <div className='flex flex-col items-center justify-center '>
            <div className='h-2 w-2 bg-green-600 rounded-full'></div>
            <h5 className='text-neutral-400 font-sans font-light text-sm'>Others</h5>
            <h3 className='text-neutral-100 font-figtree text-lg font-bold'>{storageDetails?.total_other_storage}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StorageUpdate