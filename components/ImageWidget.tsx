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
        <div className='flex flex-col lg:flex-row w-full h-auto lg:h-screen lg:overflow-y-scroll no-scrollbar py-4 px-2 sm:px-4 gap-6 pb-24 lg:pb-6'>
            {
                fileFolderData.file_url ? (
                    <div className='w-full lg:w-[60%] flex justify-center items-center px-2 sm:px-4'>
                        <div className='relative w-full max-w-2xl h-[320px] sm:h-[450px] lg:h-[560px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/30 backdrop-blur-md flex items-center justify-center p-2 shadow-2xl'>
                            <Image 
                                src={fileFolderData.file_url} 
                                alt={fileFolderData.name || 'Uploaded Image'} 
                                fill 
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className='object-contain rounded-xl p-2' 
                                priority
                            />
                        </div>
                    </div>
                ) : (
                    <div className='w-full lg:w-[60%] flex justify-center items-center min-h-[300px]'>
                        <InfiniteLoader />
                    </div>
                )
            }

            <div className='w-full lg:w-[40%] flex flex-col items-center justify-start gap-4'>
                <div className='w-full sm:w-[90%] lg:w-[85%] flex flex-col justify-between border border-neutral-800 p-4 sm:p-5 bg-neutral-900/40 backdrop-blur-md rounded-2xl shadow-xl'>
                    <div className='flex flex-col gap-3'>
                        <div className='font-sans flex items-center justify-between gap-2'>
                            <h5 className='text-neutral-400 text-sm'>Name</h5>
                            <h5 className='text-neutral-100 text-sm font-medium truncate max-w-[200px]' title={fileFolderData.name}>{fileFolderData.name}</h5>
                        </div>
                        <div className='font-sans flex items-center justify-between'>
                            <h5 className='text-neutral-400 text-sm'>Size</h5>
                            <h5 className='text-neutral-100 text-sm font-medium'>
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
                            <h5 className='text-neutral-400 text-sm'>Uploaded At</h5>
                            <h5 className='text-neutral-100 text-sm font-medium'>{getRelativeTime(fileFolderData.uploaded_at)}</h5>
                        </div>
                        <div className='font-sans flex items-center justify-between'>
                            <h5 className='text-neutral-400 text-sm'>Type</h5>
                            <h5 className='text-neutral-100 text-sm font-medium uppercase'>{fileFolderData.file_extension}</h5>
                        </div>
                    </div>

                    <div className='w-full pb-1 pt-5 border-t border-neutral-800/80 mt-4'>
                        <Download fileName={fileFolderData.name} fileUrl={fileFolderData.file_url} />
                        <div className='w-full py-2 flex items-center gap-2 font-figtree mt-2'>
                            {
                                canShare ? (
                                    <>
                                        <ShareCard UUID={sharableUUID} childSharableHash={fileHash} type={'image'} isShared={true} isOwner={canDelete} />
                                        {
                                            canDelete ? (
                                                <Button className='w-[30%] bg-neutral-950 border border-neutral-800 hover:bg-red-600'>
                                                    <IconCopyX stroke={2} className='text-red-900' height={24} width={24} />
                                                </Button>
                                            ) : null
                                        }
                                    </>
                                ) : null
                            }
                        </div>
                    </div>

                </div>
                {
                    canEdit ? (
                        <div className='w-full sm:w-[90%] lg:w-[85%] flex flex-col gap-3'>
                            <UpdateMetaData fileHash={fileHash} sharableUUID={sharableUUID} type='image' />
                            <MoveOrCopyCard sourceID={fileHash} type={'file'} isShared={true} sharableUUID={sharableUUID} />
                        </div>
                    ) : null
                }
            </div>
        </div>
    )
}

export default ImageWidget