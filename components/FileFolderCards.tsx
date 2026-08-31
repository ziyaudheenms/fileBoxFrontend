'use client'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { IconDotsVertical, IconFileStar, IconFolder, IconHeartFilled, IconTrash } from '@tabler/icons-react';
import ImageProcessing from './ImageProcessing';
import Image from 'next/image'; // Add this line
import { useUser } from '@clerk/nextjs';
import FileFolderBadge from './FileFolderBadge';
import DeleteButton from './DeleteButton';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import InfiniteLoader from './InfiniteLoader';
import TrashLoader from './TrashLoader';
import FavoriteLoader from './FavoriteLoader';
import { useAuth } from '@clerk/nextjs'
import { handleFavoriteFileFolderUpdate, handleFileFolderTrashUpdate } from '@/features/FileFoldersSlice';

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
    profile_image: string
}

interface Props {
    folderFileData: FileFolderProps[];
    isGridLayout: boolean;
    isTrashPage: boolean;
    isFavoritePage: boolean;
    isShared?: boolean;
    shareUUID?: string;
}



function FileFolderCards({ folderFileData, isGridLayout, isTrashPage, isFavoritePage, isShared, shareUUID }: Props) {
    const { isSignedIn, user, isLoaded } = useUser();
    const { getToken } = useAuth()
    const { isTrashLoading, specificRecordID, isFavoriteLoading } = useAppSelector((state) => state.fileFolders)
    const dispatch = useAppDispatch()

    // file folder operations.....
    const HandleTrashUpdation = async (fileFolderID: number) => {
        const jwtToken = await getToken()
        dispatch(handleFileFolderTrashUpdate({
            fileFolerID: fileFolderID,
            jwtToken: jwtToken ? jwtToken : "",
        }))
    }

    const HandleFavoriteUpdation = async (fileFolderID: number) => {
        const jwtToken = await getToken()
        dispatch(handleFavoriteFileFolderUpdate({
            fileFolerID: fileFolderID,
            jwtToken: jwtToken ? jwtToken : "",
            isFavoritePage: isFavoritePage,
        }))
    }


    return (
        <div>
            {
                isGridLayout ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-5">
                        {folderFileData.map((item) => (
                            <div key={item.id} className='group relative bg-white dark:bg-neutral-900/40 backdrop-blur-md
             border border-neutral-200 dark:border-neutral-800 rounded-lg 
             hover:border-red-600/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50
             hover:-translate-y-1.5 
             transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
             hover:shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]
             cursor-pointer overflow-hidden flex flex-col justify-between'>
                                {
                                    item.isfolder ? (
                                        <Link href={isShared ? `/sharable/folder/${shareUUID}/${item.id}` : `/dashboard/${item.id}`} className='block w-full'>
                                            <div className='relative h-44 w-full bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center rounded-t-lg overflow-hidden'>
                                                {
                                                    item.author == user?.username ? null : (
                                                        <div className='absolute top-3 right-2 z-10'>
                                                            <FileFolderBadge avatar={item.profile_image || '#'} username={item.author} />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    isFavoriteLoading && item.id == specificRecordID ? (
                                                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
                                                            <FavoriteLoader />
                                                        </div>
                                                    ) : null
                                                }

                                                {
                                                    item.is_favorite && (
                                                        <div className='absolute top-3 left-2 z-10'>
                                                            <IconHeartFilled stroke={1.5} className='text-pink-600 group-hover:scale-110 group-hover:translate-x-0.5 transition-all ease-out duration-300' />
                                                        </div>
                                                    )
                                                }

                                                <IconFolder stroke={2} height={80} width={80} className='text-red-600/50 font-figtree group-hover:text-red-600 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 ease-out' />
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link href={isShared ? `/sharable/folder/${shareUUID}/preview/${item.id}` : `/images/${item.id}`} className='block w-full'>
                                            <div className='relative h-44 w-full bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center rounded-t-lg overflow-hidden'>
                                                {
                                                    item.author == user?.username ? (
                                                        <div className='absolute top-3 right-2 z-10 flex items-center justify-center h-6 px-2.5 rounded-full border bg-white/90 dark:bg-neutral-900/90 border-red-600/70 shadow-sm'>
                                                            <span className='text-[11px] font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wide'>
                                                                {item.file_extension || 'IMG'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className='absolute top-3 right-2 z-10'>
                                                            <FileFolderBadge avatar={item.profile_image || '#'} username={item.author} />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    isTrashLoading && item.id == specificRecordID && (
                                                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
                                                            <TrashLoader />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    isFavoriteLoading && item.id == specificRecordID && (
                                                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
                                                            <FavoriteLoader />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    item.is_favorite && (
                                                        <div className='absolute top-3 left-2 z-10'>
                                                            <IconHeartFilled stroke={1.5} className='text-pink-600 group-hover:scale-110 group-hover:translate-x-0.5 transition-all ease-out duration-300' />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    item.upload_status == 'PENDING' || item.upload_status == 'PROCESSING' || item.upload_status == 'FAILED' ? (
                                                        <ImageProcessing parent='dashboard' />
                                                    ) : item.file_url ? (
                                                        <Image
                                                            src={item.file_url}
                                                            alt={item.name || 'image'}
                                                            fill
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                            className='object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
                                                        />
                                                    ) : (
                                                        <div className='w-full h-full flex items-center justify-center text-neutral-400 text-sm'>
                                                            No Preview
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </Link>
                                    )
                                }
                                <div className='flex flex-col pt-3 pb-2 px-3'>
                                    <div className='flex items-center justify-between gap-2'>
                                        <h1 className='text-sm text-neutral-900 dark:text-neutral-100 font-figtree font-medium truncate' title={item.name}>
                                            {item.name}
                                        </h1>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className='p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0'>
                                                    <IconDotsVertical stroke={2} height={18} width={18} className='text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200' />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800" align="start">
                                                <DropdownMenuLabel className='font-figtree text-neutral-900 dark:text-neutral-100'>Details</DropdownMenuLabel>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        Name
                                                        <DropdownMenuShortcut className='text-blue-600 font-bold truncate max-w-[120px]'>{item.name}</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Size
                                                        <DropdownMenuShortcut className='text-red-600 font-bold'>
                                                            {item.size > 1024 * 1024 ? `${(item.size / (1024 * 1024)).toFixed(2)} gb` : item.size > 1024 ? `${(item.size / 1024).toFixed(2)} mb` : `${item.size} kb`}
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Type
                                                        <DropdownMenuShortcut className='text-green-600 font-bold'>{item.file_extension ? item.file_extension : "Folder"}</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    {
                                                        isTrashPage ? null : (
                                                            <DropdownMenuItem onClick={() => HandleFavoriteUpdation(item.id)} className='cursor-pointer'>
                                                                <span>{item.is_favorite ? "Remove From Favorite" : "Add To Favorite"}</span>
                                                                <DropdownMenuShortcut>
                                                                    <IconFileStar stroke={2} className='text-neutral-500' />
                                                                </DropdownMenuShortcut>
                                                            </DropdownMenuItem>
                                                        )
                                                    }
                                                    <DropdownMenuItem onClick={() => HandleTrashUpdation(item.id)} className='cursor-pointer'>
                                                        <span>{isTrashPage ? "Restore From Trash" : "Add To Trash"}</span>
                                                        <DropdownMenuShortcut>
                                                            <IconTrash stroke={2} className='text-neutral-500' />
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <DeleteButton fileFolderID={shareUUID ? undefined : String(item.id)} shareUUID={shareUUID ? shareUUID : undefined} fileFolderHash={isShared ? String(item.id) : undefined} isDropDown={true} />
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 py-5">
                        {folderFileData.map((item) => (
                            <div key={item.id} className='group bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center w-full hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-red-900/50 transition-all duration-300 ease-out overflow-hidden cursor-pointer'>
                                {
                                    item.isfolder ? (
                                        <Link href={isShared ? `/sharable/folder/${shareUUID}/${item.id}` : `/dashboard/${item.id}`} className='w-28 sm:w-36 md:w-44 h-28 sm:h-32 bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0'>
                                            <IconFolder stroke={2} height={60} width={60} className='text-red-600/50 font-figtree group-hover:text-red-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 ease-out' />
                                        </Link>
                                    ) : (
                                        <Link href={isShared ? `/sharable/folder/${shareUUID}/preview/${item.id}` : `/images/${item.id}`} className='w-28 sm:w-36 md:w-44 h-28 sm:h-32 relative flex-shrink-0 bg-neutral-100 dark:bg-zinc-900 overflow-hidden'>
                                            <div className='absolute top-2 right-2 z-10 flex items-center justify-center h-5 px-2 rounded-full border bg-white/90 dark:bg-neutral-900/90 border-red-600/70 shadow-sm'>
                                                <span className='text-[10px] font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wide'>
                                                    {item.file_extension || 'IMG'}
                                                </span>
                                            </div>
                                            {
                                                item.upload_status == 'PENDING' || item.upload_status == 'PROCESSING' || item.upload_status == 'FAILED' ? (
                                                    <ImageProcessing parent='dashboard' />
                                                ) : item.file_url ? (
                                                    <Image 
                                                        src={item.file_url} 
                                                        alt={item.name || 'image'} 
                                                        fill 
                                                        sizes="(max-width: 640px) 112px, 176px"
                                                        className='object-cover group-hover:scale-105 transition-transform duration-300 ease-out' 
                                                    />
                                                ) : (
                                                    <div className='w-full h-full flex items-center justify-center text-neutral-400 text-xs'>No Preview</div>
                                                )
                                            }
                                        </Link>
                                    )
                                }
                                <div className='flex items-center justify-between py-3 px-4 flex-1 min-w-0'>
                                    <div className='flex flex-col min-w-0 pr-4'>
                                        <h1 className='text-sm sm:text-base text-neutral-900 dark:text-neutral-100 font-figtree font-medium truncate' title={item.name}>
                                            {item.name}
                                        </h1>
                                        <span className='text-xs text-neutral-500 dark:text-neutral-400 mt-1'>
                                            {item.file_extension ? `${item.file_extension} • ` : 'Folder • '}
                                            {item.size > 1024 * 1024 ? `${(item.size / (1024 * 1024)).toFixed(2)} GB` : item.size > 1024 ? `${(item.size / 1024).toFixed(2)} MB` : `${item.size || 0} KB`}
                                        </span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className='p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0'>
                                                <IconDotsVertical stroke={2} height={20} width={20} className='text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200' />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800" align="start">
                                            <DropdownMenuLabel className='font-figtree text-neutral-900 dark:text-neutral-100'>Details</DropdownMenuLabel>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem>
                                                    Name
                                                    <DropdownMenuShortcut className='text-blue-600 font-bold truncate max-w-[120px]'>{item.name}</DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Size
                                                    <DropdownMenuShortcut className='text-red-600 font-bold'>
                                                        {item.size > 1024 * 1024 ? `${(item.size / (1024 * 1024)).toFixed(2)} GB` : item.size > 1024 ? `${(item.size / 1024).toFixed(2)} MB` : `${item.size} KB`}
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Type
                                                    <DropdownMenuShortcut className='text-green-600 font-bold'>{item.file_extension ? item.file_extension : "Folder"}</DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                {
                                                    isTrashPage ? null : (
                                                        <DropdownMenuItem onClick={() => HandleFavoriteUpdation(item.id)} className='cursor-pointer'>
                                                            <span>{item.is_favorite ? "Remove From Favorite" : "Add To Favorite"}</span>
                                                            <DropdownMenuShortcut>
                                                                <IconFileStar stroke={2} className='text-neutral-500' />
                                                            </DropdownMenuShortcut>
                                                        </DropdownMenuItem>
                                                    )
                                                }
                                                <DropdownMenuItem onClick={() => HandleTrashUpdation(item.id)} className='cursor-pointer'>
                                                    <span>{isTrashPage ? "Restore From Trash" : "Add To Trash"}</span>
                                                    <DropdownMenuShortcut>
                                                        <IconTrash stroke={2} className='text-neutral-500' />
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <DeleteButton fileFolderID={shareUUID ? undefined : String(item.id)} shareUUID={shareUUID ? shareUUID : undefined} fileFolderHash={isShared ? String(item.id) : undefined} isDropDown={true} />
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    )
}

export default FileFolderCards