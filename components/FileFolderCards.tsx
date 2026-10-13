'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { IconDotsVertical, IconFileStar, IconFolder, IconHeartFilled, IconTrash } from '@tabler/icons-react';
import ImageProcessing from './ImageProcessing';
import Image from 'next/image'; // Add this line
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import FileFolderBadge from './FileFolderBadge';
import DeleteButton from './DeleteButton';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import InfiniteLoader from './InfiniteLoader';
import TrashLoader from './TrashLoader';
import FavoriteLoader from './FavoriteLoader';
import { useAuth } from '@clerk/nextjs'
import { handleFavoriteFileFolderUpdate, handleFileFolderTrashUpdate } from '@/features/FileFoldersSlice';
import { sessionVault } from '@/lib/crypto/session-vault';
import { decryptCollectionKey, fromBase64 } from '@/lib/crypto/keys';
import { restoreSessionKeys } from '@/lib/crypto/sessionPersistance';
import { toast } from 'sonner';
import { FileContentFlow, FileMetaDataFlow } from '@/lib/crypto/workflows/decryptFlowOfFiles';

interface FileFolderProps {
    id: number;
    author: string;
    size: number;
    parentFolder: string | null;
    name: string;
    uploaded_at: Date;
    updated_at: Date;
    isfolder: boolean;
    encrypted_collection_key?: string; //this key exists only if the returned record is folder.
    collection_key_nonce?: string

    encrypted_file_key?: string,
    file_key_nonce?: string,
    file_metadata_key_nonce?: string,
    encryption_header?: string,

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
    resolveParentKeys?: boolean;
}

interface FileMetadata {
    name: string;
    fileType: string;
    description: string;
    contentURL: string | null

}



