import React from 'react'
import { Spinner } from "@/components/ui/spinner"
import { IconFolderHeart} from '@tabler/icons-react'

function FavoriteLoader() {
    return (

        <div className='flex items-center justify-center  w-full bg-pink-900/40 border-2 border-pink-600 rounded-xl animate-pulse'>
            <IconFolderHeart className='text-pink-600 animate-pulse' stroke={1.5} height={40} width={40} />

        </div>
    )
}

export default FavoriteLoader