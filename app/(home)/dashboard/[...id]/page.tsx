"use client"
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { IconAdjustmentsAlt, IconHome, IconLayoutGridRemove, IconList} from '@tabler/icons-react'
import { SearchIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import CreateFolder from '@/components/CreateFolder'
import { useParams } from 'next/navigation';
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
import MoveOrCopyCard from '@/components/MoveOrCopyCard'
import UpdateMetaData from '@/components/UpdateMetaData'
import SearchBar from '@/components/SearchBar'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { getAllFileFolders, handleFavoriteFileFolderUpdate, handleFileFolderTrashUpdate } from '@/features/FileFoldersSlice'
import Password from '@/components/Password'
import Settings from '@/components/Settings'
import { useRouter } from 'next/navigation'
interface BreadCrumProps {folderName: string; folderID: string;}

function page() {
    const { getToken } = useAuth()
    const [gridLayout, setgridLayout] = useState(true)
    const [getREQUEST, setGETREQUEST] = useState<string>('http://localhost:8000/api/v1/fileFolders')
    const params = useParams();
    const { data, isLoading, error, message , breadCrumbs , sessionStatus} = useAppSelector((state) => state.fileFolders)
    const dispatch = useAppDispatch()
    const router = useRouter()


    const getFileFolders = async (cursor: string | null, samePage: boolean) => {
        const jwtToken = await getToken()
        dispatch(getAllFileFolders({
            requesturl: cursor ? cursor : `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders?parentFolderID=${params.id ? params.id[params.id.length - 1] as string : undefined}`,
            jwtToken: jwtToken ? jwtToken : "",
            samePage: samePage
        }))
    }

    useEffect(() => {
        getFileFolders(null, false)
    }, [])


    useEffect(() => {
        if (sessionStatus?.code === 5003 || sessionStatus?.code === 4002 || sessionStatus?.code === 4005) {
            toast.error("Session expired. Please enter password again.")
            router.push(`/password/${params.id ? params.id[params.id.length - 1] as string : undefined}`)
        }
       
    } , [sessionStatus])

    
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
                                    breadCrumbs.map((bread: BreadCrumProps) => {
                                        return (
                                            <div key={`${bread.folderID}-separator`} className='flex items-center gap-1'>
                                                <BreadcrumbSeparator className='text-lg' />
                                                <BreadcrumbItem >
                                                    <BreadcrumbLink href={`/dashboard/${bread.folderID}`}>
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
                        <span className='text-xs font-sans text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg'>{data.length}</span>
                    </div>

                    {/* GRID LAYOUT FOR LISTING THE FOLDER/FILES */}

                    <FileFolderCards folderFileData={data} isFavoritePage={false} isGridLayout={gridLayout} isTrashPage={false}  />

                    {
                        !isLoading && data.length < 1 ? (
                            <EmptyPage />
                        ) : (
                            <div></div>
                        )
                    }

                    <div className='w-full flex items-center justify-center'>
                        {
                            message.next_cursor ? (
                                <Button className='font-light' onClick={() => {
                                    getFileFolders(`${message.next_cursor}&parentFolderID=${params.id ? params.id[params.id.length - 1] as string : undefined}`, true)
                                }}>Load More...</Button>
                            ) : (
                                <div></div>
                            )
                        }
                    </div>

                    {
                        isLoading ? (
                            <InfiniteLoader />
                        ) : (
                            <div></div>
                        )
                    }
                </div>
                {/* ADDITIONAL DETAILS RIGHT SECTION ALONG WITH UPLOAD OPTIONS */}

                <div className='w-[27%] px-2 py-2 flex flex-col gap-3 h-screen overflow-y-scroll no-scrollbar'>
                    {/*UPLOAD OPTIONS */}
                    <SearchBar scope={params.id ? params.id[params.id.length - 1] as string : undefined} />
                    <FileUpload isRoot={true} folderID={params.id ? params.id[params.id.length - 1] as string : undefined} />
                    <CreateFolder isRoot={false} folderID={params.id ? params.id[params.id.length - 1] as string : undefined} />
                    <ShareCard fileFolderID={params.id ? parseInt(params.id[params.id.length - 1] as string) : 0} type={'folder'} isShared={false} isOwner={true} />
                    <MoveOrCopyCard sourceID={params.id ? params.id[params.id.length - 1] as string : ""} type={'folder'} isShared={false} />
                    <UpdateMetaData fileID={params.id ? params.id[params.id.length - 1] as string : undefined} type='folder' />
                    <Settings fileFolderID={params.id ? params.id[params.id.length - 1] as string : undefined}/>  // passing the parentFolderID
                </div>
            </div>
        </div>
    )
}

export default page