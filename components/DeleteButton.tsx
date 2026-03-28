"use client"
import React from 'react'
import { Button } from './ui/button'
import { IconCopyX } from '@tabler/icons-react'
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface props {
    fileFolderID?: string | undefined;
    shareUUID?: string | undefined;
    fileFolderHash?: string | undefined;
    isDropDown: boolean;
}


function DeleteButton({fileFolderID , shareUUID, fileFolderHash , isDropDown}: props) {
    const { getToken } = useAuth()
    const router = useRouter()

    let APIURL =  `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/delete/FolderFile/`

    const params = new URLSearchParams();

    if (fileFolderID) {
        params.append('fileFolderID' , fileFolderID)
    }

    if (shareUUID) {
        params.append("sharableUUID" , shareUUID)
    }

    if (fileFolderHash) {
        params.append("fileFolderHash" , fileFolderHash)
    }

    const queryString = params.toString()

    let APIENDPOINT = queryString ? `${APIURL}?${queryString}` : APIURL;

    const deleteTheSelectedRecord = async () => {
        const jwtToken = await getToken()
        axios.delete(
            APIENDPOINT,
            {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            },
        ).then((responce) => {
            console.log(responce.data)
            if( responce.data.status_code == 5000) {
                toast.success("successfully deleted the record")
                if (shareUUID) {
                    router.push(`/sharable/folder/${shareUUID}`)
                }
                else {
                    router.push('/dashboard')
                }
            }
            else if (responce.data.status_code == 5001) {
                toast.error(responce.data.message)
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {

        })
    }



    return (
        <Button className={isDropDown ?'w-full bg-neutral-950 border border-neutral-800 hover:bg-red-600' : 'w-[30%] bg-neutral-950 border border-neutral-800 hover:bg-red-600'} onClick={deleteTheSelectedRecord}>
            <IconCopyX stroke={2} className='text-red-900 ' height={30} width={30} /> 
        </Button>
    )
}

export default DeleteButton