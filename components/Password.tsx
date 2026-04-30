'use client'
import React, { useEffect, useState } from 'react'
import { IconLock } from '@tabler/icons-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { handlePasswordToGetSession } from '@/features/FileFoldersSlice'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'

function Password({fileFolderID} : {fileFolderID: string | undefined}) {
    const { getToken } = useAuth()
    const [password , setPassword] = useState("")
    const dispatch = useAppDispatch()
    const { sessionStatus} = useAppSelector((state) => state.fileFolders)

    const handlePasswordSubmittion = async () => {
        const jwtToken = await getToken()
        dispatch(handlePasswordToGetSession({
            requesturl: `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/verify/password?fileFolderID=${fileFolderID}`,
            jwtToken: jwtToken ? jwtToken : "",
            password: password
        }))
    }

    useEffect(() => {
        if (sessionStatus?.code === 5000) {
            toast.success("Password verified successfully! You can now access the file/folder.")
        }
        else if(sessionStatus?.code === 5009) {
            toast.error("Invalid password. Please try again.")
        }
    }, [sessionStatus])





    return (
        <div className="relative group w-full max-w-md">
            {/* The Glow Effect (Background layer) */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-red-600 to-orange-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>

            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 group-focus-within:border-neutral-600 group-focus-within:bg-black shadow-2xl">

                {/* Leading Icon */}
                <div className="pl-4 text-neutral-500 group-focus-within:text-red-500 transition-colors duration-300">
                    <IconLock size={18} strokeWidth={2.5} />
                </div>

                {/* The Input */}
                <input
                    type="password"
                    placeholder="Enter the password"
                    className="w-full bg-transparent border-none py-3 px-4 text-neutral-100 placeholder:text-neutral-500 focus:ring-0 focus:outline-none font-figtree text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handlePasswordSubmittion()
                        }
                    }}
                />

                
            </div>
        </div>
    )
}

export default Password