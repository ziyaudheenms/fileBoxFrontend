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
import { IconAlignRight, IconArrowRight, IconCopy, IconCopyX, IconCross, IconEdit, IconFile, IconFocusAuto, IconFolder, IconGlobe, IconGlobeFilled, IconHome, IconLink, IconLock, IconLockAccess, IconRowRemove, IconShare } from '@tabler/icons-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { User2 } from 'lucide-react'
import { ButtonGroup } from './ui/button-group'
import InfiniteLoader from './InfiniteLoader'
import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'sonner'
import Image from "next/image"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb"














// interface usersWithPermission {
//     id: number;
//     username: string;
//     email: string;
//     profile: string;
//     permission: string;
// }

// interface usersWithEmailSimilarity {
//     pk: number;
//     clerk_user_email: string;
//     clerk_user_name: string;
//     clerk_user_profile_img: string;


// }

interface fileFolderTree {
    type: string;
    name: string;
    hashedID: string;
    dateModified?: string;
    link: string;
}

// interface props {
//     fileFolderID?: number
//     type: string;
//     isShared : boolean;
//     childSharableHash? : string | null;
//     UUID? : string | null;
//     isOwner? : boolean;
// }


function MoveCard() {

    const { user } = useUser()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [userToPermission, setUserToPermission] = useState<string | null>(null)  // Input box value for searching the email similar user.
    const [fileFolderTree, setfileFolderTree] = useState<fileFolderTree[]>([
        {
            type: "folder",
            name: "Folder 1",
            hashedID: "abc123",
            dateModified: "two days ago",
            link:"/sharable/folder/abc123"
        },
        {
            type: "folder",
            name: "Folder 2",
            hashedID: "ac123",
            dateModified: "four days ago",
             link:"/sharable/folder/abc123"
        },
        {
            type: "folder",
            name: "Folder 3",
            hashedID: "abc523",
            dateModified: "eight days ago",
             link:"/sharable/folder/abc123"
        },
        {
            type: "file",
            name: "New.txt",
            hashedID: "abc183",
            dateModified: "ten days ago",
             link:"/sharable/folder/abc123"
        },
        {
            type: "file",
            name: "profile.png",
            hashedID: "abc103",
            dateModified: "one month ago",
             link:"/sharable/folder/abc123"
        },

    ])  //used to store the array of users which are going to get the permission in the format -> emial:permissionChoice
    // const [permissionChoice, setPermissionChoice] = useState("VIEW") // used to store the permission choice 
    // const [usersWithPermission, setUsersWithPermission] = useState<usersWithPermission[]>([]) //used to store those who already has the permission.
    // const [usersWithEmailSimilarity, setusersWithEmailSimilarity] = useState<usersWithEmailSimilarity[] | null>(null)    // this state is used to store the emails we get with similarity
    // const [permissionLoader, setpermissionLoader] = useState<Boolean>(false)
    // const [isPublic, setIsPublic] = useState<Boolean>(true)
    // const [upDatePermissionLoader, setupDatePermissionLoader] = useState<Boolean>(false)
    // const [editingMode, setEditiongMode] = useState<Boolean>(false)
    // const [updatePermissionChoice, setupdatePermissionChoice] = useState('') // this state is used to store the updated permission choice for the user whose permission we want to update.
    // const [userToBeRemoved, setUserToBeRemoved] = useState<permissionUserProps[]>([]) // this state is used to store the user which we want to remove from the list of users with permission.


    const params = new URLSearchParams();

    // if (fileFolderID) {
    //     let fileFolder_ID = `${fileFolderID}`
    //     params.append('fileFolderID', fileFolder_ID) 
    // }

    // if (UUID) {
    //     params.append("sharableUUID", UUID)
    // }

    // if (childSharableHash) {
    //     params.append("childSharableHash", childSharableHash)
    // }

    const queryString = params.toString()

    useEffect(() => {
        const handler = setTimeout(() => {
            if (userToPermission) {

            }
        }, 1000);

        return () => {
            clearTimeout(handler)
        }
    }, [userToPermission])


    // if (fileFolderID == 0) {
    //     return (
    //         <div>
    //             <h1>Some Error Occured</h1>
    //         </div>
    //     )
    // }

    return (
        <div className='w-[80%] py-2 flex gap-2 font-figtree'>
            <Dialog>
                <form className='w-full'>
                    <DialogTrigger asChild>
                        <Button className='w-full font-figtree text-neutral-100 bg-neutral-950 font-medium border border-neutral-800 text-lg hover:bg-neutral-800 hover:text-neutral-100'>
                            <IconCopy stroke={2} />Move</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm bg-neutral-950 border-2 border-neutral-800 text-nwutra">
                        <DialogHeader>
                            <DialogTitle className='text-neutral-400'>Move Item</DialogTitle>
                            <DialogDescription>
                                Decide where to move the item as you like.
                            </DialogDescription>
                        </DialogHeader>


                        


                        <div className="w-full text-neutral-400 flex flex-row gap-2 overflow-x-scroll no-scrollbar " >
                            <div className=" font-poppins flex items-center">
                                <IconHome stroke={2} height={20} width={20}/> Home
                            </div>
                           
                            
                        </div>

                        <div className="flex flex-col gap-3 h-52 overflow-y-scroll no-scrollbar  ">

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
                                    fileFolderTree.map((item) => {
                                        return (
                                            <div key={item.hashedID} className="w-full flex items-center justify-between gap-2 hover:bg-neutral-900 rounded-md cursor-pointer hover:text-neutral-100 transition-all duration-200 ease-in-out group">
                                                <div className="flex items-center gap-4 p-1 w-full text-sm">
                                                    <div className="w-[10%] ">
                                                        {
                                                            item.type === "file" ? <IconFile stroke={2} className="text-red-600" /> : <IconFolder stroke={2} className="text-blue-600" />
                                                        }
                                                    </div>
                                                    <div className="w-[40%] ">
                                                        {item.name}
                                                    </div>
                                                    <div className=" w-[40%]  text-sm">
                                                        {item.dateModified}
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <IconArrowRight stroke={1} className="text-neutral-400" />
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                        </div>


                        <DialogFooter className='flex justify-between'>

                            <DialogClose asChild>
                                <Button variant="outline" className='flex items-center gap-2'  ><IconRowRemove stroke={2} />Cancel</Button>
                            </DialogClose>
                            <Button >
                                <IconFolder stroke={2} height={5} width={5} />Move
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

        </div>
    )
}

export default MoveCard