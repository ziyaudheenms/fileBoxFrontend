'use client'
import React, { useEffect, useState } from 'react'
import { IconArrowRight, IconLock } from '@tabler/icons-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { handlePasswordToGetSession } from '@/features/FileFoldersSlice'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation';

function Password({fileFolderID} : {fileFolderID: string | undefined}) {
    const { getToken } = useAuth()
    const [password , setPassword] = useState("")
    const dispatch = useAppDispatch()
    const { sessionStatus, isLoading } = useAppSelector((state) => state.fileFolders)
    const router = useRouter();

    const handlePasswordSubmittion = async () => {
        if (!password.trim() || isLoading) return;
        const jwtToken = await getToken()
        dispatch(handlePasswordToGetSession({
            requestID: fileFolderID ,
            jwtToken: jwtToken ? jwtToken : "",
            password: password
        }))
    }

    useEffect(() => {
        if (sessionStatus?.code === 5000) {
            toast.success("Password verified successfully! You can now access the file/folder.")
            router.back() //redirecting to the url from which we came here.
        }
        else if(sessionStatus?.code === 5009) {
            toast.error("Invalid password. Please try again.")
        }
    }, [sessionStatus])

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                handlePasswordSubmittion();
            }}
            className="relative group w-full max-w-md px-4"
        >
            {/* The Glow Effect (Background layer) - pointer-events-none is crucial */}
            <div className="pointer-events-none absolute -inset-0.5 bg-linear-to-r from-red-600 to-orange-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>

            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 group-focus-within:border-red-900/50 group-focus-within:bg-black shadow-2xl">

                {/* Leading Icon */}
                <div className="pl-4 text-neutral-500 group-focus-within:text-red-500 transition-colors duration-300">
                    <IconLock size={18} strokeWidth={2.5} />
                </div>

                {/* The Input */}
                <input
                    type="password"
                    placeholder="Enter the password"
                    className="w-full bg-transparent border-none py-3 px-3 text-neutral-100 placeholder:text-neutral-500 focus:ring-0 focus:outline-none font-figtree text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handlePasswordSubmittion();
                        }
                    }}
                />

                {/* Submit Button */}
                <div className="pr-2 flex-shrink-0 relative z-10">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePasswordSubmittion();
                        }}
                        disabled={!password.trim() || isLoading}
                        className="flex items-center justify-center p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-red-600/30 cursor-pointer relative z-20"
                        title="Submit password"
                        aria-label="Submit password"
                    >
                        <IconArrowRight size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </form>
    )
}

export default Password