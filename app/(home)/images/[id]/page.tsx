'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '@/components/navbar'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { IconCopyX, IconDownload, IconHome, IconPencilCheck, IconShare, IconUser, IconLink, IconFocusAuto, IconGlobe, IconKey, IconLock, IconGlobeFilled, IconLockAccess } from '@tabler/icons-react'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'
import InfiniteLoader from '@/components/InfiniteLoader'
import ImageProcessing from '@/components/ImageProcessing'
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
import { Link2, SearchIcon, User2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs' // this import is to get the important details about the current logged in user.
import { ButtonGroup } from '@/components/ui/button-group'

// Custom function to get relative time based on the DATE object.
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

interface usersWithPermission {
    id: number;
    username: string;
    email: string;
    profile: string;
    permission: string;
}

interface usersWithEmailSimilarity {
    pk: number;
    clerk_user_email: string;
    clerk_user_name: string;
    clerk_user_profile_img: string;


}

interface permissionUserProps {
    email: string;
    permission: string;
}


function page() {

    const { user } = useUser()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [folderFileData, setFolderFileData] = useState<FileFolderProps>({} as FileFolderProps)
    const [userToPermission, setUserToPermission] = useState<string | null>(null)  // Input box value for searching the email similar user.
    const [permissionUsers, setPermissionUsers] = useState<permissionUserProps[]>([])  //used to store the array of users which are going to get the permission in the format -> emial:permissionChoice
    const [permissionChoice, setPermissionChoice] = useState("VIEW") // used to store the permission choice 
    const [usersWithPermission, setUsersWithPermission] = useState<usersWithPermission[]>([]) //used to store those who already has the permission.
    const [usersWithEmailSimilarity, setusersWithEmailSimilarity] = useState<usersWithEmailSimilarity[] | null>(null)    // this state is used to store the emails we get with similarity
    const [permissionLoader, setpermissionLoader] = useState<Boolean>(false)
    const [isPublic, setIsPublic] = useState<Boolean>(true)
    const [token, setToken] = useState("")
    const [upDatePermissionLoader, setupDatePermissionLoader] = useState<Boolean>(false)
    const params = useParams();
    const wsRef = React.useRef<WebSocket | null>(null);



    const getTheUserForAssigningPermission = async () => {
        const jwtToken = await getToken()
        axios.post(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/permission/getUser`,
            {
                'userToFind': userToPermission,
            },
            {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            },
        ).then((responce) => {
            console.log(responce)
            if (responce.data.status_code == 5000) {
                setusersWithEmailSimilarity(responce.data.data)
            }
            else if (responce.data.status_code == 5002) {
                setUserToPermission(null)
                toast.info("opps ! No User is found with this email.")
            }
        }).catch((error) => {
            console.error(error)
        }).finally(() => {

        })
    }

    const HandleUserSelection = (userEmail: string, userPermission: string) => {
        let permissionObject = {
            "email": userEmail,
            "permission": userPermission
        } // the format in which the details is send to the backend.
        setPermissionUsers((prev) => [...(Array.isArray(prev) ? prev : []), permissionObject])
        setusersWithEmailSimilarity(null)
        setUserToPermission(null)
        toast(`${userEmail}`, {
            description: "Adding the email to the list",
            action: {
                label: `${userPermission}`,
                onClick: () => console.log("Undo"),
            },
        })
    }


    const HandleUpdatePermission = async () => {
        setupDatePermissionLoader(true)
        console.log("entered into the function")
        const jwtToken = await getToken()
        axios.post(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/permission/grandUsers?fileFolderID=${params.id ? params.id as string : undefined}`,
            {
                'usersToGrandPermission': permissionUsers,
            },
            {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            },
        )
            .then((res) => {
                if (res.data.status_code == 5000) {
                    toast.success('Updated the Users With Permission')
                }
                else if (res.data.status_code == 5003) {
                    toast.error('You Have No Rights To Access This Data')
                }
                else if (res.data.status_code == 5002) {
                    toast.error(res.data.message)
                }
                else if (res.data.status_code == 4001) {
                    toast.error("user not found !")
                }
               
            })
            .catch((err) => {
                toast.error("some error occured !")
            })
            .finally(() => {
                setupDatePermissionLoader(false)
            })
    }

    const getPermittedUsers = async () => {
        setpermissionLoader(true)
        const jwtToken = await getToken()
        axios
            .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/permission/Users?fileFolderID=${params.id ? params.id as string : undefined}`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res)
                if (res.data.status_code == 5000) {
                    setUsersWithPermission(res.data.data)
                    toast.success(res.data.message)
                    setpermissionLoader(false)
                }
                else if (res.data.status_code == 5002) {
                    toast.error(res.data.message)
                }
                else if (res.data.status_code == 4001) {
                    toast.error('user not found !')
                }
            })
            .catch((err) => {
                console.log(err)
                toast.error("some error occured !")
            })
            .finally(() => {
                setpermissionLoader(false)
            })
    }

    const getShareLink = async () => {
        const jwtToken = await getToken()
        axios
            .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/get/sharableLink?fileFolderID=${params.id ? params.id as string : undefined}&type=image`, {
                "access_type" : isPublic? 'PUBLIC' : 'PRIVATE'
            } , {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                console.log(res)
                if (res.data.status_code == 5000) {
                    toast.success(res.data.message)
                    const shareLink = `${window.location.origin}/${res.data.data.sharable_link}`;
                    navigator.clipboard.writeText(shareLink);
                }
                else if (res.data.status_code == 5002) {
                    toast.error(res.data.message)
                }
                else if (res.data.status_code == 4001) {
                    toast.error(res.data.message)
                }
            })
            .catch((err) => {
                console.log(err)
                toast.error("some error occured !")
            })
            .finally(() => {
                setpermissionLoader(false)
            })
    }

    const HandleSingleImage = async () => {
        setLoading(true)
        const jwtToken = await getToken()
        setToken(jwtToken ? jwtToken : "")
        axios
            .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/fileFolders/Image?imageFileID=${params.id ? params.id as string : undefined}`, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((res) => {
                if (res.data.status_code === 5000) {
                    toast.success('Successfully fetched the image data')
                    setFolderFileData(res.data.data)
                }
                else if (res.data.status_code === 5002) {
                    toast.error('Failed to fetch the image data')
                }
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }
    // useEffect(() => {
    //     HandleSingleImage()
    // } , [])
    useEffect(() => {
        HandleSingleImage()
        if (folderFileData?.upload_status === 'PENDING' || folderFileData?.upload_status === 'PROCESSING') {
            console.log('Setting up WebSocket connection for file ID:', folderFileData.id);
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            if (!token) {
                console.log('waiting for token')
                return
            }
            const ws = new WebSocket(`${protocol}//127.0.0.1:8000/ws/files/?token=${token}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connection established');
            }

            ws.onclose = () => {
                console.log('WebSocket connection closed');
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                setFolderFileData((prevData) => {
                    if (data.file_id == prevData.id) {
                        console.log('Updating file data for file ID:', data.file_id);
                        prevData.upload_status = data.upload_status;
                        prevData.file_url = data.file_url
                        console.log("Updated prevData:", prevData);
                        return { ...prevData };
                    }
                    return { ...prevData };
                });
            }
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);

            return () => {
                clearInterval(pingInterval);
                ws.close();
                console.log('webSocket connection is closed for a while...')
            }
        }
        else {
            console.log('No need for WebSocket connection. Current upload status:', folderFileData?.upload_status);
        }
    }, [token, folderFileData?.id])


    useEffect(() => {
        const handler = setTimeout(() => {
            if (userToPermission) {
                getTheUserForAssigningPermission()
            }
        }, 1000);

        return () => {
            clearTimeout(handler)
        }
    }, [userToPermission])

    return (
        <div>
            <Navbar />
            <Link href={'/dashboard'}>
                <div className='flex  gap-1 px-4'>
                    <IconHome stroke={2} height={20} width={20} className='text-neutral-100' />
                    <h4 className='text-neutral-100 font-sans'>Home</h4>
                </div>
            </Link>
            {
                !loading ? (
                    <div className='flex w-full  h-screen overflow-y-scroll no-scrollbar py-2 px-2'>
                        {
                            folderFileData.file_url ? (
                                <div className='w-[60%] flex justify-center items-center h-full px-5 relative'>
                                    {
                                        folderFileData.upload_status == 'PENDING' || folderFileData.upload_status == 'PROCESSING' || folderFileData.upload_status == 'FAILED' ? (
                                            <ImageProcessing parent='image' />
                                        ) : (
                                            <Image src={folderFileData?.file_url} height={500} width={500} alt='Uploaded Image in a big view' className=' w-full h-fit absolute top-0 left-0 right-0' />
                                        )
                                    }
                                </div>
                            ) :
                                <InfiniteLoader />
                        }

                        <div className='w-[40%]'>
                            <div className='w-full flex flex-col items-center justify-center gap-2 '>
                                <div className='w-[80%] h-96  flex flex-col justify-between border-2 p-4  border-neutral-800 rounded-lg'>
                                    <div className='flex flex-col gap-2'>
                                        <div className='font-sans flex items-center justify-between'>
                                            <h5 className='text-neutral-400'>Name</h5>
                                            <h5 className='text-neutral-100'>{folderFileData.name}</h5>
                                        </div>
                                        <div className='font-sans flex items-center justify-between'>
                                            <h5 className='text-neutral-400'>Size</h5>
                                            <h5 className='text-neutral-100'>
                                                {(() => {
                                                    const size = folderFileData.size;
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
                                            <h5 className='text-neutral-400'>Uploaded At</h5>
                                            <h5 className='text-neutral-100'>{getRelativeTime(folderFileData.uploaded_at)}</h5>
                                        </div>
                                        <div className='font-sans flex items-center justify-between'>
                                            <h5 className='text-neutral-400'>Type</h5>
                                            <h5 className='text-neutral-100'>{folderFileData.file_extension}</h5>
                                        </div>
                                        {/* <div className='font-sans flex items-center justify-between'>
                                    <h5 className='text-neutral-400'>Dimensions</h5>
                                    <h5 className='text-neutral-100'>{folderFileData.dimensions}</h5>
                                </div> */}
                                    </div>

                                    <div className='w-full pb-2 pt-5 border-t-2 border-t-neutral-800'>
                                        <Button className='w-full font-figtree text-neutral-800 bg-neutral-100 font-medium text-lg hover:bg-neutral-400 hover:text-neutral-100'> <IconDownload stroke={2} height={30} width={30} className='text-lg' />Download</Button>
                                        <div className='w-full py-2 flex gap-2 font-figtree'>
                                            <Dialog>
                                                <form className='w-full'>
                                                    <DialogTrigger asChild>
                                                        <Button className='w-full font-figtree text-neutral-100 bg-neutral-950 font-medium border border-neutral-800 text-lg hover:bg-neutral-800 hover:text-neutral-100' onClick={() => {
                                                            getPermittedUsers()
                                                        }}> <IconShare stroke={2} />Share</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-sm bg-neutral-950 border-2 border-neutral-800 text-nwutra">
                                                        <DialogHeader>
                                                            <DialogTitle className='text-neutral-400'>Manage Share Permissions</DialogTitle>
                                                            <DialogDescription>
                                                                Decide who has to access or edit your file folders to secure it.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className='flex items-center justify-between gap-2 '>
                                                            <InputGroup className='border-neutral-800'>
                                                                <InputGroupInput placeholder="Search..." className='text-neutral-400' value={userToPermission ? userToPermission : ''} onChange={(e) => {
                                                                    if (e.target.value == "") {
                                                                        setusersWithEmailSimilarity(null)
                                                                    }
                                                                    setUserToPermission(e.target.value)
                                                                }} />
                                                                <InputGroupAddon>
                                                                    <User2 />
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                            <select
                                                                name="permission"
                                                                id="permission"
                                                                className='border border-neutral-800 rounded-sm py-1.5 font-sans font-extralight text-neutral-400 bg-neutral-950 text-sm'
                                                                value={permissionChoice}
                                                                onChange={(e) => setPermissionChoice(e.target.value)}
                                                            >
                                                                <option value="VIEW">View</option>
                                                                <option value="EDIT">Edit</option>
                                                                <option value="ADMIN">Admin</option>
                                                            </select>



                                                        </div>
                                                        <div>

                                                            {
                                                                usersWithEmailSimilarity ? (
                                                                    <div className='w-full gap-4 overflow-y-scroll h-24 no-scrollbar border-2 border-neutral-800 rounded-lg p-2'>
                                                                        {
                                                                            usersWithEmailSimilarity.map((userWithSimilarity: usersWithEmailSimilarity) => (
                                                                                <div className='w-full flex items-center gap-2' key={userWithSimilarity.pk} onClick={() => {
                                                                                    HandleUserSelection(userWithSimilarity.clerk_user_email, permissionChoice)
                                                                                }}>
                                                                                    <div className='w-[10%]'>
                                                                                        {
                                                                                            user ? (
                                                                                                <Image src={userWithSimilarity.clerk_user_profile_img} alt='this is the profile image' height={50} width={50} className='rounded-full h-8 w-15' />
                                                                                            ) : (
                                                                                                <div></div>
                                                                                            )
                                                                                        }
                                                                                    </div>
                                                                                    <div className='w-[90%] text-neutral-400 flex items-center justify-between'>
                                                                                        <div>
                                                                                            <h4 className='text-md font-light font-figtree text-neutral-200 text-left '>{userWithSimilarity.clerk_user_email}</h4>
                                                                                            <h6 className='font-sans text-sm'>{userWithSimilarity.clerk_user_name}</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        }

                                                                    </div>
                                                                ) : (
                                                                    <div></div>
                                                                )
                                                            }

                                                        </div>
                                                        <div>
                                                            <h3 className='text-neutral-400 font-sans '>People with access</h3>
                                                            <div className='w-full gap-3 overflow-y-scroll h-24 no-scrollbar'>
                                                               
                                                                <div className='w-full flex items-center gap-2' >
                                                                    <div className='w-[10%]'>
                                                                        {
                                                                            user ? (
                                                                                <Image src={user?.imageUrl} alt='this is the profile image' height={50} width={50} className='rounded-full h-8 w-15' />
                                                                            ) : (
                                                                                <div></div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                    <div className='w-[90%] text-neutral-400 flex items-center justify-between'>
                                                                        <div>
                                                                            <h4 className='text-md font-light font-figtree text-neutral-200 text-left '>{user?.username}</h4>
                                                                            <h6 className='font-sans text-sm'>{user?.primaryEmailAddress?.emailAddress}</h6>
                                                                        </div>
                                                                        <div>
                                                                            <h6 className='font-sans text-sm'>OWNER</h6>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                 {
                                                                    permissionLoader ? (
                                                                        <InfiniteLoader />
                                                                    ) : (
                                                                        <div>

                                                                        </div>
                                                                    )
                                                                }
                                                                {
                                                                    usersWithPermission.map((user: usersWithPermission) => (
                                                                        <div className='w-full flex items-center gap-2' key={user.id}>
                                                                            <div className='w-[10%]'>
                                                                                {
                                                                                    user ? (
                                                                                        <Image src={user.profile} alt='this is the profile image' height={50} width={50} className='rounded-full h-8 w-15' />
                                                                                    ) : (
                                                                                        <div></div>
                                                                                    )
                                                                                }
                                                                            </div>
                                                                            <div className='w-[90%] text-neutral-400 flex items-center justify-between'>
                                                                                <div>
                                                                                    <h4 className='text-md font-light font-figtree text-neutral-200 text-left '>{user.username}</h4>
                                                                                    <h6 className='font-sans text-sm'>{user.email}</h6>
                                                                                </div>
                                                                                <div>
                                                                                    <h6 className='font-sans text-sm'>{user.permission}</h6>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                        {/* <div className='w-full text-neutral-100 font-sans flex'>
                                                                <div className={`h-8 w-[50%] flex items-center gap-2 ${isPublic ? 'bg-green-500' : "bg-neutral-800"} rounded-tl-md rounded-bl-md `} onClick={() => {
                                                                    console.log('hello')
                                                                    setIsPublic(true)
                                                                    console.log(isPublic)
                                                                }}>
                                                                    <IconGlobe stroke={2} /> Public
                                                                </div>
                                                                <div className={`h-8 w-[50%] flex items-center gap-2 bg-red-500 rounded-tr-md rounded-br-md `}>
                                                                     <IconGlobe stroke={2}/> Private
                                                                </div>
                                                        </div> */}

                                                        <div className='flex items-center gap-3'>
                                                            {
                                                                isPublic ? (
                                                                    <ButtonGroup>
                                                                        <Button className='bg-green-700'><IconGlobe stroke={2} height={20} width={20} /></Button>
                                                                        <Button onClick={() => {
                                                                            setIsPublic(!isPublic)
                                                                        }}><IconLock stroke={2} height={20} width={20} /></Button>
                                                                    </ButtonGroup>
                                                                ) : (
                                                                    <ButtonGroup>
                                                                        <Button onClick={() => {
                                                                            setIsPublic(!isPublic)
                                                                        }}><IconGlobe stroke={2} height={20} width={20} /></Button>
                                                                        <Button className='bg-blue-700' ><IconLock stroke={2} height={20} width={20} /></Button>
                                                                    </ButtonGroup>
                                                                )
                                                            }
                                                            {
                                                                isPublic ? (
                                                                    <h3 className='text-green-600 text-xm font-extralight font-figtree flex items-center'>This Link is Accessible by All<IconGlobeFilled stroke={2} /></h3>

                                                                ) : (
                                                                    <h3 className='text-blue-600 text-xm font-extralight font-figtree flex items-center'>This Link is Protected access<IconLockAccess stroke={2} /></h3>

                                                                )
                                                            }
                                                        </div>
                                                        <DialogFooter className='flex justify-between'>

                                                            <DialogClose asChild>
                                                                <Button variant="outline" className='flex items-center gap-2' onClick={() => {
                                                                    getShareLink()
                                                                }}   ><IconLink stroke={2} />Copy Link</Button>
                                                            </DialogClose>
                                                            <Button onClick={HandleUpdatePermission}>
                                                                {
                                                                    upDatePermissionLoader ? (
                                                                        <InfiniteLoader />
                                                                    ) : (
                                                                        <>
                                                                        <IconFocusAuto stroke={2} className='h-10 w-10' /> Update Permission
                                                                        </>
                                                                    )
                                                                }
                                                                
                                                                </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </form>
                                            </Dialog>
                                            <Button className='w-[30%] bg-neutral-950 border border-neutral-800 hover:bg-red-600'>
                                                <IconCopyX stroke={2} className='text-red-900 ' height={30} width={30} />
                                            </Button>
                                        </div>
                                    </div>

                                </div>

                                <div className='w-[80%]  flex flex-col justify-between border-2 p-4  border-neutral-800 rounded-lg'>
                                    <div className='flex flex-col gap-2'>
                                        <div className='font-sans flex flex-col gap-1'>
                                            <h5 className='text-neutral-400'>Rename</h5>
                                            <InputGroup>
                                                <InputGroupInput placeholder="Rename the file" className="text-neutral-100 w-[7000px]" />
                                                <InputGroupAddon>
                                                    <IconUser />
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <div className='w-full py-2'>
                                        <Button className='w-full font-figtree text-neutral-800 bg-neutral-100 font-medium text-lg hover:bg-neutral-400 hover:text-neutral-100'> <IconUser stroke={2} height={30} width={30} className='text-lg' />Rename</Button>
                                    </div>

                                </div>
                                <div className='w-[80%]  flex flex-col justify-between border-2 p-4  border-neutral-800 rounded-lg'>
                                    <div className='flex flex-col gap-2'>
                                        <div className='font-sans flex flex-col gap-1'>
                                            <h5 className='text-neutral-400'>Add Description</h5>
                                            <InputGroup>
                                                <InputGroupInput placeholder="Rename the file" className="text-neutral-100 w-[7000px]" />
                                                <InputGroupAddon>
                                                    <IconPencilCheck />
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <div className='w-full py-2'>
                                        <Button className='w-full font-figtree text-neutral-800 bg-neutral-100 font-medium text-lg hover:bg-neutral-400 hover:text-neutral-100'> <IconPencilCheck stroke={2} height={30} width={30} className='text-lg' />Rename</Button>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    <InfiniteLoader />
                )
            }

        </div>
    )
}

export default page