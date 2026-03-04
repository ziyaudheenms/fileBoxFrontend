'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/navbar';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import InfiniteLoader from '@/components/InfiniteLoader';
import ImageProcessing from '@/components/ImageProcessing';
import Image from 'next/image';
import { IconCopyX, IconDownload, IconLink, IconPencilCheck, IconShare, IconUser } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { User2 } from 'lucide-react';
import { toast } from 'sonner';
import SharableError from '@/components/SharableError';
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
    permission_data?: {
        permission_type?: string;
        permission_granded_at?: Date;
    }
}

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
type SharableErrorType = "NO-ACCESS" | "LINK-EXPIRED" | "INCORRECT-PASSWORD" | "ACCESS-LIMIT-CROSSED" | "NOT-FOUND"
const ERROR_MAP: Record<number, SharableErrorType> = {
    4002: 'NO-ACCESS',
    5004: 'LINK-EXPIRED',
    5008: 'INCORRECT-PASSWORD',
    5006: 'ACCESS-LIMIT-CROSSED',
    5002: 'NOT-FOUND'
};

function page() {
    const params = useParams();
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<SharableErrorType | null>(null)
    const [folderFileData, setFolderFileData] = useState<FileFolderProps>({} as FileFolderProps)

    const HandleGetSharedImage = async () => {
        setLoading(true)
        setError(null) // Reset error state before fetching new data
        const jwtToken = await getToken() //getting the authentication token ....................
        axios
            .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/get/sharedFileFolder?sharableUUID=${params.id ? params.id as string : undefined}`, {}, {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            },)
            .then((response) => {
                if (response.data.status_code == 5000) {
                    setFolderFileData(response.data.data)
                    toast.success("successfully fetched the data")
                }
                else {
                    const currentError = ERROR_MAP[response.data.status_code];
                    if (currentError) {
                        setError(currentError);
                    } else {
                        toast.error("something went wrong while fetching the data")
                    }
                }
            }).catch((error) => {
                console.error(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        HandleGetSharedImage()
    }, [])

    if (loading) {
        return <InfiniteLoader />
    }

    // handled the error component to show the error based on the error type we get from the backend when we try to fetch the shared file or folder data using the sharable link and if there is an error we set the error state with the error type and then render the SharableError component with the error type as a prop to show the appropriate error message and image to the user based on the error type .....
    if (error) {
        return (
            <SharableError error={error as SharableErrorType} />
        )
    }


    // setting up the permissions based on the role of the user for this file .....
    const userRole = folderFileData.permission_data?.permission_type || 'PUBLIC';
    const canEdit = ['EDIT', 'ADMIN', 'OWNER'].includes(userRole);
    const canShare = ['ADMIN', 'OWNER'].includes(userRole);
    const canDelete = ['OWNER'].includes(userRole);  // only belongs to the owner of the file or folder can delete it .....x

    return (
        <div>
            <Navbar />

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
                            </div>

                            <div className='w-full pb-2 pt-5 border-t-2 border-t-neutral-800'>
                                <Button className='w-full font-figtree text-neutral-800 bg-neutral-100 font-medium text-lg hover:bg-neutral-400 hover:text-neutral-100'> <IconDownload stroke={2} height={30} width={30} className='text-lg' />Download</Button>
                                <div className='w-full py-2 flex gap-2 font-figtree'>
                                    {
                                        canShare ? (
                                            <>
                                                <Dialog>
                                                    <form className='w-full'>
                                                        <DialogTrigger asChild>
                                                            <Button className='w-full font-figtree text-neutral-100 bg-neutral-950 font-medium border border-neutral-800 text-lg hover:bg-neutral-800 hover:text-neutral-100' onClick={() => {
                                                                // getPermittedUsers()
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
                                                                    {/* <InputGroupInput placeholder="Search..." className='text-neutral-400' value={userToPermission ? userToPermission : ''} onChange={(e) => {
                                                                    if (e.target.value == "") {
                                                                        // setusersWithEmailSimilarity(null)
                                                                    }
                                                                    // setUserToPermission(e.target.value)
                                                                }} /> */}
                                                                    <InputGroupAddon>
                                                                        <User2 />
                                                                    </InputGroupAddon>
                                                                </InputGroup>
                                                                <select
                                                                    name="permission"
                                                                    id="permission"
                                                                    className='border border-neutral-800 rounded-sm py-1.5 font-sans font-extralight text-neutral-400 bg-neutral-950 text-sm'
                                                                // value={permissionChoice}
                                                                // onChange={(e) => setPermissionChoice(e.target.value)}
                                                                >
                                                                    <option value="VIEW">View</option>
                                                                    <option value="EDIT">Edit</option>
                                                                    <option value="ADMIN">Admin</option>
                                                                </select>



                                                            </div>
                                                            <div>

                                                                {/* {
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
                                                            } */}

                                                            </div>
                                                            <div>
                                                                <h3 className='text-neutral-400 font-sans '>People with access</h3>
                                                                <div className='w-full gap-3 overflow-y-scroll h-24 no-scrollbar'>

                                                                    <div className='w-full flex items-center gap-2' >
                                                                        <div className='w-[10%]'>
                                                                            {/* {
                                                                            user ? (
                                                                                <Image src={user?.imageUrl} alt='this is the profile image' height={50} width={50} className='rounded-full h-8 w-15' />
                                                                            ) : (
                                                                                <div></div>
                                                                            )
                                                                        } */}
                                                                        </div>
                                                                        <div className='w-[90%] text-neutral-400 flex items-center justify-between'>
                                                                            <div>
                                                                                {/* <h4 className='text-md font-light font-figtree text-neutral-200 text-left '>{user?.username}</h4>
                                                                            <h6 className='font-sans text-sm'>{user?.primaryEmailAddress?.emailAddress}</h6> */}
                                                                                <h4 className='text-md font-light font-figtree text-neutral-200 text-left '>public user</h4>
                                                                                <h6 className='font-sans text-sm'>public email</h6>
                                                                            </div>
                                                                            <div>
                                                                                <h6 className='font-sans text-sm'>{folderFileData?.permission_data?.permission_type || 'public'}</h6>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* {
                                                                    permissionLoader ? (
                                                                        <InfiniteLoader />
                                                                    ) : (
                                                                        <div>

                                                                        </div>
                                                                    )
                                                                } */}
                                                                    {/* {
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
                                                                } */}
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
                                                                {/* {
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
                                                            } */}
                                                                {/* {
                                                                isPublic ? (
                                                                    <h3 className='text-green-600 text-xm font-extralight font-figtree flex items-center'>This Link is Accessible by All<IconGlobeFilled stroke={2} /></h3>

                                                                ) : (
                                                                    <h3 className='text-blue-600 text-xm font-extralight font-figtree flex items-center'>This Link is Protected access<IconLockAccess stroke={2} /></h3>

                                                                )
                                                            } */}
                                                            </div>
                                                            <DialogFooter className='flex justify-between'>

                                                                <DialogClose asChild>
                                                                    <Button variant="outline" className='flex items-center gap-2' onClick={() => {
                                                                        // getShareLink()
                                                                    }}   ><IconLink stroke={2} />Copy Link</Button>
                                                                </DialogClose>
                                                                {/* <Button onClick={HandleUpdatePermission}>
                                                                {
                                                                    upDatePermissionLoader ? (
                                                                        <InfiniteLoader />
                                                                    ) : (
                                                                        <>
                                                                        <IconFocusAuto stroke={2} className='h-10 w-10' /> Update Permission
                                                                        </>
                                                                    )
                                                                }
                                                                
                                                                </Button> */}
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </form>
                                                </Dialog>
                                                {
                                                    canDelete ? (
                                                        <Button className='w-[30%] bg-neutral-950 border border-neutral-800 hover:bg-red-600'>
                                                            <IconCopyX stroke={2} className='text-red-900 ' height={30} width={30} />
                                                        </Button>
                                                    ) : (
                                                        <div></div>
                                                    )
                                                }

                                            </>
                                        ) : (
                                            <div></div>
                                        )
                                    }

                                </div>
                            </div>

                        </div>
                        {
                            canEdit ? (
                                <>
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
                                </>
                            ) : (
                                <div></div>
                            )
                        }


                    </div>
                </div>
            </div>


        </div>
    )
}

export default page