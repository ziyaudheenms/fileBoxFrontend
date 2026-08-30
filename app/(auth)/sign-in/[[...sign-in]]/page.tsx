import React from 'react'
import { SignIn } from '@clerk/nextjs'

function page() {
  return (
        <>
            <div className='p-5 flex justify-center items-center mx-auto gap-6 '>
                <div className='w-[50%] h-screen flex flex-col justify-center items-center '>
                    <SignIn/>
                </div>
                <div className='w-[50%] bg-red-200 h-screen'>
                    je
                </div>
            </div>
        </>
  )
}

export default page