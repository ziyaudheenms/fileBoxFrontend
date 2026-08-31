'use client'
import React, { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { IconUser, IconPencilCheck } from '@tabler/icons-react'
import { Button } from './ui/button'
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner'
import InfiniteLoader from './InfiniteLoader'
interface Props {
    fileID?: string,
    sharableUUID?: string,
    fileHash?: string,
    type: string,
}


function UpdateMetaData({ fileID, sharableUUID, fileHash, type }: Props) {
    const [renameValue, setRenameValue] = useState<string | null>(null)
    const [descriptionValue, setDescriptionValue] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { getToken } = useAuth()

    const HandleMetaDataSubmittion = async () => {
        setLoading(true)

        let APIURL = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/update/file/`

        const params = new URLSearchParams();

        if (fileID) {
            params.append('fileID', fileID)
        }

        if (sharableUUID) {
            params.append("sharableUUID", sharableUUID)
        }

        if (fileHash) {
            params.append("fileHash", fileHash)
        }

        const queryString = params.toString()

        let APIENDPOINT = queryString ? `${APIURL}?${queryString}` : APIURL;

        const jwtToken = await getToken()
        // generating the object payload 
        const payload: any = {}
        if (descriptionValue) {
            payload.description = descriptionValue
        }
        if (renameValue) {
            payload.name = renameValue
        }

        axios.post(
            APIENDPOINT,
            payload,
            {
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                },
            },
        )
            .then((res) => {
                if (res.data.status_code == 5000) {
                    toast.success("successfully updated the metadata!")
                }
                else if (res.data.status_code == 5001) {
                    toast.error(res.data.message)
                }
            })
            .catch((err) => {
                toast.error("some error occured !")
            })
            .finally(() => {
                setLoading(false)
            })
    }



    return (
        <div className='w-full flex flex-col justify-between border border-neutral-800 bg-neutral-900/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl gap-4 shadow-xl'>
            <div className='flex flex-col gap-2'>
                <div className='font-sans flex flex-col gap-1.5'>
                    <h5 className='text-neutral-400 text-sm'>Rename</h5>
                    <InputGroup className='w-full'>
                        <InputGroupInput placeholder="Rename the file" className="text-neutral-100 w-full" value={renameValue || ''} onChange={(e) => {
                            setRenameValue(e.target.value)
                        }} />
                        <InputGroupAddon>
                            <IconUser />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <div className='font-sans flex flex-col gap-1.5'>
                    <h5 className='text-neutral-400 text-sm'>Add Description</h5>
                    <InputGroup className='w-full'>
                        <InputGroupInput placeholder="add description you need" className="text-neutral-100 w-full" value={descriptionValue || ''} onChange={(e) => {
                            setDescriptionValue(e.target.value);
                        }} />
                        <InputGroupAddon>
                            <IconPencilCheck />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
            <div className='w-full pt-1'>
                <Button className='w-full font-figtree text-neutral-900 bg-neutral-100 font-medium text-base hover:bg-neutral-300 transition-all active:scale-95 py-2.5 rounded-xl' onClick={() => {
                    HandleMetaDataSubmittion()
                }}>
                    {
                        loading ? (
                            <InfiniteLoader />
                        ) : (
                            <span className='flex items-center justify-center gap-2'>
                                <IconPencilCheck stroke={2} size={20} />Update Info
                            </span>
                        )
                    }
                </Button>
            </div>
        </div>
    )
}

export default UpdateMetaData