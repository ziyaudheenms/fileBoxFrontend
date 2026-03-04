'use client'
import { IconServer } from '@tabler/icons-react';
import React from 'react'

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

function StorageUpdate({ storageDetails }: { storageDetails: StorageStatusProps }) {
  return (
    <div>
        <div className='border border-neutral-800 py-5 px-5 rounded-xl flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-neutral-800 p-2 rounded-lg '>
                <IconServer stroke={2} height={25} width={25} className='text-neutral-400' />
              </div>
              <div>
                <h3 className='text-neutral-100 font-figtree font-bold '>Storage</h3>
                <p className='text-neutral-400 font-sans font-light'>Cloud Storage Usage</p>
              </div>

            </div>
            <div>
              <div className='border-b-2 border-neutral-800'>
                <div className='w-full h-2 bg-neutral-800 text-neutral-800 rounded-full'>
                  <div
                    className='h-2 bg-neutral-100 text-neutral-800 rounded-full'
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