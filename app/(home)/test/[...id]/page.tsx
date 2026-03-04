'use client'
import React from 'react'
import { useParams } from 'next/navigation'
function page() {
  const params = useParams()
  return (
    <div className='text-shadow-indigo-700 text-4xl font-bold'>
      
    <h1>
      {
        params.id ? `Folder ID: ${params.id[params.id.length - 1]}` : 'No Folder ID Provided'
      }
    </h1>
    </div>
  )
}

export default page