function FileFolderCards({ folderFileData, isGridLayout, isTrashPage, isFavoritePage, isShared, shareUUID, resolveParentKeys }: Props) {
    const { isSignedIn, user, isLoaded } = useUser();
    const { getToken } = useAuth()
    const { isTrashLoading, specificRecordID, isFavoriteLoading } = useAppSelector((state) => state.fileFolders)
    const dispatch = useAppDispatch()
    const [decryptedMetadata, setDecryptedMetadata] = useState<Record<number, Partial<FileMetadata>>>({})
    const resolvedParentIDs = useRef(new Set<string>())


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

    const HandleDecryptMetadata = async (id: string, fileMetaData: string, fileKey: string, nonce: string, fileMetadataNonce: string): Promise<FileMetadata | null> => {
        const metadata = await FileMetaDataFlow(id,
            fileMetaData,
            fileKey,
            nonce,
            fileMetadataNonce)

        if (!metadata) {
            toast.error("some error occured with the crypto handling, Login Again")
            return null
        }

        return metadata as FileMetadata
    }

    const HandleDecryptContent = async (parentID: string, fileURL: string, streamHeader: string, fileKey: string, nonce: string,): Promise<string | null> => {
        const content = await FileContentFlow(parentID, fileURL, streamHeader, fileKey, nonce)

        if (!content) {
            toast.error("some error occured with the crypto handling, Login Again")
            return null
        }

        const response = new Response(content.decryptedStream);

        // 2. Consume the response body as a Blob
        const blob = await response.blob();

        // 3. Create an object URL from the blob
        const blobUrl = URL.createObjectURL(blob);

        return blobUrl;
    }

    const HandleResolveParentKey = async (parentID: string, jwtToken: string) => {
        if (sessionVault.hasCollectionKey(parentID) && !resolveParentKeys) {
            return
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders/Single?fileFolderID=${parentID}`, {
            headers: { authorization: `Bearer ${jwtToken}` },
            withCredentials: true,
        })
        const parentFolder = response.data?.data
        const encryptedCollectionKey = parentFolder?.encrypted_collection_key
        const collectionKeyNonce = parentFolder?.collection_key_nonce || parentFolder?.encrypted_collection_key_nonce

        if (!encryptedCollectionKey || !collectionKeyNonce) {
            throw new Error(`Collection key is missing for parent folder ${parentID}`)
        }

        if (!sessionVault.getMasterKey()) {
            await restoreSessionKeys()
        }

        const masterKey = sessionVault.getMasterKey()
        if (!masterKey) {
            throw new Error('Master key is unavailable; please sign in again')
        }

        const encryptedKeyBytes = await fromBase64(encryptedCollectionKey)
        const nonceBytes = await fromBase64(collectionKeyNonce)
        if (!encryptedKeyBytes || !nonceBytes) {
            throw new Error(`Collection key data is invalid for parent folder ${parentID}`)
        }

        const collectionKey = await decryptCollectionKey(encryptedKeyBytes, nonceBytes, masterKey)
        if (!collectionKey) {
            throw new Error(`Could not decrypt collection key for parent folder ${parentID}`)
        }

        sessionVault.setCollectionKey(parentID, collectionKey)
    }

    useEffect(() => {
        let isActive = true
        const objectUrls: string[] = []

        const decryptItems = async () => {
            const parentIDs = [...new Set(folderFileData
                .filter((item) => !item.isfolder && item.parentFolder && item.encrypted_file_key)
                .map((item) => String(item.parentFolder))
                .filter((parentID) => resolveParentKeys
                    ? !resolvedParentIDs.current.has(parentID)
                    : !sessionVault.hasCollectionKey(parentID)))]

            if (parentIDs.length > 0 && !isShared) {
                const jwtToken = await getToken()
                if (!jwtToken) {
                    throw new Error('Authentication token is unavailable')
                }

                const keyResults = await Promise.allSettled(
                    parentIDs.map((parentID) => HandleResolveParentKey(parentID, jwtToken))
                )
                keyResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        resolvedParentIDs.current.add(parentIDs[index])
                    }
                })
                const failedKeys = keyResults.filter((result) => result.status === 'rejected')
                if (failedKeys.length > 0) {
                    failedKeys.forEach((result) => {
                        if (result.status === 'rejected') {
                            console.error('Failed to resolve image parent collection key:', result.reason)
                        }
                    })
                    toast.error('Could not load encryption keys for some image previews.')
                }
            }

            // here promise.all() is called instead of direct items.map() function just because we are to perform async function within the looped items, so since looped items calls a fucntion usinf await we are uisng promise.all
            const results = await Promise.all(folderFileData.map(async (item) => {
                if (item.isfolder || !item.encrypted_file_key || !item.file_key_nonce || !item.file_metadata_key_nonce) {
                    return null
                }

                if (!isShared && item.parentFolder && !sessionVault.hasCollectionKey(String(item.parentFolder))) {
                    return null
                }

                const metadata = item.name && item.parentFolder   // metadata and file keys are encrypted with their parent folder's collection key.
                    ? await HandleDecryptMetadata(String(item.parentFolder), item.name, item.encrypted_file_key, item.file_key_nonce, item.file_metadata_key_nonce)
                    : null


                const fileContentUrl = item.file_url && item.encryption_header
                    ? item.name && item.parentFolder
                        ? await HandleDecryptContent(String(item.parentFolder), item.file_url, item.encryption_header, item.encrypted_file_key, item.file_key_nonce)
                        : null
                    : null

                if (fileContentUrl) {
                    objectUrls.push(fileContentUrl)
                }

                const enrichedMetadata = metadata
                    ? { ...metadata, contentURL: fileContentUrl ?? metadata.contentURL }
                    : metadata

                return { id: item.id, metadata: enrichedMetadata }
            }))

            if (isActive) {
                setDecryptedMetadata((current) => {
                    const next = { ...current }
                    results.forEach((result) => {
                        if (result?.metadata) next[result.id] = result.metadata
                    })
                    return next
                })
            } else {
                objectUrls.forEach((url) => URL.revokeObjectURL(url))
            }
        }

        void decryptItems().catch((error) => {
            console.error('Failed to decrypt file previews:', error)
            toast.error('Unable to load encrypted file previews.')
        })
        return () => {
            isActive = false
            objectUrls.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [folderFileData])

    const getDisplayName = (item: FileFolderProps) => decryptedMetadata[item.id]?.name || item.name
    const getDisplayExtension = (item: FileFolderProps) => decryptedMetadata[item.id]?.fileType || item.file_extension
    const getDisplayImage = (item: FileFolderProps) => {
        const decryptedImage = decryptedMetadata[item.id]?.contentURL
        if (decryptedImage) return decryptedImage
        return item.encrypted_file_key ? null : item.file_url
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
                                        <Link href={isShared ? `/sharable/folder/${shareUUID}/${item.id}` : `/dashboard/${item.id}`} className='block w-full' onClick={() => {
                                            console.log(item.encrypted_collection_key, item.collection_key_nonce)
                                            localStorage.setItem('CURRENT_FOLDER_ENCRYPTED', item.encrypted_collection_key || '');
                                            localStorage.setItem('CURRENT_FOLDER_ENCRYPTED_NONCE', item.collection_key_nonce || '');
                                        }}>
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
                                                                {getDisplayExtension(item) || 'IMG'}
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
                                                    ) : getDisplayImage(item) ? (
                                                        <Image
                                                            src={getDisplayImage(item) || ''}
                                                            alt={getDisplayName(item) || 'image'}
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
                                        <h1 className='text-sm text-neutral-900 dark:text-neutral-100 font-figtree font-medium truncate' title={getDisplayName(item)}>
                                            {getDisplayName(item)}
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
                                                        <DropdownMenuShortcut className='text-blue-600 font-bold truncate max-w-[120px]'>{getDisplayName(item)}</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Size
                                                        <DropdownMenuShortcut className='text-red-600 font-bold'>
                                                            {item.size > 1024 * 1024 ? `${(item.size / (1024 * 1024)).toFixed(2)} gb` : item.size > 1024 ? `${(item.size / 1024).toFixed(2)} mb` : `${item.size} kb`}
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Type
                                                        <DropdownMenuShortcut className='text-green-600 font-bold'>{getDisplayExtension(item) ? getDisplayExtension(item) : "Folder"}</DropdownMenuShortcut>
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
                                                    {getDisplayExtension(item) || 'IMG'}
                                                </span>
                                            </div>
                                            {
                                                item.upload_status == 'PENDING' || item.upload_status == 'PROCESSING' || item.upload_status == 'FAILED' ? (
                                                    <ImageProcessing parent='dashboard' />
                                                ) : getDisplayImage(item) ? (
                                                    <Image
                                                    src={getDisplayImage(item) || ''}
                                                        alt={getDisplayName(item) || 'image'}
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
                                        <h1 className='text-sm sm:text-base text-neutral-900 dark:text-neutral-100 font-figtree font-medium truncate' title={getDisplayName(item)}>
                                            {getDisplayName(item)}
                                        </h1>
                                        <span className='text-xs text-neutral-500 dark:text-neutral-400 mt-1'>
                                            {getDisplayExtension(item) ? `${getDisplayExtension(item)} • ` : 'Folder • '}
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
                                                    <DropdownMenuShortcut className='text-blue-600 font-bold truncate max-w-[120px]'>{getDisplayName(item)}</DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Size
                                                    <DropdownMenuShortcut className='text-red-600 font-bold'>
                                                        {item.size > 1024 * 1024 ? `${(item.size / (1024 * 1024)).toFixed(2)} GB` : item.size > 1024 ? `${(item.size / 1024).toFixed(2)} MB` : `${item.size} KB`}
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Type
                                                    <DropdownMenuShortcut className='text-green-600 font-bold'>{getDisplayExtension(item) ? getDisplayExtension(item) : "Folder"}</DropdownMenuShortcut>
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