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
import ImageWidget from '@/components/ImageWidget'

interface FileFolderProps {
    id: number;
    author: string;
    size: number;
    parentFolder: string | null;
    name: string;
    type_of_file_folder : string | null;
    uploaded_at: Date;
    updated_at: Date;
    isfolder: boolean;
    is_root_folder: boolean;
    file_url: string | null;
    file_extension: string | null;
}

interface BreadCrumProps {
    folderName: string;
    folderID: string;
}

function page() {
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [FileFolderData, setFileFolderData] = useState<FileFolderProps>({} as FileFolderProps)
    const [getREQUEST, setGETREQUEST] = useState<string>('api/v1/get/sharedFileFolder/child')
    const [empty, setEmpty] = useState<boolean>(false)
    const [breadCrum, setBreadCrum] = useState<BreadCrumProps[]>([])
    const params = useParams();
    const [userPermission, setUserPermission] = useState<string>("PUBLIC")
    const [error, setError] = useState<SharableErrorType | null>(null)
    
//  first call the access permissions API to get the user permissions for the current sharable link and then based on the permissions fetch the data and render the UI accordingly.

     const HandleGetFileData = async () => {
        setEmpty(false)
        setLoading(true)
        setBreadCrum([]) // Clear breadcrumb state before fetching new data
        const jwtToken = await getToken()
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(`${process.env.NEXT_PUBLIC_DOMAIN}/${getREQUEST}?sharableUUID=${params.id ? params.id as string : undefined}&parentID=${params.fileHash ? params.fileHash as string : undefined}`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                }
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
                    setFileFolderData(res.data.data)
                    // calculations for integrating the breadcrums
                    let breadCrumbDetails = res.data.breadcrumb_details
                    // calculations for integrating the breadcrums
                    let path_details = breadCrumbDetails.map((item: any) => ({
                        folderName: item.name,
                        folderID: item.hashed_id
                    }));

                    setBreadCrum(path_details);

                }
                else {
                    const currentError = ERROR_MAP[res.data.status_code];
                    if (currentError) {
                        setError(currentError);
                    } else {
                        toast.error("something went wrong while fetching the data")
                    } 
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
        axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/get/sharedFileFolder?sharableUUID=${params.id ? params.id as string : undefined}` , {} , {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res.data)
                if (res.data.status_code === 5000) {
                    setUserPermission(res.data.data.permission_details.permission_type)
                    HandleGetFileData()
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
                <div className='w-[73%] px-2 py-2'>
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
                                                    <BreadcrumbLink href={ bread.folderID != null ? `/sharable/folder/${params.id ? params.id as string : undefined}/${bread.folderID}` : `/sharable/folder/${params.id ? params.id as string : undefined}`}>
                                                        <h4 className='text-neutral-100 font-sans'>{bread.folderName}</h4>
                                                    </BreadcrumbLink>
                                                </BreadcrumbItem>
                                            </div>
                                        )
                                    })
                                }
                            </BreadcrumbList>
                        </Breadcrumb>
                </div>
                <div className='w-full px-2 py-2 h-screen overflow-y-scroll no-scrollbar'>
                    
                    {
                        FileFolderData.type_of_file_folder == 'image' ? (
                            <ImageWidget isPreview={true} userPermission={userPermission} sharableUUID={params.id as string} fileHash={ params.fileHash as string} fileFolderData = {FileFolderData} canDelete={canDelete} canEdit={canEdit} canShare={canShare}/>
                        ) : (
                            <div></div>
                        )
                    }   

                    {
                        empty ? (
                            <EmptyPage />
                        ) : (
                            <div></div>
                        )
                    }


                    {
                        loading ? (
                            <InfiniteLoader />
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