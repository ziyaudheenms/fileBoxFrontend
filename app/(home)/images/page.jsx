import React from 'react'
import { useParams } from 'next/navigation'


function page() {
  const params = useParams();
  return (
    <div>Image Section </div>
  )
}

export default page