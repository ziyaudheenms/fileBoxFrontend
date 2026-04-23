"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { IconAdjustmentsAlt, IconClock, IconFolder, IconHome, IconLayoutGridRemove, IconList, IconPdf, IconPencil, IconPictureInPictureFilled, IconTextSize, IconVideo, } from '@tabler/icons-react'
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
      <div className='px-2 flex'>
        {/* MAIN SECTION THAT LISTS ALL THE FOLDER/FILES THAT EXISTS */}
        <div className='w-[73%] px-2 py-2 h-screen overflow-y-scroll no-scrollbar'>
          <div className='w-full flex items-center justify-between '>
            <div className='flex  gap-1'>
              <IconHome stroke={2} height={20} width={20} className='text-neutral-100' />
              <h4 className='text-neutral-100 font-sans'>Home</h4>
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

              <div className='border border-neutral-400 p-2 rounded-lg'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconAdjustmentsAlt stroke={2} height={20} width={20} className='text-neutral-100' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-neutral-950 text-neutral-400 border border-neutral-800" align="start">
                    <DropdownMenuLabel className='font-figtree text-neutral-100 text-lg'>Filters & Sort</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconPencil stroke={2} className='text-neutral-500' />
                        Name
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconClock stroke={2} className='text-neutral-500' />
                        Date Modified
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconTextSize stroke={2} className='text-neutral-500' />
                        File Size
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconFolder stroke={2} className='text-red-800' />
                        Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconPictureInPictureFilled stroke={2} className='text-blue-800' />
                        Images
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconPdf stroke={2} className='text-yellow-400' />
                        Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-neutral-100'>
                        <IconVideo stroke={2} className='text-green-400' />
                        Video
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className='w-full flex items-center gap-2'>
            <h3 className='font-sans text-neutral-100 text-sm'>All Items</h3>
            {/* <span className='text-xs font-sans text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg'>{FileFolderData.length}</span> */}
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

          <div className='w-full flex items-center justify-center'>
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
        {/* ADDITIONAL DETAILS RIGHT SECTION ALONG WITH UPLOAD OPTIONS */}
        <div className='w-[27%] px-2 py-2 flex flex-col gap-3 h-screen overflow-y-scroll no-scrollbar'>
          <SearchBar />

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