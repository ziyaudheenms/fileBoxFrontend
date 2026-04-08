'use client'
import React from 'react'
import InfiniteLoader from '@/components/InfiniteLoader';
import Image from 'next/image';
import { IconCopyX, IconDownload, IconPencilCheck, IconUser } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import ShareCard from '@/components/ShareCard';
import MoveOrCopyCard from './MoveOrCopyCard';
import Download from './Download';
import UpdateMetaData from './UpdateMetaData';

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

interface ImageWidgetConfigurePros  {
    isPreview : boolean;
    fileHash?: string;
    sharableUUID : string;
    userPermission?: string;
    fileFolderData : FileFolderProps;
    canShare: boolean;
    canDelete: boolean;
    canEdit: boolean;
}

function ImageWidget({isPreview , fileHash , sharableUUID , userPermission , fileFolderData , canShare , canDelete , canEdit} : ImageWidgetConfigurePros) {
    
    return (
            <div className='flex w-full  h-screen overflow-y-scroll no-scrollbar py-2 px-2'>
                {
                    fileFolderData.file_url ? (
                        <div className='w-[60%] flex justify-center items-center h-full px-5 relative'>
                            
                            <Image src={fileFolderData?.file_url} height={500} width={500} alt='Uploaded Image in a big view' className=' w-full h-fit absolute top-0 left-0 right-0' />
                              
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
                                    <h5 className='text-neutral-100'>{fileFolderData.name}</h5>
                                </div>
                                <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Size</h5>
                                    <h5 className='text-neutral-100'>
                                        {(() => {
                                            const size = fileFolderData.size;
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
                                    <h5 className='text-neutral-100'>{getRelativeTime(fileFolderData.uploaded_at)}</h5>
                                </div>
                                <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Type</h5>
                                    <h5 className='text-neutral-100'>{fileFolderData.file_extension}</h5>
                                </div>
                            </div>

                            <div className='w-full pb-2 pt-5 border-t-2 border-t-neutral-800'>
                                <Download fileName={fileFolderData.name} fileUrl={fileFolderData.file_url} />
                                <div className='w-full py-2 flex gap-2 font-figtree'>
                                    {
                                        canShare ? (
                                            <>
                                                <ShareCard UUID={sharableUUID} childSharableHash={fileHash} type={'image'} isShared={true} isOwner={canDelete}/> //if can delete is true that means its owner
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
                                    <UpdateMetaData fileHash={fileHash} sharableUUID={sharableUUID}/>
                                    <MoveOrCopyCard sourceID={fileHash} type={'file'} isShared={true} sharableUUID={sharableUUID}/>

                                </>
                            ) : (
                                <div></div>
                            )
                        }


                    </div>
                </div>
            </div>
    )
}

export default ImageWidget