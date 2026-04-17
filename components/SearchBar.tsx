'use client'
import Navbar from '@/components/navbar'
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { SearchIcon } from 'lucide-react'
import { IconFile, IconFileSearch, IconFolder, IconLink, IconSearch } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'
import { EmptyPage } from './EmptyPage'
import { useRouter } from 'next/navigation'


interface SearchResult {
    id: number;
    author: string;
    name: string;
    type_of_file_folder: string;
    rank: number;
    snippet: string;
    description: string;
    isfolder: boolean;
}

interface props {
    scope? : string
}

function SearchBar({scope} : props) {
    const [query, setQuery] = useState<string | null>(null)
    const [loader, setLoader] = useState<Boolean>(false)
    const [getREQUEST, setGetREQUEST] = useState(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/search/`)
    const [result, setResult] = useState<SearchResult[]>([])
    const { getToken } = useAuth()
    const router = useRouter()

    const HandleSearchingRecord = async () => {
        setLoader(true)
        const jwtToken = await getToken()
        axios
            .post(scope ? `${getREQUEST}?q=${query}&scope=${scope}` : `${getREQUEST}?q=${query}` , {}, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res)
                if (res.data.status_code === 5000) {
                    setResult(res.data.data)
                }
                else if (res.data.status_code === 5001) {
                    toast.error(res.data.message)
                }
            })
            .catch((err) => { }
            )
            .finally(() => {
                setLoader(false)
            })
    }



    useEffect(() => {
        const handler = setTimeout(() => {
            if (query) {
                HandleSearchingRecord()
            }
        }, 500);

        return () => {
            setResult([])
            clearTimeout(handler)
        }
    }, [query])

    return (
        <div className='text-neutral-300'>
            <Dialog>
                <form className='w-full'>
                    <DialogTrigger asChild>

                        <div className='group relative flex justify-between items-center p-3 rounded-2xl 
                bg-neutral-900/40 border border-neutral-800 
                hover:border-red-900/50 hover:bg-neutral-800/50 
                transition-all ease-out duration-300 
                hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] 
                hover:-translate-y-1 cursor-pointer overflow-hidden' >

                            {/* 1. The Interaction Content */}
                            <div className='flex items-center gap-4'>
                                {/* Icon Container with the 'Neon' Glow logic */}
                                <div className='relative p-2.5 rounded-xl border border-neutral-800 
                    group-hover:border-red-500/50 bg-neutral-950 
                    group-hover:scale-110 transition-all duration-500'>

                                    <IconSearch stroke={2} className='text-red-500 group-hover:text-red-400 z-10 relative' size={24} />

                                    {/* The Atmospheric Lighting Layer */}
                                    <div className='absolute inset-0 bg-red-600/20 blur-xl opacity-0 
                      group-hover:opacity-100 transition-opacity duration-700'/>
                                </div>

                                {/* Typography with tracking-tight for a modern look */}
                                <div className='flex flex-col'>
                                    <span className='font-figtree text-neutral-100 text-sm font-medium tracking-tight group-hover:text-white transition-colors'>
                                        Search Your Files
                                    </span>
                                    <span className='font-sans text-neutral-500 text-xs'>
                                        Quickly find resources...
                                    </span>
                                </div>
                            </div>

                            {/* 2. The Keyboard Shortcut Hint (The 'Senior' touch) */}
                            <div className='flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-300'>
                                <kbd className="px-2 py-1 text-[10px] font-medium text-neutral-400 bg-neutral-800 border border-neutral-700 rounded-md">
                                    ⌘ K
                                </kbd>
                            </div>

                            {/* 3. Subtle Edge Highlight (The 'Ghost' Border) */}
                            <div className='absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                        </div>

                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm bg-neutral-950 border-2 border-neutral-800 text-nwutra">
                        <DialogHeader>
                            <div className="flex flex-col gap-1.5 py-4">
                                {/* The Title: High contrast and bold */}
                                <DialogTitle className='text-xl font-bold text-white font-figtree'>
                                    Search Your <span className="text-red-600">Resources</span>
                                </DialogTitle>

                                {/* The Description: Muted, elegant, and perfectly spaced */}
                                <DialogDescription className="text-neutral-400 font-sans text-sm leading-relaxed max-w-[90%]">
                                    Locate your files in seconds.

                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="relative group w-full max-w-md">
                            {/* The Glow Effect (Background layer) */}
                            <div className="absolute -inset-0.5 bg-linear-to-r from-red-600 to-orange-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>

                            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 group-focus-within:border-neutral-600 group-focus-within:bg-black shadow-2xl">

                                {/* Leading Icon */}
                                <div className="pl-4 text-neutral-500 group-focus-within:text-red-500 transition-colors duration-300">
                                    <SearchIcon size={18} strokeWidth={2.5} />
                                </div>

                                {/* The Input */}
                                <input
                                    type="text"
                                    placeholder="Search your files..."
                                    className="w-full bg-transparent border-none py-3 px-4 text-neutral-100 placeholder:text-neutral-500 focus:ring-0 focus:outline-none font-figtree text-sm"
                                    value={query ? query : ''}
                                    onChange={(e) => {
                                        setQuery(e.target.value)
                                    }}
                                />

                                {/* Keyboard Shortcut Hint (Senior UI touch) */}
                                <div className="pr-4 hidden sm:block">
                                    <kbd className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-neutral-500 bg-neutral-800 border border-neutral-700 rounded-md">
                                        <span className="text-xs">⌘</span>K
                                    </kbd>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2 h-44 no-scrollbar overflow-y-scroll'>
                            {
                                result.map((item: SearchResult) => {
                                    return (
                                        <div className='group flex items-center justify-start gap-3 w-full p-2 
                bg-neutral-900/40 border border-neutral-800 
                hover:border-neutral-600 hover:bg-neutral-800/80 
                hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                rounded-xl transition-all duration-300 ease-out cursor-pointer' key={item.id} onClick={() => {
                    item.isfolder ?  router.push(`/dashboard/${item.id}`) : router.push(`/${item.type_of_file_folder}/${item.id}`);
                }}>

                                            {/* Icon Container with glowing background effect on hover */}
                                            <div className='relative flex items-center justify-center p-2 rounded-lg 
                  bg-neutral-950 border border-neutral-800 
                  group-hover:scale-110 group-hover:border-red-500/30 
                  transition-all duration-300'>
                                                {item.isfolder ? <IconFolder stroke={1.5} className='text-red-500 group-hover:text-red-400 z-10' size={28} /> : <IconFile stroke={1.5} className='text-red-500 group-hover:text-red-400 z-10' size={28} />}
                                                <div className='absolute inset-0 bg-red-600/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity' />
                                            </div>

                                            <div className='flex flex-col justify-center w-full min-w-0'>
                                                <p className='text-neutral-200 font-medium font-figtree truncate group-hover:text-white transition-colors'>
                                                    {item.name}
                                                </p>

                                                {/* The Snippet: Using dangerouslySetInnerHTML to render our <mark> tags */}
                                                <p
                                                    className='text-neutral-500 font-sans text-xs truncate group-hover:text-neutral-400 transition-colors'
                                                    dangerouslySetInnerHTML={{ __html: item.snippet && item.snippet.length > 0 ? item.snippet : "No description found" }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            {
                                result.length == 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {/* 1. Icon with Ambient Glow */}
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full" />
                                            <div className="relative flex items-center justify-center w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-inner">
                                                <IconFileSearch size={40} stroke={1.5} className="text-neutral-500 group-hover:text-red-500 transition-colors" />
                                            </div>
                                        </div>

                                        {/* 2. Text Hierarchy */}
                                        <h3 className="text-xl font-figtree font-bold text-neutral-100 tracking-tight">
                                            {query ? "No results found" : "Find your files"}
                                        </h3>

                                        <p className="mt-2 text-neutral-500 max-w-[250px] leading-relaxed">
                                            {query
                                                ? `We couldn't find anything matching "${query}". Try a different keyword.`
                                                : "Search for records, folders, or files stored in your cloud."}
                                        </p>

                                        {/* 3. Subtle Action (Optional) */}
                                        {!query && (
                                            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-red-500/80 uppercase tracking-widest animate-pulse">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                Waiting for input
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div></div>
                                )
                            }

                        </div>

                        <DialogFooter className='flex justify-between'>
                            <DialogClose asChild>
                                <Button className='group relative flex items-center gap-2.5 px-6 py-2.5 
                   bg-neutral-900 border border-neutral-800 
                   text-neutral-200 font-figtree font-medium 
                   rounded-xl transition-all duration-300 
                   hover:border-red-800/60 hover:text-white 
                   hover:-translate-y-0.5 
                   active:translate-y-0 active:scale-95
                   shadow-[0_1px_2px_rgba(0,0,0,0.1)] 
                   hover:shadow-[0_8px_16px_rgba(220,38,38,0.08)]
                   overflow-hidden'>

                                    {/* Inner Glow/Gradient Layer (Appears on Hover) */}
                                    <span className='absolute inset-0 bg-linear-to-b from-red-600/20 to-transparent 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-500 blur-sm'/>

                                    {/* Icon with scaling micro-interaction */}
                                    <IconLink
                                        stroke={1.5}
                                        size={20}
                                        className='text-neutral-500 group-hover:text-red-400 group-hover:scale-110 
               transition-all duration-300 z-10'
                                    />

                                    {/* Button Text */}
                                    <span className='relative z-10'>Close</span>
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>
    )
}

export default SearchBar