'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Image from 'next/image'
import { IconHome } from '@tabler/icons-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import InfiniteLoader from '@/components/InfiniteLoader'
import ImageProcessing from '@/components/ImageProcessing'
import ShareCard from '@/components/ShareCard'
import DeleteButton from '@/components/DeleteButton'
import MoveOrCopyCard from '@/components/MoveOrCopyCard'
import Download from '@/components/Download'
import UpdateMetaData from '@/components/UpdateMetaData'
import Settings from '@/components/Settings'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { getSingleFile } from '@/features/FileFoldersSlice'
import Password from '@/components/Password'
// Custom function to get relative time based on the DATE object.
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

function page() {

    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState("")
    const [upDatePermissionLoader, setupDatePermissionLoader] = useState<Boolean>(false)
    const params = useParams();
    const wsRef = React.useRef<WebSocket | null>(null);
    const { singlePageData, isLoading, sessionStatus} = useAppSelector((state) => state.fileFolders)
    const dispatch = useAppDispatch()


    const HandleSingleImage = async () => {
        setLoading(true)
        const jwtToken = await getToken()
        dispatch(getSingleFile({
            requesturl: `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders/Single?fileFolderID=${params.id ? params.id as string : undefined}`,
            jwtToken: jwtToken ? jwtToken : "",
        }))
    }

    useEffect(() => {
        if (sessionStatus?.code === 5003 || sessionStatus?.code === 4002) {
            toast.error("Session expired. Please enter password again.")
        }
        if (sessionStatus?.code === 5000) {
            HandleSingleImage()
        }
    } , [sessionStatus])

    useEffect(() => {
        HandleSingleImage()
    } , [])
   
    // useEffect(() => {
    //     HandleSingleImage()
    //     if (singlePageData?.upload_status === 'PENDING' || singlePageData?.upload_status === 'PROCESSING') {
    //         console.log('Setting up WebSocket connection for file ID:', singlePageData?.id);
    //         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    //         if (!token) {
    //             console.log('waiting for token')
    //             return
    //         }
    //         const ws = new WebSocket(`${protocol}//127.0.0.1:8000/ws/files/?token=${token}`);
    //         wsRef.current = ws;

    //         ws.onopen = () => {
    //             console.log('WebSocket connection established');
    //         }

    //         ws.onclose = () => {
    //             console.log('WebSocket connection closed');
    //         }

    //         ws.onmessage = (event) => {
    //             const data = JSON.parse(event.data);
    //             console.log('WebSocket message received:', data);
    //             setFolderFileData((prevData) => {
    //                 if (data.file_id == prevData.id) {
    //                     console.log('Updating file data for file ID:', data.file_id);
    //                     prevData.upload_status = data.upload_status;
    //                     prevData.file_url = data.file_url
    //                     console.log("Updated prevData:", prevData);
    //                     return { ...prevData };
    //                 }
    //                 return { ...prevData };
    //             });
    //         }
    //         const pingInterval = setInterval(() => {
    //             if (ws.readyState === WebSocket.OPEN) {
    //                 ws.send(JSON.stringify({ type: 'ping' }));
    //             }
    //         }, 30000);

    //         return () => {
    //             clearInterval(pingInterval);
    //             ws.close();
    //             console.log('webSocket connection is closed for a while...')
    //         }
    //     }
    //     else {
    //         console.log('No need for WebSocket connection. Current upload status:', folderFileData?.upload_status);
    //     }
    // }, [token, singlePageData?.id])

    if (sessionStatus?.code === 5003 || sessionStatus?.code === 4002 || sessionStatus?.code === 4005) {
        return (
            <div className='w-full h-screen flex flex-col items-center justify-center gap-2'>
            <Password fileFolderID={params.id ? params.id as string : undefined}/>  
            {
                isLoading ? (
                    <InfiniteLoader />
                ) : (
                    <div></div>
                )
            }
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <Link href={'/dashboard'}>
                <div className='flex  gap-1 px-4'>
                    <IconHome stroke={2} height={20} width={20} className='text-neutral-100' />
                    <h4 className='text-neutral-100 font-sans'>Home</h4>
                </div>
            </Link>
            {
                !isLoading ? (
                    <div className='flex w-full  h-screen overflow-y-scroll no-scrollbar py-2 px-2'>
                        {
                            singlePageData?.file_url ? (
                                <div className='w-[60%] flex justify-center items-center h-full px-5 relative'>
                                    {
                                        singlePageData?.upload_status == 'PENDING' || singlePageData?.upload_status == 'PROCESSING' || singlePageData?.upload_status == 'FAILED' ? (
                                            <ImageProcessing parent='image' />
                                        ) : (
                                            <Image src={singlePageData?.file_url} height={500} width={500} alt='Uploaded Image in a big view' className=' w-full h-fit absolute top-0 left-0 right-0' />
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
                                            <h5 className='text-neutral-100'>{singlePageData?.name}</h5>
                                        </div>
                                        <div className='font-sans flex items-center justify-between'>
                                            <h5 className='text-neutral-400'>Size</h5>
                                            <h5 className='text-neutral-100'>
                                                {(() => {
                                                    const size = singlePageData?.size;
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
                                            <h5 className='text-neutral-100'>{getRelativeTime(singlePageData?.uploaded_at)}</h5>
                                        </div>
                                        <div className='font-sans flex items-center justify-between'>
                                            <h5 className='text-neutral-400'>Type</h5>
                                            <h5 className='text-neutral-100'>{singlePageData?.file_extension}</h5>
                                        </div>
                                        {/* <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Dimensions</h5>
                                    <h5 className='text-neutral-100'>{singlePageData?.dimensions}</h5>
                                </div> */}
                                    </div>

                                    <div className='w-full pb-2 pt-5 border-t-2 border-t-neutral-800'>
                                        <Download fileName={singlePageData?.name} fileUrl={singlePageData?.file_url} />
                                        <div className='w-full py-2 flex items-center gap-2 font-figtree'>
                                            <ShareCard fileFolderID={singlePageData?.id} type={'image'} isShared={false} />
                                            <DeleteButton fileFolderID={params.id ? params.id as string : undefined} isDropDown={false} />
                                        </div>
                                    </div>

                                </div>

                                <Settings fileFolderID={params.id ? params.id as string : ""} />
                                <UpdateMetaData fileID={params.id ? params.id as string : ""} type='image'/>
                                <MoveOrCopyCard sourceID={params.id ? params.id as string : ""} type={'file'} isShared={false} />



                            </div>
                        </div>
                    </div>
                ) : (
                    <InfiniteLoader />
                )
            }

        </div>
    )
}

export default page