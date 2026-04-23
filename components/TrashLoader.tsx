import React from 'react'
import { Spinner } from "@/components/ui/spinner"
import { IconTrash } from '@tabler/icons-react'

function TrashLoader() {
    return (

        <div className='flex items-center justify-center  w-full bg-red-900/40 border-2 border-red-600 rounded-xl animate-pulse'>
            <IconTrash className='text-red-600 animate-pulse' stroke={1.5} height={40} width={40} />

        </div>
    )
}

export default TrashLoader