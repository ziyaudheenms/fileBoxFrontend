"use client"
import React, { useEffect, useState } from 'react'

import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { IconAdjustmentsAlt, IconClock, IconFolder,  IconHome, IconLayoutGridRemove, IconList, IconPdf, IconPencil, IconPictureInPictureFilled, IconTextSize,  IconVideo,  } from '@tabler/icons-react'
import { SearchIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import InfiniteLoader from '@/components/InfiniteLoader'
import { toast } from 'sonner'
import { EmptyPage } from '@/components/EmptyPage'
import FileFolderCards from '@/components/FileFolderCards'

interface FileFolderProps {
    id: number;
    author: string;
    size: number;
    parentFolder: string | null;
    name: string;
    uploaded_at: Date;
    updated_at: Date;
    isfolder: boolean;
    is_root_folder: boolean;
    file_url: string | null;
    file_extension: string | null;
    upload_status: string;
    celery_task_ID: string | null;
    is_trash: boolean;
    is_favorite: boolean;
}

function page() {
    const { getToken } = useAuth() // Clerk authentication hook to get JWT token
    const [gridLayout, setgridLayout] = useState(true)
    const [folderFileData, setFolderFileData] = useState<FileFolderProps[]>([])
    const [loading, setLoading] = useState(false)
    const [getREQUEST, setGETREQUEST] = useState(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders/Favorite`)
    const [hasData, setHasData] = useState(false)
    const [empty, setEmpty] = useState(false)

    // Used For getting all the folder/file data from the backend
    const HandleGetAllFileFolderData = async () => {
        setHasData(false)
        setLoading(true)
        const jwtToken = await getToken()
        localStorage.setItem("refreshToken", jwtToken || "")

        // GET Request that is used to fetch all the folder/file data
        axios
            .get(getREQUEST, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res.data.status_code)
                if (res.data.status_code === 5002) {
                    setEmpty(true)
                }
                else if (res.data.status_code === 5000) {
                    console.log(res.data.data)
                    setFolderFileData((prev) => {
                        const newData = res.data.data;
                        // Filter out items in newData that are already present in prev
                        const uniqueNewItems = newData.filter(newItem =>
                            !prev.some(prevItem => prevItem.id === newItem.id)
                        );
                        return [...prev, ...uniqueNewItems]
                    }) // used this expression to append new data to existing state array
                    // setFolderFileData(res.data.data)  // used this expression to append new data to existing state array
                }
                if (res.data.message.next_cursor != null) {
                    setGETREQUEST(res.data.message.next_cursor)
                    setHasData(true)
                } else {
                    setHasData(false)
                }
            })
            .catch((err) => { }
            )
            .finally(() => {
                setLoading(false)
            })

    }
    // Updating the existing file/folder data based on trash updation , also favorite updation can be handled here
    const GetUpdatedFileFolderData = async () => {
        setHasData(false)
        setLoading(true)
        const jwtToken = await getToken()
        console.log("JWT TOKEN IN UPDATE FUNC OF FAVORITE PAGE", jwtToken)
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders/Favorite`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res.data.status_code)
                if (res.data.status_code === 5002) {
                    setEmpty(true)
                }
                else if (res.data.status_code === 5000) {
                    console.log(res.data.data)
                    setFolderFileData(res.data.data)
                }
                if (res.data.message.next_cursor != null) {
                    setGETREQUEST(res.data.message.next_cursor)
                    setHasData(true)
                } else {
                    setHasData(false)
                }
            })
            .catch((err) => { }
            )
            .finally(() => {
                setLoading(false)
            })

    }

    const HandleTrashUpdation = async (fileFolderID: number) => {
        const jwtToken = await getToken()
        console.log("JWT TOKEN IN TRASH FUNC OF FAVORITE PAGE", jwtToken)
        if (jwtToken) {
            axios
                .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/trash/FolderFile/?folderFileID=${fileFolderID}`, {
                    headers: {
                        authorization: `Bearer ${jwtToken}`,
                    },
                })
                .then((res) => {
                    console.log(res.data)
                    if (res.data.status_code === 5000) {
                        toast.success("Item moved to Dashboard.")
                        GetUpdatedFileFolderData()
                    }
                    else if (res.data.status_code === 5002) {
                        toast.error(" Move to Trash failed.")
                    }
                })
                .catch((err) => {
                    console.log(err)

                })
        }
    }

    const HandleFavoriteUpdation = async (fileFolderID: number) => {
        const jwtToken = await getToken()
        if (jwtToken) {
            axios
                .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/favorite/FolderFile/?folderFileID=${fileFolderID}`, {
                    headers: {
                        authorization: `Bearer ${jwtToken}`,
                    },
                })
                .then((res) => {
                    console.log(res.data)
                    if (res.data.status_code === 5000) {
                        toast.success("Item added to Favorite.")
                        GetUpdatedFileFolderData()
                    }
                    else if (res.data.status_code === 5002) {
                        toast.error("Marking Favorite failed.")
                    }
                })
                .catch((err) => {
                    console.log(err)

                })
        }
    }


    useEffect(() => {
        HandleGetAllFileFolderData()
    }, [])

    return (
        <div>
            <Navbar />
            <div className='px-2 flex'>
                {/* MAIN SECTION THAT LISTS ALL THE FOLDER/FILES THAT EXISTS */}
                <div className='w-[73%] px-2 py-2 h-screen overflow-y-scroll no-scrollbar'>
                    <div className='w-full flex items-center justify-between '>
                        <div className='flex  gap-1'>
                            <IconHome stroke={2} height={20} width={20} className='text-neutral-100' />
                            <h4 className='text-neutral-100 font-sans'>Home</h4>
                        </div>
                        <div className='flex items-center gap-2'>
                            <InputGroup>
                                <InputGroupInput placeholder="Search..." className='placeholder:text-neutral-400  text-neutral-100' />
                                <InputGroupAddon>
                                    <SearchIcon />
                                </InputGroupAddon>
                            </InputGroup>

                            {
                                gridLayout ? (
                                    <ButtonGroup>
                                        <Button variant="outline"><IconLayoutGridRemove stroke={2} height={20} width={20} /></Button>
                                        <Button onClick={() => {
                                            setgridLayout(!gridLayout)
                                        }}><IconList stroke={2} height={20} width={20} /></Button>
                                    </ButtonGroup>
                                ) : (
                                    <ButtonGroup>
                                        <Button onClick={() => {
                                            setgridLayout(!gridLayout)
                                        }}><IconLayoutGridRemove stroke={2} height={20} width={20} /></Button>
                                        <Button variant="outline" ><IconList stroke={2} height={20} width={20} /></Button>
                                    </ButtonGroup>
                                )
                            }

                            <div className='border border-neutral-400 p-2 rounded-lg'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <IconAdjustmentsAlt stroke={2} height={20} width={20} className='text-neutral-100' />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-neutral-950 text-neutral-400 border border-neutral-800" align="start">
                                        <DropdownMenuLabel className='font-figtree text-neutral-100 text-lg'>Filters & Sort</DropdownMenuLabel>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconPencil stroke={2} className='text-neutral-500' />
                                                Name
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconClock stroke={2} className='text-neutral-500' />
                                                Date Modified
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconTextSize stroke={2} className='text-neutral-500' />
                                                File Size
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconFolder stroke={2} className='text-red-800' />
                                                Folder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconPictureInPictureFilled stroke={2} className='text-blue-800' />
                                                Images
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconPdf stroke={2} className='text-yellow-400' />
                                                Documents
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='text-neutral-100'>
                                                <IconVideo stroke={2} className='text-green-400' />
                                                Video
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                    <div className='w-full flex items-center gap-2'>
                        <h3 className='font-sans text-neutral-100 text-sm'>All Items</h3>
                        <span className='text-xs font-sans text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg'>{folderFileData.length}</span>
                    </div>

                    {/* GRID LAYOUT FOR LISTING THE FOLDER/FILES */}

                    <FileFolderCards folderFileData={folderFileData} isGridLayout={gridLayout} onHandleTrashUpdation={HandleTrashUpdation} onHandleFavoriteUpdation={HandleFavoriteUpdation} isFavoritePage={true} isTrashPage={false} />

                    {
                        empty ? (
                            <EmptyPage />
                        ) : (
                            <div></div>
                        )
                    }

                    <div className='w-full flex items-center justify-center'>
                        {
                            hasData ? (
                                <Button className='font-light' onClick={() => {
                                    HandleGetAllFileFolderData()
                                }}>Load More...</Button>
                            ) : (
                                <div></div>
                            )
                        }
                    </div>

                    {
                        loading ? (
                            <InfiniteLoader />
                        ) : (
                            <div></div>
                        )
                    }

                </div>



                {/* ADDITIONAL DETAILS RIGHT SECTION ALONG WITH UPLOAD OPTIONS */}

            </div>
        </div>
    )
}

export default page