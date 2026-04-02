'use client'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { IconAlignRight, IconArrowRight, IconCheckbox, IconChecks, IconCopy, IconCopyX, IconCross, IconDashboardFilled, IconEdit, IconFile, IconFocusAuto, IconFolder, IconGlobe, IconGlobeFilled, IconHome, IconLink, IconLoader, IconLock, IconLockAccess, IconMathGreater, IconRowRemove, IconShare, IconSlash, IconSquareCheck } from '@tabler/icons-react'
import InfiniteLoader from './InfiniteLoader'
import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'


interface BreadCrumProps {
    folderName: string;
    folderID: string;
}

interface fileFolderTree {
    id: string;
    type_of_file_folder: string;
    name: string;
    updated_at: string;
}

function MoveOrCopyCard({ sourceID, type }: { sourceID: string | null, type: string | null }) {

    const { user } = useUser()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [empty, setEmpty] = useState(false)
    const [breadCrum, setBreadCrum] = useState<BreadCrumProps[]>([])
    const [fileFolderTree, setfileFolderTree] = useState<fileFolderTree[]>()  //used to store the array of users which are going to get the permission in the format -> emial:permissionChoice
    const [apiUrl, SetApiUrl] = useState(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/move/availableRecords`)
    const [hashedFolderID, setHashedFolderID] = useState<string | null>(null)
    const [moveOrCopy, setMoveOrCopy] = useState('COPY')
    const router = useRouter()

    const getAvailableFilesFolders = async (hashedFolderID: string | null) => {
        setHashedFolderID(hashedFolderID)
        let APIENDPOINT = ''
        if (hashedFolderID) {
            APIENDPOINT = apiUrl + `?hashedFolderID=${hashedFolderID}`
        }
        else {
            APIENDPOINT = apiUrl
        }
        setLoading(true)
        setBreadCrum([]) // Clear breadcrumb state before fetching new data
        const jwtToken = await getToken()
        // GET Request that is used to fetch all the folder/file data
        axios
            .get(APIENDPOINT, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                }
            })
            .then((res) => {
                console.log('hello')
                console.log(res.data)
                if (res.data.status_code == 5000) {
                    setfileFolderTree(res.data.data)
                    let breadCrumbDetails = res.data.breadcrumb_details
                    // calculations for integrating the breadcrums
                    let path_details = breadCrumbDetails.map((item: any) => ({
                        folderName: item.name,
                        folderID: item.hashed_id
                    }));

                    setBreadCrum(path_details);
                }
                else if (res.data.status_code == 5001) {
                    console.log(res.data)
                    setfileFolderTree([])
                    toast.error("No data found")
                }
            })
            .catch((error) => {
                toast.error("Error fetching data")
            })
            .finally(() => {
                setLoading(false)
            })
    }



    const HandleMoveOperation = async (isRoot: boolean) => {
        setLoading(true)
        let url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/move/`
        let APIENDPOINT = ''
        console.log("sourceID: ", sourceID)
        console.log("targetID: ", hashedFolderID)

        if (isRoot) {
            APIENDPOINT = `${url}?sourceRecordHashedID=${sourceID}`
        }
        else {

            const params = new URLSearchParams();

            if (hashedFolderID) {
                params.append('targetFolderHashedID', hashedFolderID)
            }

            if (sourceID) {
                params.append("sourceRecordHashedID", sourceID)
            }

            const queryString = params.toString()

            APIENDPOINT = queryString ? `${url}?${queryString}` : url;

        }



        const jwtToken = await getToken()
        // POST Request that is used to perform the move operation
        axios
            .post(APIENDPOINT, {}, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                }
            })
            .then((res) => {
                console.log(res.data)
                router.push('/dashboard')
            })
            .catch((error) => {
                toast.error("Error fetching data")
            })
            .finally(() => {
                setLoading(false)
            })
    }


    const HandleCopyOperation = async (isRoot: boolean) => {
        setLoading(true)
        let url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/copy/`
        let APIENDPOINT = ''
        console.log("sourceID: ", sourceID)
        console.log("targetID: ", hashedFolderID)

        if (isRoot) {
            APIENDPOINT = `${url}?sourceRecordHashedID=${sourceID}`
        }
        else {

            const params = new URLSearchParams();

            if (hashedFolderID) {
                params.append('targetFolderHashedID', hashedFolderID)
            }

            if (sourceID) {
                params.append("sourceRecordHashedID", sourceID)
            }

            const queryString = params.toString()

            APIENDPOINT = queryString ? `${url}?${queryString}` : url;

        }
        const jwtToken = await getToken()
        // POST Request that is used to perform the move operation
        axios
            .post(APIENDPOINT, {}, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                }
            })
            .then((res) => {
                console.log(res.data)
                router.push('/dashboard')
            })
            .catch((error) => {
                toast.error("Error fetching data")
            })
            .finally(() => {
                setLoading(false)
            })
    }


    useEffect(() => {
        getAvailableFilesFolders(null)
    }, [])


    return (
        <div className={` ${type == 'file' ? 'w-[80%]' : 'w-full'} py-2 flex gap-2 font-figtree`}>
            <Dialog>
                <form className='w-full'>
                    <DialogTrigger asChild>
                        <Button className='w-full font-figtree text-neutral-100 bg-neutral-950 font-medium border border-neutral-800 text-lg hover:bg-neutral-800 hover:text-neutral-100'>
                            <IconCopy stroke={2} />Move</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm bg-neutral-950 border-2 border-neutral-800 text-nwutra">
                        <DialogHeader>
                            <div className="w-full rounded-md text-neutral-400 flex items-center hover:cursor-pointer">
                                <div className={`w-[50%] text-center ${moveOrCopy == 'MOVE' ? 'bg-neutral-300' : 'bg-neutral-900'} p-1 rounded-md ${moveOrCopy == 'MOVE' ? 'text-black' : 'text-neutral-100'}` } onClick={() => {
                                    setMoveOrCopy('MOVE')
                                }}>MOVE</div>
                                <div className={`w-[50%] text-center ${moveOrCopy == 'COPY' ? 'bg-neutral-300' : 'bg-neutral-900'} p-1 rounded-md ${moveOrCopy == 'COPY' ? 'text-black' : 'text-neutral-100'} ` } onClick={() => {
                                    setMoveOrCopy('COPY')
                                }}>COPY</div>
                            </div>
                            <DialogTitle className='text-neutral-400'>Move Item</DialogTitle>
                            <DialogDescription>
                                Decide where to move the item as you like.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="w-full text-neutral-500 flex flex-row items-center  overflow-x-scroll no-scrollbar gap-2 p-2 rounded-lg bg-neutral-900" >
                            <div className=" font-figtree flex items-center text-sm font-bold hover:cursor-pointer hover:text-neutral-100" onClick={() => {
                                getAvailableFilesFolders(null)
                            }}>
                                Home
                            </div>
                            {
                                breadCrum.map((bread: BreadCrumProps) => {
                                    return (
                                        <div key={bread.folderID} className="flex items-center gap-2" onClick={() => {
                                            getAvailableFilesFolders(bread.folderID)
                                        }}>
                                            <IconSlash height={15} width={15} stroke={2} />
                                            <div className=" font-figtree flex items-center text-sm hover:cursor-pointer hover:text-neutral-100 transition-all duration-200 ease-in-out" >
                                                {bread.folderName}
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </div>





                        <div className="flex flex-col gap-3 h-44 overflow-y-scroll no-scrollbar  ">

                            <div className="text-neutral-400 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="w-[10%]">
                                        Type
                                    </div>
                                    <div className="w-[40%]">
                                        Name
                                    </div>
                                    <div className="text-right width-[50%]">
                                        Modified
                                    </div>
                                </div>
                                {
                                    loading ? (
                                        <InfiniteLoader />
                                    ) :
                                        (
                                            <>
                                                {
                                                    fileFolderTree?.map((item) => {
                                                        return (
                                                            <div key={item.id} className={`w-full flex items-center justify-between gap-2 hover:bg-neutral-900 rounded-md cursor-pointer hover:text-neutral-100 transition-all duration-200 ease-in-out group ${item.type_of_file_folder === "image" ? "opacity-50 pointer-events-none" : ""}`} onClick={() => {
                                                                getAvailableFilesFolders(item.id)
                                                            }}>
                                                                <div className="flex items-center gap-4 p-1 w-full text-sm">
                                                                    <div className="w-[10%] ">
                                                                        {
                                                                            item.type_of_file_folder === "image" ? <IconFile stroke={2} className="text-red-600" /> : <IconFolder stroke={2} className="text-blue-600" />
                                                                        }
                                                                    </div>
                                                                    <div className="w-[40%] ">
                                                                        {item.name.substring(0, 10) + (item.name.length > 10 ? "..." : "")}
                                                                    </div>
                                                                    <div className=" w-[40%]  text-sm text-center">
                                                                        {item.updated_at.includes('week') ? item.updated_at.split('week')[0] + 'week ago' : item.updated_at.includes('year') ? item.updated_at.split('year')[0] + 'year ago' : item.updated_at}
                                                                    </div>
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    <IconArrowRight stroke={1} className="text-neutral-400" />
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </>
                                        )
                                }

                                <div>

                                </div>
                            </div>

                        </div>


                        <div className="font-figtree text-neutral-400 flex items-center justify-center gap-2  rounded-lg p-1 w-[10%] hover:w-[43%] group cursor-pointer hover:bg-neutral-800 transition-all duration-200" onClick={() => {
                            if (moveOrCopy == 'MOVE') {
                                HandleMoveOperation(true)
                            }
                            else {
                                HandleCopyOperation(true)
                            }
                        }}>
                            {loading ? <IconLoader /> : <IconSquareCheck stroke={2} className="text-green-600" />}
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-sm">make it root</span>
                        </div>

                        <DialogFooter className='flex justify-between'>

                            <DialogClose asChild>
                                <Button variant="outline" className='flex items-center gap-2'  ><IconRowRemove stroke={2} />Cancel</Button>
                            </DialogClose>


                            {
                                moveOrCopy == 'MOVE' ? (
                                    <Button onClick={() => {
                                        HandleMoveOperation(false)
                                    }}>
                                        {
                                            loading ? <InfiniteLoader /> : <span className='flex items-center gap-2'><IconFolder stroke={2} height={5} width={5} />Move</span>
                                        }

                                    </Button>
                                ) : (
                                    <Button onClick={() => {
                                        HandleCopyOperation(false)
                                    }}>
                                        {
                                            loading ? <InfiniteLoader /> : <span className='flex items-center gap-2'><IconCopy stroke={2} height={5} width={5} />Copy</span>
                                        }

                                    </Button>
                                )
                            }




                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

        </div>
    )
}

export default MoveOrCopyCard