import React from 'react'
import { Spinner } from "@/components/ui/spinner"

function InfiniteLoader() {
  return (
    <div className='flex items-center justify-center  w-full'>
        <Spinner className='text-white size-8' fontSize={10}/>
    </div>
  )
}

export default InfiniteLoader