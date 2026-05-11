"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { IconAdjustmentsAlt, IconClock, IconFolder, IconHome, IconLayoutGridRemove, IconList, IconPdf, IconPencil, IconPictureInPictureFilled, IconTextSize, IconVideo, IconTools, IconX } from '@tabler/icons-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import FileUpload from '@/components/FileUpload'
import CreateFolder from '@/components/CreateFolder'
import InfiniteLoader from '@/components/InfiniteLoader'
import { toast } from 'sonner'
import { EmptyPage } from '@/components/EmptyPage'
import FileFolderCards from '@/components/FileFolderCards'
import RecentUploads from '@/components/RecentUploads'
import StorageUpdate from '@/components/StorageUpdate'
import SearchBar from '@/components/SearchBar'
import { useAppDispatch , useAppSelector } from '@/lib/redux/hooks'
import { getAllFileFolders, handleFavoriteFileFolderUpdate, handleFileFolderTrashUpdate } from '@/features/FileFoldersSlice'

interface StorageStatusProps {
  id: number;
  author: string;
  clerk_user_storage_limit: string;
  clerk_user_used_storage: string;
  total_document_storage: string;
  total_image_storage: string;
  total_other_storage: string;
  storage_percentage_used: number;
}

function page() {
  const { getToken } = useAuth() 
  const [gridLayout, setgridLayout] = useState(true)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [getREQUEST, setGETREQUEST] = useState(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders`)
  const [storageDetails, setStorageDetails] = useState<StorageStatusProps>({} as StorageStatusProps)
  const {data , isLoading , error , message } = useAppSelector((state) => state.fileFolders)
  const dispatch = useAppDispatch()

  const getFileFolders = async (cursor:string | null , samePage : boolean) => {  
    const jwtToken = await getToken()
    dispatch(getAllFileFolders({
      requesturl: cursor ? cursor : getREQUEST,
      jwtToken :  jwtToken ? jwtToken : "",
      samePage : samePage    }))
  }

  useEffect(() => {
    getFileFolders(null , false)
  }, [])

  return (
    <div>
      <Navbar />
      <div className='px-2 flex flex-col lg:flex-row pb-6 lg:pb-0'>
        {/* MAIN SECTION THAT LISTS ALL THE FOLDER/FILES THAT EXISTS */}
        <div className='w-full lg:w-[73%] xl:w-[75%] px-2 py-2 h-auto lg:h-screen lg:overflow-y-scroll no-scrollbar'>
          <div className='w-full flex items-center justify-between mb-4'>
            <div className='flex items-center gap-1'>
              <IconHome stroke={2} height={20} width={20} className='text-neutral-900 dark:text-neutral-100' />
              <h4 className='text-neutral-900 dark:text-neutral-100 font-sans font-medium'>Home</h4>
            </div>
            <div className='flex items-center gap-2'>

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

              <div className='border border-neutral-300 dark:border-neutral-800 p-2 rounded-lg bg-white dark:bg-neutral-950'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconAdjustmentsAlt stroke={2} height={20} width={20} className='text-neutral-600 dark:text-neutral-400 cursor-pointer' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 shadow-xl" align="end">
                    <DropdownMenuLabel className='font-figtree text-neutral-900 dark:text-neutral-100 text-lg'>Filters & Sort</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconPencil stroke={2} className='text-neutral-500' />
                        Name
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconClock stroke={2} className='text-neutral-500' />
                        Date Modified
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconTextSize stroke={2} className='text-neutral-500' />
                        File Size
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconFolder stroke={2} className='text-red-600 dark:text-red-500' />
                        Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconPictureInPictureFilled stroke={2} className='text-blue-600 dark:text-blue-500' />
                        Images
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconPdf stroke={2} className='text-yellow-600 dark:text-yellow-500' />
                        Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer'>
                        <IconVideo stroke={2} className='text-green-600 dark:text-green-500' />
                        Video
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className='w-full flex items-center gap-2 mb-4'>
            <h3 className='font-sans text-neutral-900 dark:text-neutral-100 text-sm font-medium'>All Items</h3>
          </div>

          {/* GRID LAYOUT FOR LISTING THE FOLDER/FILES */}
          <FileFolderCards folderFileData={data} isGridLayout={gridLayout}  isTrashPage={false} isFavoritePage={false} />
          
          {
            isLoading ? (
              <InfiniteLoader />
            ) : (
              <div></div>
            )
          }
          
          {data.length < 1 && !isLoading ? (<EmptyPage />) : (<div></div>)}

          <div className='w-full flex items-center justify-center mt-6'>
            {
              message.next_cursor ? (
                <Button className='font-light' onClick={() => {
                  getFileFolders(message.next_cursor , true)
                }}>Load More...</Button>
              ) : (
                <div></div>
              )
            }
          </div>

        </div>

        {/* MOBILE OVERLAY */}
        {isToolsOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[60] transition-opacity duration-300" 
            onClick={() => setIsToolsOpen(false)} 
          />
        )}

        {/* MOBILE FAB TO OPEN TOOLS */}
        <div className="lg:hidden fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[50]">
          <Button 
            className="rounded-full shadow-lg h-[3.5rem] w-[3.5rem] bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:text-white dark:hover:bg-red-700 transition-all flex items-center justify-center p-0" 
            onClick={() => setIsToolsOpen(true)}
          >
            <IconTools stroke={2} size={26} />
          </Button>
        </div>

        <div className={`
          fixed inset-y-0 right-0 z-[70] w-[85%] max-w-sm bg-white dark:bg-neutral-950 px-4 py-6 shadow-2xl transition-transform duration-300 transform overflow-y-auto no-scrollbar rounded-l-3xl lg:rounded-none
          ${isToolsOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:translate-x-0 lg:w-[27%] xl:w-[25%] lg:px-2 lg:py-2 flex flex-col gap-4 lg:h-screen lg:overflow-y-scroll lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:border-none
        `}>
          <div className="flex lg:hidden justify-between items-center mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <h3 className="font-figtree font-extrabold text-neutral-900 dark:text-neutral-100 text-xl tracking-tight">Toolkit</h3>
            <button onClick={() => setIsToolsOpen(false)} className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <IconX stroke={2} />
            </button>
          </div>

          <SearchBar closeToolsDrawer={() => setIsToolsOpen(false)} />

          {/*CREATE FOLDER */}
          <CreateFolder isRoot={true} />
          {/*UPLOAD OPTIONS */}
          <FileUpload isRoot={false} />
          {/* STORAGR STATUS*/}
          <StorageUpdate />
          {/* RECENT UPLOADS SECTION */}
          <RecentUploads />

        </div>
      </div>
    </div>
  )
}

export default page