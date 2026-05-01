import React from 'react'
import { Spinner } from "@/components/ui/spinner"
import { IconTrash } from '@tabler/icons-react'


function InfiniteLoader() {
  return (

    <div className='flex items-center justify-center  w-full'>
      <Spinner className='text-red-600 size-8' fontSize={10} />
    </div>

  )
}

export default InfiniteLoader