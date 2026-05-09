"use client"
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { IconAdjustmentsAlt, IconDotsVertical, IconFileStar, IconFileUpload, IconFolder, IconHome, IconLayoutGridRemove, IconList, IconTrash, IconUpload } from '@tabler/icons-react'
import { SearchIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import CreateFolder from '@/components/CreateFolder'
import { useParams } from 'next/navigation';
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import InfiniteLoader from '@/components/InfiniteLoader'
import { EmptyPage } from '@/components/EmptyPage'
import FileUpload from '@/components/FileUpload'
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
import { ERROR_MAP, SharableErrorType } from '@/data/ErrorStateData'
import SharableError from '@/components/SharableError'
import MoveOrCopyCard from '@/components/MoveOrCopyCard'
import { useRouter } from 'next/navigation'
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

interface BreadCrumProps {
    folderName: string;
    folderID: string;
}

function page() {
    const { getToken } = useAuth()
    const [gridLayout, setgridLayout] = useState(true)
    const [loading, setLoading] = useState(false)
    const [FileFolderData, setFileFolderData] = useState<Array<FileFolderProps>>([])
    const [getREQUEST, setGETREQUEST] = useState<string>('api/v1/get/sharedFileFolder/child')
    const [hasData, setHasData] = useState<boolean>(true)
    const [secondIteration, setSecondIteration] = useState<boolean>(false)
    const [empty, setEmpty] = useState<boolean>(false)
    const [breadCrum, setBreadCrum] = useState<BreadCrumProps[]>([])
    const params = useParams();
    const [userPermission, setUserPermission] = useState<string>("PUBLIC")
    const [error, setError] = useState<SharableErrorType | null>(null)
    const router = useRouter()
    //  first call the access permissions API to get the user permissions for the current sharable link and then based on the permissions fetch the data and render the UI accordingly.

    const HandleGetAllFileFolderData = async () => {
        setEmpty(false)
        setHasData(false)
        setLoading(true)
        setBreadCrum([]) // Clear breadcrumb state before fetching new data
        const jwtToken = await getToken()
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(`${process.env.NEXT_PUBLIC_DOMAIN}/${getREQUEST}${secondIteration ? '&' : '?'}sharableUUID=${params.id ? params.id as string : undefined}&parentID=${params.parentHash ? params.parentHash as string : undefined}`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
                withCredentials: true,
            })
            .then((res) => {
                console.log(res.data)
                if (res.data.status_code === 5001) {
                    toast.error('Record not found!!')
                }
                else if (res.data.status_code === 5002) {
                    setEmpty(true)
                    let breadCrumbDetails = res.data.breadcrumb_details
                    // calculations for integrating the breadcrums
                    let path_details = breadCrumbDetails.map((item: any) => ({
                        folderName: item.name,
                        folderID: item.hashed_id
                    }));

                    setBreadCrum(path_details);
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
                    // setFolderFileData(res.data.data)  // used this expression to append new data to existing state array

                    // calculations for integrating the breadcrums
                    let breadCrumbDetails = res.data.breadcrumb_details
                    // calculations for integrating the breadcrums
                    let path_details = breadCrumbDetails.map((item: any) => ({
                        folderName: item.name,
                        folderID: item.hashed_id
                    }));

                    setBreadCrum(path_details);

                }
                else if (res.data.status_code === 5003 || res.data.status_code === 4005) {
                    toast.error("Session expired. Please enter password again.")
                    router.push(`/password/${params.parentHash ? params.parentHash as string : undefined}`)

                }
                else {
                    const currentError = ERROR_MAP[res.data.status_code];
                    if (currentError) {
                        setError(currentError);
                    } else {
                        toast.error("something went wrong while fetching the data")
                    }
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
                console.error("Error fetching folder/file data:", err)
            })
            .finally(() => {
                setLoading(false)
            })

    }

    const handleRequestAccessPermissions = async () => {
        const jwtToken = await getToken()
        axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/get/sharedFileFolder?sharableUUID=${params.id ? params.id as string : undefined}`, {}, {
            headers: {
                authorization: `Bearer ${jwtToken}`,
            },
        })
            .then((res) => {
                console.log(res.data)
                if (res.data.status_code === 5000) {
                    setUserPermission(res.data.data.permission_details.permission_type)
                    HandleGetAllFileFolderData()
                }
                else if (res.data.status_code === 5002) {
                    toast.error('Record not found!!')
                }
                else {
                    const currentError = ERROR_MAP[res.data.status_code];
                    if (currentError) {
                        setError(currentError);
                    } else {
                        toast.error("something went wrong while fetching the data")
                    }
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const GetUpdatedFileFolderData = async (id: number) => {
        setHasData(false)
        setLoading(true)
        const jwtToken = await getToken()
        console.log("JWT TOKEN IN UPDATE FUNC OF DASHBOARD PAGE SINGLE PAGE", jwtToken)
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(`${process.env.NEXT_PUBLIC_DOMAIN}/${getREQUEST}?sharableUUID=${params.id ? params.id as string : undefined}&parentID=${params.parentHash ? params.parentHash as string : undefined}`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res.data.status_code)
                if (res.data.status_code === 5001) {
                    toast.error('Record not found!!')
                }
                else if (res.data.status_code === 5002) {
                    setEmpty(true)
                    let breadCrumbDetails = res.data.breadcrumb_details
                    // calculations for integrating the breadcrums
                    let path_details = breadCrumbDetails.map((item: any) => ({
                        folderName: item.name,
                        folderID: item.hashed_id
                    }));

                    setBreadCrum(path_details);
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
        handleRequestAccessPermissions()
    }, [])


    if (error) {
        return (
            <SharableError error={error as SharableErrorType} />
        )
    }
    console.log("USER PERMISSION FOR THIS SHARABLE LINK IS ", userPermission)
    const canEdit = ['EDIT', 'ADMIN', 'OWNER'].includes(userPermission);
    const canShare = ['ADMIN', 'OWNER'].includes(userPermission);
    const canDelete = ['OWNER'].includes(userPermission);


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
                                {
                                    breadCrum.map((bread: BreadCrumProps) => {
                                        return (
                                            <div key={bread.folderID != null ? `${bread.folderID}-separator` : `${params.id ? params.id as string : undefined}-separator`} className='flex items-center gap-1'>
                                                <BreadcrumbSeparator className='text-lg' />
                                                <BreadcrumbItem >
                                                    <BreadcrumbLink href={bread.folderID != null ? `/sharable/folder/${params.id ? params.id as string : undefined}/${bread.folderID}` : `/sharable/folder/${params.id ? params.id as string : undefined}`}>
                                                        <h4 className='text-neutral-100 font-sans'>{bread.folderName}</h4>
                                                    </BreadcrumbLink>
                                                </BreadcrumbItem>
                                            </div>
                                        )
                                    })
                                }
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

                    <FileFolderCards folderFileData={FileFolderData} isFavoritePage={false} isGridLayout={gridLayout} isTrashPage={false} onHandleFavoriteUpdation={HandleFavoriteUpdation} onHandleTrashUpdation={HandleTrashUpdation} isShared={true} shareUUID={params.id ? params.id as string : undefined} />

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

                    {
                        canEdit ? (
                            <div className='flex flex-col gap-2'>
                                <FileUpload isRoot={true} shareUUID={params.id ? params.id as string : undefined} parentHash={params.parentHash ? params.parentHash as string : undefined} />
                                <CreateFolder isRoot={false} shareUUID={params.id ? params.id as string : undefined} parentHash={params.parentHash ? params.parentHash as string : undefined} />
                                <MoveOrCopyCard isShared={true} sharableUUID={params.id ? params.id as string : undefined} sourceID={params.parentHash ? params.parentHash as string : undefined} type={'folder'} />
                            </div>

                        ) : (
                            <div></div>
                        )
                    }
                    {
                        canShare ? (
                            <ShareCard UUID={params.id ? params.id as string : null} type={'folder'} childSharableHash={params.parentHash ? params.parentHash as string : null} isShared={true} isOwner={canDelete} /> // canDelete if true that means its owner

                        ) : (
                            <div></div>
                        )
                    }
                </div>
            </div>
        </div>
    )

}

export default page