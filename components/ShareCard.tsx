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
import React, { use, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { IconCopyX, IconCross, IconEdit, IconFocusAuto, IconGlobe, IconGlobeFilled, IconLink, IconLock, IconLockAccess, IconShare } from '@tabler/icons-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { User2 } from 'lucide-react'
import { ButtonGroup } from './ui/button-group'
import InfiniteLoader from './InfiniteLoader'
import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'sonner'
import Image from "next/image"


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

interface props {
    fileFolderID?: number
    type: string;
    isShared : boolean;
    childSharableHash? : string | null;
    UUID? : string | null;
    isOwner? : boolean;
}


function ShareCard({ fileFolderID, type , isShared  , UUID , childSharableHash , isOwner}: props) {

    const { user } = useUser()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [userToPermission, setUserToPermission] = useState<string | null>(null)  // Input box value for searching the email similar user.
    const [userToBeAssigned, setUserToBeAssigned] = useState<permissionUserProps[]>([])  //used to store the array of users which are going to get the permission in the format -> emial:permissionChoice
    const [permissionChoice, setPermissionChoice] = useState("VIEW") // used to store the permission choice 
    const [usersWithPermission, setUsersWithPermission] = useState<usersWithPermission[]>([]) //used to store those who already has the permission.
    const [usersWithEmailSimilarity, setusersWithEmailSimilarity] = useState<usersWithEmailSimilarity[] | null>(null)    // this state is used to store the emails we get with similarity
    const [permissionLoader, setpermissionLoader] = useState<Boolean>(false)
    const [isPublic, setIsPublic] = useState<Boolean>(true)
    const [upDatePermissionLoader, setupDatePermissionLoader] = useState<Boolean>(false)
    const [editingMode, setEditiongMode] = useState<Boolean>(false)
    const [updatePermissionChoice, setupdatePermissionChoice] = useState('') // this state is used to store the updated permission choice for the user whose permission we want to update.
    const [userToBeRemoved, setUserToBeRemoved] = useState<permissionUserProps[]>([]) // this state is used to store the user which we want to remove from the list of users with permission.

    let apiUrlForGettingPermittedUsers = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/permission/Users`
    let apiUrlForAssiginigPermission = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/permission/grandUsers`

    const params = new URLSearchParams();

    if (fileFolderID) {
        let fileFolder_ID = `${fileFolderID}`
        params.append('fileFolderID', fileFolder_ID) 
    }

    if (UUID) {
        params.append("sharableUUID", UUID)
    }

    if (childSharableHash) {
        params.append("childSharableHash", childSharableHash)
    }

    const queryString = params.toString()

    let APIENDPOINT_FOR_GETTING_ASSIGNED_USERS = queryString ? `${apiUrlForGettingPermittedUsers}?${queryString}` : apiUrlForGettingPermittedUsers;
    let APIENDPOINT_FOR_ASSIGING_PERMISSION = queryString ? `${apiUrlForAssiginigPermission}?${queryString}` : apiUrlForAssiginigPermission;





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
        setUserToBeAssigned((prev) => [...(Array.isArray(prev) ? prev : []), permissionObject])
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

    const getPermittedUsers = async () => {
        setpermissionLoader(true)
        const jwtToken = await getToken()
        axios
            .get(APIENDPOINT_FOR_GETTING_ASSIGNED_USERS, {
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
                else if (res.data.status_code == 5001) {
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

    const HandleUpdateUserPermission = async (userEmail: string, userPermission: string) => {
        const permissionObject = {
            "email": userEmail,
            "permission": userPermission
        }
        console.log(permissionObject)
        if (userToBeAssigned.some((item) => item.email === permissionObject.email)) {
            setUserToBeAssigned((prev) =>
                prev.map((item) =>
                    item.email === permissionObject.email
                        ? { ...item, permission: permissionObject.permission }
                        : item
                )
            )
        } else {
            setUserToBeAssigned((prev) => [...(Array.isArray(prev) ? prev : []), permissionObject])
        }
    }

    const HandleUpdatePermission = async () => {
        setupDatePermissionLoader(true)
        console.log("entered into the function")
        const jwtToken = await getToken()
        axios.post(
            APIENDPOINT_FOR_ASSIGING_PERMISSION,
            {
                'usersToGrandPermission': userToBeAssigned,
                'usersToRemovePermission': userToBeRemoved,
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
                    // clearing the tracker state variables
                    setUserToBeAssigned([])
                    setUserToBeRemoved([])
                    setEditiongMode(false)
                    getPermittedUsers()
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



    const getShareLink = async () => {
        const jwtToken = await getToken()
        axios
            .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/get/sharableLink?fileFolderID=${fileFolderID}&type=${type}`, {
                "access_type": isPublic ? 'PUBLIC' : 'PRIVATE'
            }, {
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


    if (fileFolderID == 0) {
        return (
            <div>
                <h1>Some Error Occured</h1>
            </div>
        )
    }

    return (
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
                                {
                                    isOwner ? <option value="ADMIN">Admin</option> : null
                                }
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
                            <div className="flex justify-between items-center">
                                <h3 className='text-neutral-400 font-sans '>People with access</h3>

                                {/* edit button */}
                                {
                                    isOwner ? (
                                         <div className="text-neutral-100 flex items-center gap-1 py-1 px-3 rounded-sm bg-neutral-900" onClick={() => setEditiongMode(!editingMode)}>
                                            <IconEdit stroke={1} className="h-5 w-5" />
                                            <h5 className="text-neutral-400 font-sans text-sm font-light">Edit</h5>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )
                                }


                               

                            </div>
                            <div className='w-full gap-3 overflow-y-scroll h-24 no-scrollbar'>

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
                                            {/* profile pic */}
                                            <div className='w-[10%]'>
                                                {
                                                    user ? (
                                                        <Image src={user.profile} alt='this is the profile image' height={50} width={50} className='rounded-full h-8 w-15' />
                                                    ) : (
                                                        <div></div>
                                                    )
                                                }
                                            </div>
                                            {/* other user details */}
                                            <div className='w-[90%] text-neutral-400 flex items-center justify-between'>
                                                {
                                                    userToBeRemoved.some((userToBeRemoved) => userToBeRemoved.email === user.email) ? (
                                                        <div>
                                                            <h4 className='text-md font-light font-figtree text-neutral-200 text-left line-through'>{user.username}</h4>
                                                            <h6 className='font-sans text-sm'>{user.email}</h6>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <h4 className='text-md font-light font-figtree text-neutral-200 text-left '>{user.username}</h4>
                                                            <h6 className='font-sans text-sm'>{user.email}</h6>
                                                        </div>
                                                    )
                                                }

                                                {
                                                    editingMode && user.permission != 'OWNER' ? (
                                                        <>

                                                            <select
                                                                name="permission"
                                                                id="permission"
                                                                className='border border-neutral-800 rounded-sm py-1.5 font-sans font-extralight text-neutral-400 bg-neutral-950 text-sm'
                                                                value={updatePermissionChoice || user.permission}
                                                                onChange={(e) => {
                                                                    setupdatePermissionChoice(e.target.value)
                                                                    HandleUpdateUserPermission(user.email, e.target.value)
                                                                }}
                                                            >
                                                                <option value={user.permission}>{user.permission.charAt(0) + user.permission.slice(1).toLowerCase()}</option>
                                                                {['VIEW', 'EDIT', 'ADMIN'].filter(p => p !== user.permission).map(p => (
                                                                    <option key={p} className='font-sans text-sm' value={p}>
                                                                        {p.charAt(0) + p.slice(1).toLowerCase()}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <IconCopyX stroke={1} className="h-5 w-5 text-red-600" onClick={() => {
                                                                let permissionObject = {
                                                                    "email": user.email,
                                                                    "permission": user.permission
                                                                }
                                                                // toggle that is used to add or remove the user from the list of users to be removed. if the user is already in the list then remove it otherwise add it to the list.

                                                                if (userToBeRemoved.some((item) => item.email === permissionObject.email)) {
                                                                    setUserToBeRemoved((prev) => prev.filter((item) => item.email !== permissionObject.email))
                                                                } else {
                                                                    setUserToBeRemoved((prev) => [...(Array.isArray(prev) ? prev : []), permissionObject])
                                                                }
                                                            }} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <h6 className='font-sans text-sm'>{user.permission}</h6>
                                                            </div>
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
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

        </div>
    )
}

export default ShareCard