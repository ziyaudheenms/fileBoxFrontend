"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { IconAdjustmentsAlt, IconClock, IconFolder, IconHome, IconLayoutGridRemove, IconList, IconPdf, IconPencil, IconPictureInPictureFilled, IconTextSize, IconVideo, } from '@tabler/icons-react'
import { SearchIcon } from 'lucide-react'
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
import { getAllFileFolders } from '@/features/FileFoldersSlice'

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
  const [FileFolderData, setFileFolderData] = useState<FileFolderProps[]>([])
  const [loading, setLoading] = useState(false)
  const [getREQUEST, setGETREQUEST] = useState(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders`)
  const [hasData, setHasData] = useState(false)
  const [empty, setEmpty] = useState(false)
  const [storageDetails, setStorageDetails] = useState<StorageStatusProps>({} as StorageStatusProps)
  const [cursorParam , setCursorParam] = useState<String | null>(null)

  
  const {data , isLoading , isempty, error } = useAppSelector((state) => state.fileFolders)
  const dispatch = useAppDispatch()


  const getTheCurrentUrlParam = (url:string , param_key:string) => {
    const url_constructed = new URL(url)
    const params = new URLSearchParams(url_constructed.search);
    setCursorParam(params.get(param_key));
  }

  // Used For getting all the folder/file data from the backend
  // const HandleGetAllFileFolderData = async () => {
  //   setHasData(false)
  //   setLoading(true)
  //   getTheCurrentUrlParam(getREQUEST , "cursor")
  //   const jwtToken = await getToken()
  //   localStorage.setItem("refreshToken", jwtToken || "")
  //   console.log(jwtToken)

  //   // GET Request that is used to fetch all the folder/file data
  //   axios
  //     .get(getREQUEST, {
  //       headers: {
  //         authorization: `Bearer ${jwtToken}`,
  //       },
  //     })
  //     .then((res) => {
  //       console.log(res.data.status_code)
  //       if (res.data.status_code === 5002) {
  //         setEmpty(true)
  //       }
  //       else if (res.data.status_code === 5000) {
  //         console.log(res)
  //         setFileFolderData((prev) => {
  //           const newData = res.data.data;
  //           // Filter out items in newData that are already present in prev
  //           const uniqueNewItems = newData.filter(newItem =>
  //             !prev.some(prevItem => prevItem.id === newItem.id)
  //           );
  //           return [...prev, ...uniqueNewItems]
  //         }) // used this expression to append new data to existing state array
  //       }
  //       if (res.data.message.next_cursor != null) {
  //         setGETREQUEST(res.data.message.next_cursor)
  //         setHasData(true)
  //       } else {
  //         setHasData(false)
  //       }


  //       // Reguest for accessing the storage status.
  //     })
  //     .catch((err) => { }
  //     )
  //     .finally(() => {
  //       setLoading(false)
  //     })

  // }

  // Updating the existing file/folder data based on trash updation , also favorite updation can be handled here
  const GetUpdatedFileFolderData = async () => {
    setHasData(false)
    setLoading(true)
    const jwtToken = await getToken()
    console.log(jwtToken , "from update function")

    // GET Request that is used to fetch all the folder/file data
    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders`, {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((res) => {
        console.log(res.data.status_code)
        if (res.data.status_code === 5002) {
          setEmpty(true)
        }
        else if (res.data.status_code === 5000) {
          console.log(res.data.data)
          setFileFolderData(res.data.data)
        }
        if (res.data.message.next_cursor != null) {
          setGETREQUEST(res.data.message.next_cursor)
          setHasData(true)
        } else {
          setHasData(false)
        }
      })
      .catch((err) => { }
      )
      .finally(() => {
        setLoading(false)
      })

  }

  const HandleTrashUpdation = async (fileFolderID: number) => {
    const jwtToken = await getToken()
  
    // Check if fileFolderID is in the first 12 FileFolderData
    const isInFirst12 = FileFolderData.slice(0, 12).some(item => item.id === fileFolderID);

    if (jwtToken) {
      axios
        .get(isInFirst12 ? `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/trash/FolderFile/?folderFileID=${fileFolderID}&cursor=None` : `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/trash/FolderFile/?folderFileID=${fileFolderID}&cursor=${cursorParam}` , {
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((res) => {-
          console.log(res.data)
          if (res.data.status_code === 5000) {
            toast.success("Item moved to Trash.")
            GetUpdatedFileFolderData()
          }
          else if (res.data.status_code === 5002) {
            toast.error("Xant Delete item. Move to Trash failed.")
          }
        })
        .catch((err) => {
          console.log(err)

        })
    }
  }

  const HandleFavoriteUpdation = async (fileFolderID: number) => {
    const jwtToken = await getToken()
    console.log(jwtToken)
    if (jwtToken) {
      axios
        .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/favorite/FolderFile/?folderFileID=${fileFolderID}`, {
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((res) => {
          console.log(res.data)
          if (res.data.status_code === 5000) {
            toast.success("Item added to Favorite.")
            // GetUpdatedFileFolderData()
          }
          else if (res.data.status_code === 5002) {
            toast.error("Marking Favorite failed.")
          }
        })
        .catch((err) => {
          console.log(err)

        })
    }
  }

  const getFileFolders = async () => {
    const jwtToken = await getToken()
    dispatch(getAllFileFolders({
      requesturl: getREQUEST,
      jwtToken :  jwtToken ? jwtToken : "",
    }))
  }

  useEffect(() => {
    getFileFolders()
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
            <span className='text-xs font-sans text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg'>{FileFolderData.length}</span>
          </div>

          {/* GRID LAYOUT FOR LISTING THE FOLDER/FILES */}
          <FileFolderCards folderFileData={data} isGridLayout={gridLayout} onHandleFavoriteUpdation={HandleFavoriteUpdation} onHandleTrashUpdation={HandleTrashUpdation} isTrashPage={false} isFavoritePage={false} />
          {empty ? (<EmptyPage />) : (<div></div>)}

          <div className='w-full flex items-center justify-center'>
            {
              hasData ? (
                <Button className='font-light' onClick={() => {
                  
                }}>Load More...</Button>
              ) : (
                <div></div>
              )
            }
          </div>

          {
            loading ? (
              <InfiniteLoader />
            ) : (
              <div></div>
            )
          }

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