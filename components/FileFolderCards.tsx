'use client'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { IconDotsVertical, IconFileStar, IconFolder, IconTrash } from '@tabler/icons-react';
import ImageProcessing from './ImageProcessing';
import Image from 'next/image'; // Add this line

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

interface Props {
    folderFileData: FileFolderProps[];
    isGridLayout: boolean;
    onHandleTrashUpdation: (fileFolderID: number) => void;
    onHandleFavoriteUpdation: (fileFolderID: number) => void;
    isTrashPage: boolean;
    isFavoritePage: boolean;
}

function FileFolderCards({ folderFileData, isGridLayout, onHandleTrashUpdation, onHandleFavoriteUpdation, isTrashPage, isFavoritePage }: Props) {
    return (
        <div>
            {
                isGridLayout ? (
                    <div className="grid grid-cols-4 gap-4 py-5 ">
                        {folderFileData.map((item) => (
                            <div key={item.id} className='border border-neutral-800 rounded-lg hover:border-neutral-700 '>
                                {
                                    item.isfolder ? (
                                        <Link href={`/dashboard/${item.id}`}>
                                            <div className='h-40 bg-zinc-900 flex items-center justify-center rounded-tl-lg rounded-tr-lg '>
                                                <IconFolder stroke={2} height={90} width={90} className='text-neutral-400' />
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link href={`http://localhost:3000/images/${item.id}`} >
                                            <div className={`h-40 bg-zinc-900 flex items-center justify-center rounded-tl-lg rounded-tr-lg bg-[url(${item.file_url})] bg-center bg-no-repeat bg-cover overflow-hidden`}>
                                                {
                                                    item.upload_status == 'PENDING' || item.upload_status == 'PROCESSING' || item.upload_status == 'FAILED' ? (
                                                        <ImageProcessing parent='dashboard' />
                                                    ) : (
                                                        <Image src={item.file_url ? item.file_url : ''} alt={item.name} width={100} height={100} className='w-full' />

                                                    )
                                                }
                                            </div>
                                        </Link>
                                    )
                                }
                                <div className='flex flex-col pt-2 px-2'>
                                    <div className='flex items-center justify-between pb-2'>
                                        <h1 className='text-md text-neutral-100 font-figtree font-medium'>{item.name.length > 30 ? item.name.slice(0, 30) : item.name} {item.name.length > 30 ? ("...") : (" ")}</h1>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <IconDotsVertical stroke={2} height={20} width={20} className='text-neutral-400 hover:text-neutral-400' />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-neutral-950 text-neutral-400 border border-neutral-800" align="start">
                                                <DropdownMenuLabel className='font-figtree text-neutral-100'>Details</DropdownMenuLabel>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        Name
                                                        <DropdownMenuShortcut className='text-blue-600 font-bold'>{item.name.length > 10 ? item.name.slice(0, 10) : item.name} {item.name.length > 10 ? ("...") : (" ")}</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Size
                                                        <DropdownMenuShortcut className='text-red-600 font-bold'>{item.size > 1024 ? `${(item.size / 1024).toFixed(2)} mb` : `${item.size} kb`}</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Type
                                                        <DropdownMenuShortcut className='text-green-600 font-bold'>{item.file_extension ? item.file_extension : "Folder"}</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    {
                                                        isTrashPage ? (
                                                            <div></div>
                                                        ) : (
                                                            <DropdownMenuItem>
                                                                <h1 onClick={() => onHandleFavoriteUpdation(item.id)}>
                                                                    {item.is_favorite ? ("Remove From Favorite") : ("Add To Favorite")}
                                                                </h1>
                                                                <DropdownMenuShortcut>
                                                                    <IconFileStar stroke={2} className='text-neutral-500' />
                                                                </DropdownMenuShortcut>
                                                            </DropdownMenuItem>
                                                        )
                                                    }
                                                    <DropdownMenuItem>
                                                        <h1 onClick={() => onHandleTrashUpdation(item.id)}>
                                                            {
                                                                isTrashPage ? ("Restore From Trash") : ("Add To Trash")
                                                            }
                                                        </h1>
                                                        <DropdownMenuShortcut>
                                                            <IconTrash stroke={2} className='text-neutral-500' />
                                                        </DropdownMenuShortcut>
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
                    <div className="flex flex-col gap-4 py-5">
                        {folderFileData.map((item) => (
                            <div key={item.id} className='border border-neutral-800 rounded-xl hover:border-neutral-700  flex items-center w-full'>
                                {
                                    item.isfolder ? (
                                        <div className='w-[30%] h-44 bg-zinc-900 flex items-center justify-center rounded-tl-xl rounded-bl-xl '>
                                            <Link href={`/dashboard/${item.id}`}>

                                                <IconFolder stroke={2} height={90} width={90} className='text-neutral-400' />
                                            </Link>

                                        </div>
                                    ) : (
                                        <Link href={`http://localhost:3000/images/1`} className='w-[30%] h-44'>
                                            <div className={`w-full h-44 bg-zinc-900 flex items-center justify-center rounded-tl-xl rounded-bl-xl bg-[url(${item?.file_url})] bg-center bg-no-repeat bg-cover overflow-hidden`}>
                                                <Image src={item.file_url ? item.file_url : ''} alt={item.name} width={100} height={100} className='w-full' />
                                            </div>
                                        </Link>


                                    )
                                }
                                <div className='flex flex-col py-2 px-2 w-[70%]'>
                                    <div className='flex items-center justify-between'>
                                        <h1 className='text-lg text-neutral-100 font-figtree font-medium'>{item.name}</h1>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <IconDotsVertical stroke={2} height={20} width={20} className='text-neutral-400 hover:text-neutral-400' />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-neutral-950 text-neutral-400 border border-neutral-800" align="start">
                                                <DropdownMenuLabel className='font-figtree text-neutral-100'>Details</DropdownMenuLabel>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        Name
                                                        <DropdownMenuShortcut className='text-blue-600 font-bold'>Untited File</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Size
                                                        <DropdownMenuShortcut className='text-red-600 font-bold'>100kb</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Type
                                                        <DropdownMenuShortcut className='text-green-600 font-bold'>image/jpeg</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    {
                                                        isTrashPage ? (
                                                            <div></div>
                                                        ) : (
                                                            <DropdownMenuItem>
                                                                <h1 onClick={() => onHandleFavoriteUpdation(item.id)}>
                                                                    {item.is_favorite ? ("Remove From Favorite") : ("Add To Favorite")}
                                                                </h1>
                                                                <DropdownMenuShortcut>
                                                                    <IconFileStar stroke={2} className='text-neutral-500' />
                                                                </DropdownMenuShortcut>
                                                            </DropdownMenuItem>
                                                        )
                                                    }
                                                    <DropdownMenuItem>
                                                        <h1 onClick={() => onHandleTrashUpdation(item.id)}>
                                                            {
                                                                isTrashPage ? ("Restore From Trash") : ("Add To Trash")
                                                            }
                                                        </h1>
                                                        <DropdownMenuShortcut>
                                                            <IconTrash stroke={2} className='text-neutral-500' />
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>

                                            </DropdownMenuContent>  
                                        </DropdownMenu>
                                    </div>
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