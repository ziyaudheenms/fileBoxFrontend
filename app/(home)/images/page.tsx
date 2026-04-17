"use client"
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { IconAdjustmentsAlt, IconDotsVertical, IconFileStar, IconFileUpload, IconFolder, IconHome, IconLayoutGridRemove, IconList, IconTrash, IconUpload } from '@tabler/icons-react'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import CreateFolder from '@/components/CreateFolder'
import { useParams } from 'next/navigation';
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import InfiniteLoader from '@/components/InfiniteLoader'
import { EmptyPage } from '@/components/EmptyPage'
import FileUpload from '@/components/FileUpload'
import ImageProcessing from '@/components/ImageProcessing'
import FileFolderCards from '@/components/FileFolderCards'
import { toast } from 'sonner'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import ShareCard from '@/components/ShareCard'
import MoveCard from '@/components/MoveOrCopyCard'
import MoveOrCopyCard from '@/components/MoveOrCopyCard'
import UpdateMetaData from '@/components/UpdateMetaData'
import SearchBar from '@/components/SearchBar'
import StorageUpdate from '@/components/StorageUpdate'

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
    const { getToken } = useAuth()
    const [gridLayout, setgridLayout] = useState(true)
    const [loading, setLoading] = useState(false)
    const [FileFolderData, setFileFolderData] = useState<Array<FileFolderProps>>([])
    const [getREQUEST, setGETREQUEST] = useState<string>('http://127.0.0.1:8000/api/v1/fileFolders')
    const [hasData, setHasData] = useState<boolean>(true)
    const [secondIteration, setSecondIteration] = useState<boolean>(false)
    const [empty, setEmpty] = useState<boolean>(false)
    const params = useParams();

    const HandleGetAllFileFolderData = async () => {
        setHasData(false)
        setLoading(true)
        const jwtToken = await getToken()
        localStorage.setItem("refreshToken", jwtToken || "")
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(`${getREQUEST}${secondIteration ? '&' : '?'}category=image`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },

            })
            .then((res) => {
                console.log(res.data)
                if (res.data.status_code === 5002) {
                    setEmpty(true)
                }
                else if (res.data.status_code === 5000) {
                    setFileFolderData((prev) => {
                        const newData = res.data.data;
                        // Filter out items in newData that are already present in prev
                        const uniqueNewItems = newData.filter(newItem =>
                            !prev.some(prevItem => prevItem.id === newItem.id)
                        );
                        return [...prev, ...uniqueNewItems]
                    }) // used this expression to append new data to existing state array

                }

                if (res.data.message.next_cursor != null) {
                    setGETREQUEST(res.data.message.next_cursor)
                    setHasData(true)
                    setSecondIteration(true) // used for correcting the GET request url for next iterations along with the Current Folder ID so that to track the file/folders inside the current folder.
                } else {
                    setHasData(false)
                }
                console.log("Successfully fetched all folder/file data")
            })
            .catch((err) => {

            })
            .finally(() => {
                setLoading(false)
            })

    }

    const GetUpdatedFileFolderData = async (id: number) => {
        setHasData(false)
        setLoading(true)
        const jwtToken = await getToken()
        console.log("JWT TOKEN IN UPDATE FUNC OF DASHBOARD PAGE SINGLE PAGE", jwtToken)
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(`${getREQUEST}?category=image`, {
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
                    setFileFolderData(res.data.data)
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
        console.log("JWT TOKEN IN TRASH FUNC OF DASHBOARD PAGE SINGLE PAGE", jwtToken)
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
                        toast.success("Item moved to Trash.")
                        GetUpdatedFileFolderData(fileFolderID)
                    }
                    else if (res.data.status_code === 5002) {
                        toast.error("Xant Delete item. Move to Trash failed.")
                    }
                })
                .catch((err) => {
                    console.log(err)

                })
        }
    }

    const HandleFavoriteUpdation = async (fileFolderID: number) => {
        const jwtToken = await getToken()
        console.log("JWT TOKEN IN FAVORITE FUNC OF DASHBOARD PAGE SINGLE PAGE", jwtToken)
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
                        // GetUpdatedFileFolderData()
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
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/dashboard`}>
                                        <div className='flex  gap-1'>

                                            <IconHome stroke={2} height={20} width={20} className='text-neutral-100' />
                                            <h4 className='text-neutral-100 font-sans'>Home</h4>

                                        </div>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
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
                                <IconAdjustmentsAlt stroke={2} height={20} width={20} className='text-neutral-100' />
                            </div>
                        </div>
                    </div>
                    <div className='w-full flex items-center gap-2'>
                        <h3 className='font-sans text-neutral-100 text-sm'>All Items</h3>
                        <span className='text-xs font-sans text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg'>{FileFolderData.length}</span>
                    </div>

                    {/* GRID LAYOUT FOR LISTING THE FOLDER/FILES */}

                    <FileFolderCards folderFileData={FileFolderData} isFavoritePage={false} isGridLayout={gridLayout} isTrashPage={false} onHandleFavoriteUpdation={HandleFavoriteUpdation} onHandleTrashUpdation={HandleTrashUpdation} />

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

                <div className='w-[27%] px-2 py-2 flex flex-col gap-3 h-screen overflow-y-scroll no-scrollbar'>
                    {/*UPLOAD OPTIONS */}
                    <SearchBar />

                {/*CREATE FOLDER */}
                <CreateFolder isRoot={true} />
                {/*UPLOAD OPTIONS */}
                <FileUpload isRoot={false} />
                {/* STORAGR STATUS*/}
                <StorageUpdate />
          
                </div>
            </div>
        </div>
    )
}

export default page