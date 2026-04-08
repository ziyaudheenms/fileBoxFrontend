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
}


function UpdateMetaData({ fileID, sharableUUID, fileHash }: Props) {
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
        <div className='w-[80%]  flex flex-col justify-between border-2 p-4  border-neutral-800 rounded-lg gap-4'>
            <div className='flex flex-col gap-2'>
                <div className='font-sans flex flex-col gap-1'>
                    <h5 className='text-neutral-400'>Rename</h5>
                    <InputGroup>
                        <InputGroupInput placeholder="Rename the file" className="text-neutral-100 w-[7000px]" value={renameValue || ''} onChange={(e) => {
                            setRenameValue(e.target.value)
                        }} />
                        <InputGroupAddon>
                            <IconUser />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <div className='font-sans flex flex-col gap-1'>
                    <h5 className='text-neutral-400'>Add Description</h5>
                    <InputGroup>
                        <InputGroupInput placeholder="add description you need" className="text-neutral-100 w-[7000px]" value={descriptionValue || ''} onChange={(e) => {
                            setDescriptionValue(e.target.value);
                        }} />
                        <InputGroupAddon>
                            <IconPencilCheck />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
            <div className='w-full py-2'>
                <Button className='w-full font-figtree text-neutral-800 bg-neutral-100 font-medium text-lg hover:bg-neutral-400 hover:text-neutral-100' onClick={() => {
                    HandleMetaDataSubmittion()
                }}>

                    {
                        loading ? (
                            <InfiniteLoader />
                        ) : (
                            <>
                                <IconPencilCheck stroke={2} height={30} width={30} className='text-lg' />Update Info
                            </>

                        )
                    }
                </Button>
            </div>
        </div>
    )
}

export default UpdateMetaData