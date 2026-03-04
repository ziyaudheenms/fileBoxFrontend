import React from 'react'

function layout({children} : {children: React.ReactNode}) {
  return (
    <div>
      <h1 className='text-xl text-blue-500'>Auth Layout</h1>
      {children}
    </div>
  )
}

export default layout