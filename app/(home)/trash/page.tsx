"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { IconAdjustmentsAlt, IconClock, IconFolder, IconHome, IconLayoutGridRemove, IconList, IconPdf, IconPencil, IconPictureInPictureFilled, IconTextSize, IconVideo, } from '@tabler/icons-react'
import { SearchIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from '@clerk/nextjs'
import InfiniteLoader from '@/components/InfiniteLoader'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { EmptyPage } from '@/components/EmptyPage'
import FileFolderCards from '@/components/FileFolderCards'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { getAllFileFolders, handleFileFolderTrashUpdate } from '@/features/FileFoldersSlice'

function page() {
  const { getToken } = useAuth() // Clerk authentication hook to get JWT token
  const [gridLayout, setgridLayout] = useState(true)
  const [getREQUEST, setGETREQUEST] = useState(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders/Trash`)
  const dispatch = useAppDispatch()
  const { data, isLoading, error, message } = useAppSelector((state) => state.fileFolders)

  const getFileFolders = async (cursor: string | null, samePage: boolean) => {
    const jwtToken = await getToken()
    dispatch(getAllFileFolders({
      requesturl: cursor ? cursor : getREQUEST,
      jwtToken: jwtToken ? jwtToken : "",
      samePage: samePage,
    }))
  }

  useEffect(() => {
    getFileFolders(null, false)
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
            <span className='text-xs font-sans text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg'>{data.length}</span>
          </div>

          {/* GRID LAYOUT FOR LISTING THE FOLDER/FILES */}

          <FileFolderCards folderFileData={data} isGridLayout={gridLayout}  isTrashPage={true} isFavoritePage={false} />

          {
            data.length < 1 && !isLoading ? (
              <EmptyPage />
            ) : (
              <div></div>
            )
          }

          <div className='w-full flex items-center justify-center'>
            {
              message.next_cursor ? (
                <Button className='font-light' onClick={() => {
                  getFileFolders(message.next_cursor, true)
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

      </div>
    </div>
  )
}

export default page