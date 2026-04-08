'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/navbar';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import InfiniteLoader from '@/components/InfiniteLoader';
import ImageProcessing from '@/components/ImageProcessing';
import Image from 'next/image';
import { IconCopyX, IconPencilCheck, IconUser } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { toast } from 'sonner';
import SharableError from '@/components/SharableError';
import ShareCard from '@/components/ShareCard';
import { ERROR_MAP, SharableErrorType } from '@/data/ErrorStateData';
import Download from '@/components/Download';
import UpdateMetaData from '@/components/UpdateMetaData';

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
    permission_data?: {
        permission_type?: string;
        permission_granded_at?: Date;
    }
}

function getRelativeTime(date: Date | string | undefined): string {
    if (!date) return '';
    const now = new Date();
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    if (years > 0) return years === 1 ? '1 year ago' : `${years} years ago`;
    if (months > 0) return months === 1 ? '1 month ago' : `${months} months ago`;
    if (days > 0) return days === 1 ? '1 day ago' : `${days} days ago`;
    if (hours > 0) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    if (minutes > 0) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    return 'just now';
}

// type SharableErrorType = "NO-ACCESS" | "LINK-EXPIRED" | "INCORRECT-PASSWORD" | "ACCESS-LIMIT-CROSSED" | "NOT-FOUND"
// const ERROR_MAP: Record<number, SharableErrorType> = {
//     4002: 'NO-ACCESS',
//     5004: 'LINK-EXPIRED',
//     5008: 'INCORRECT-PASSWORD',
//     5006: 'ACCESS-LIMIT-CROSSED',
//     5002: 'NOT-FOUND'
// };

function page() {
    const params = useParams();
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<SharableErrorType | null>(null)
    const [folderFileData, setFolderFileData] = useState<FileFolderProps>({} as FileFolderProps)

    const HandleGetSharedImage = async () => {
        setLoading(true)
        setError(null) // Reset error state before fetching new data
        const jwtToken = await getToken() //getting the authentication token ....................
        axios
            .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/get/sharedFileFolder?sharableUUID=${params.id ? params.id as string : undefined}`, {}, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            },)
            .then((response) => {
                console.log(response.data)
                if (response.data.status_code == 5000) {
                    setFolderFileData(response.data.data)
                    toast.success("successfully fetched the data")
                }
                else {
                    const currentError = ERROR_MAP[response.data.status_code];
                    if (currentError) {
                        setError(currentError);
                    } else {
                        toast.error("something went wrong while fetching the data")
                    }
                }
            }).catch((error) => {
                console.error(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        HandleGetSharedImage()
    }, [])

    if (loading) {
        return <InfiniteLoader />
    }

    // handled the error component to show the error based on the error type we get from the backend when we try to fetch the shared file or folder data using the sharable link and if there is an error we set the error state with the error type and then render the SharableError component with the error type as a prop to show the appropriate error message and image to the user based on the error type .....
    if (error) {
        return (
            <SharableError error={error as SharableErrorType} />
        )
    }


    // setting up the permissions based on the role of the user for this file .....
    const userRole = folderFileData.permission_data?.permission_type || 'PUBLIC';
    const canEdit = ['EDIT', 'ADMIN', 'OWNER'].includes(userRole);
    const canShare = ['ADMIN', 'OWNER'].includes(userRole);
    const canDelete = ['OWNER'].includes(userRole);  // only belongs to the owner of the file or folder can delete it .....x

    return (
        <div>
            <Navbar />

            <div className='flex w-full  h-screen overflow-y-scroll no-scrollbar py-2 px-2'>
                {
                    folderFileData.file_url ? (
                        <div className='w-[60%] flex justify-center items-center h-full px-5 relative'>
                            {
                                folderFileData.upload_status == 'PENDING' || folderFileData.upload_status == 'PROCESSING' || folderFileData.upload_status == 'FAILED' ? (
                                    <ImageProcessing parent='image' />
                                ) : (
                                    <Image src={folderFileData?.file_url} height={500} width={500} alt='Uploaded Image in a big view' className=' w-full h-fit absolute top-0 left-0 right-0' />
                                )
                            }
                        </div>
                    ) :
                        <InfiniteLoader />
                }

                <div className='w-[40%]'>
                    <div className='w-full flex flex-col items-center justify-center gap-2 '>
                        <div className='w-[80%] h-96  flex flex-col justify-between border-2 p-4  border-neutral-800 rounded-lg'>
                            <div className='flex flex-col gap-2'>
                                <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Name</h5>
                                    <h5 className='text-neutral-100'>{folderFileData.name}</h5>
                                </div>
                                <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Size</h5>
                                    <h5 className='text-neutral-100'>
                                        {(() => {
                                            const size = folderFileData.size;
                                            if (typeof size !== 'number' || isNaN(size)) return '';
                                            if (size >= 1024 * 1024) {
                                                return (size / (1024 * 1024)).toFixed(2) + ' GB';
                                            } else if (size >= 1024) {
                                                return (size / 1024).toFixed(2) + ' MB';
                                            } else {
                                                return size + ' KB';
                                            }
                                        })()}
                                    </h5>
                                </div>
                                <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Uploaded At</h5>
                                    <h5 className='text-neutral-100'>{getRelativeTime(folderFileData.uploaded_at)}</h5>
                                </div>
                                <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Type</h5>
                                    <h5 className='text-neutral-100'>{folderFileData.file_extension}</h5>
                                </div>
                            </div>

                            <div className='w-full pb-2 pt-5 border-t-2 border-t-neutral-800'>
                                <Download fileName={folderFileData.name} fileUrl={folderFileData.file_url} />
                                <div className='w-full py-2 flex gap-2 font-figtree'>
                                    {
                                        canShare ? (
                                            <>
                                                <ShareCard fileFolderID={folderFileData.id} type={'image'} isShared={true}/>
                                                {
                                                    canDelete ? (
                                                        <Button className='w-[30%] bg-neutral-950 border border-neutral-800 hover:bg-red-600'>
                                                            <IconCopyX stroke={2} className='text-red-900 ' height={30} width={30} />
                                                        </Button>
                                                    ) : (
                                                        <div></div>
                                                    )
                                                }

                                            </>
                                        ) : (
                                            <div></div>
                                        )
                                    }

                                </div>
                            </div>

                        </div>
                        {
                            canEdit ? (
                                <>
                                    <UpdateMetaData sharableUUID={params.id ? params.id as string: undefined}/>
                                </>
                            ) : (
                                <div></div>
                            )
                        }


                    </div>
                </div>
            </div>


        </div>
    )
}

export default page