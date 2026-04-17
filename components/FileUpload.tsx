"use client"
import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { IconFileUpload, IconUpload } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const chunkSize = 1024 * 1024 * 2;

interface FileUploadProps {
    isRoot: boolean;
    folderID?: string | undefined;
    shareUUID?: string | undefined;
    parentHash?: string | undefined;


}

function FileUpload({ isRoot, folderID , shareUUID , parentHash }: FileUploadProps) {
    const { getToken } = useAuth()
    const [upLoading, setUpLoading] = useState<Boolean | false>(false)
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0)
    const [fileID, setFileID] = useState("")
    const router = useRouter()

    let APIENDPOINTFORCHUNKED = ""

    let APIURL =  `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/Create/Image/`

    const params = new URLSearchParams();

    if (folderID) {
        params.append('folderID' , folderID)
    }

    if (shareUUID) {
        params.append("sharableUUID" , shareUUID)
    }

    if (parentHash) {
        params.append("parentHash" , parentHash)
    }

    const queryString = params.toString()

    let APIENDPOINT = queryString ? `${APIURL}?${queryString}` : APIURL;

    // !isRoot ? APIENDPOINT = "http://127.0.0.1:8000/api/v1/Create/Image/" : APIENDPOINT = `http://127.0.0.1:8000/api/v1/Create/Image/?folderID=${folderID}`
    // !isRoot ? APIENDPOINTFORCHUNKED = "http://127.0.0.1:8000/api/v1/Create/Image/Chunk/Join/" : APIENDPOINTFORCHUNKED = `http://127.0.0.1:8000/api/v1/Create/Image/Chunk/Join/?folderID=${folderID}`

    const chunkUploader = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpLoading(true)
        if (e.target.files && e.target.files[0]) {
            const jwtToken = await getToken()
            const file = e.target.files[0]
            // localStorage.setItem(file);
            localStorage.setItem("File_Name", file.name);
            localStorage.setItem("File_Size", file.size.toString());
            localStorage.setItem("File_Extension", file.type);

            if (file.type.includes("image/")) {

                if (file.size <= chunkSize) {

                    const formData = new FormData()
                    formData.append("image", e.target.files[0])
                    await axios.post(APIENDPOINT, formData, {
                        headers: {
                            authorization: `Bearer ${jwtToken}`,
                        },
                    }).then((res) => {
                        console.log(res);
                        if (res.data.status_code === 5000) {
                            if (shareUUID != null) {
                                if (parentHash != null) {
                                    // http://localhost:3000/sharable/folder/8e11a9ef-99b9-447b-9efd-18fc7a516657/kpB4Aqe3
                                    router.push(`/preview/${res.data.data}`)
                                }
                                else {
                                    router.push(`sharable/folder/${shareUUID}/${res.data.data}`)
                                }
                            }
                            else {
                                router.push(`/images/${res.data.data}`) // Redirecting for the actual users.........
                            }
                            toast.success("File Successfully Added to Queue")
                        } else {
                            toast.error("oops! Some error have happened")
                        }
                    }).catch((err) => {
                        console.log(err)
                        toast.error("oops! Some error have happened")
                    }).finally(() => {
                        setUpLoading(false);
                    })



                } else {
                    const totalChunks = Math.ceil(file.size / chunkSize)
                    const fileID = crypto.randomUUID()
                    setFileID(fileID)
                    for (let i = 0; i < totalChunks; i++) {
                        console.log(i);

                        const start = i * chunkSize
                        const end = Math.min(file.size, start + chunkSize)

                        const chunk = file.slice(start, end);
                        console.log(chunk);

                        const formData = new FormData()
                        formData.append("chunk", chunk);
                        formData.append("chunkIndex", i.toString());
                        formData.append("totalChunks", totalChunks.toString());
                        formData.append("fileId", fileID);
                        formData.append("fileName", file.name);
                        await axios.post("http://127.0.0.1:8000/api/v1/Create/Image/Chunk/", formData, {
                            headers: {
                                authorization: `Bearer ${jwtToken}`,
                            },
                        })
                            .then((res) => {
                                console.log(res);
                                // toast.success("File Successfully Added to Queue")
                                setProgress((prevProgress) => {
                                    const nextProgress = Math.round(((i + 1) / totalChunks) * 100);
                                    console.log("Setting progress to:", nextProgress); // Verify in console
                                    return nextProgress;
                                });
                            }).catch((err) => {
                                console.log(err)
                                toast.error("oops! Some error have happened")
                            })
                        setTimeout(() => { }, 1000);
                    }
                    await axios.post(APIENDPOINTFORCHUNKED, {
                        fileId: fileID,
                        fileName: localStorage.getItem('File_Name'),
                        fileSize: localStorage.getItem('File_Size'),
                        fileExtenstion: localStorage.getItem("File_Extension")
                    },
                        {
                            headers: {
                                authorization: `Bearer ${jwtToken}`,
                            },
                        }).then((res) => {
                            console.log(res);
                            if (res.data.status_code === 5000) {
                                router.push(`/images/${res.data.data}`)
                                toast.success("File Successfully Added to Queue")
                            } else {
                                toast.error("oops! Some error have happened")
                            }
                        })
                    setUpLoading(false)
                    setProgress((prevProgress) => {
                        return 0;
                    });
                }

            }
            else {
                toast.error("Only Image files are allowed")
                setUpLoading(false)
            }
        }
    }

    return (

        <div className='group border border-neutral-800 py-5 px-5 rounded-xl flex flex-col gap-4 bg-neutral-900/40 hover:border-red-900/50 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer'>
            <div className='flex items-center gap-2 '>
                <div className='relative flex items-center justify-center p-2.5 rounded-lg 
                  bg-neutral-950 border border-neutral-800 
                  group-hover:scale-110 group-hover:border-red-500/40 
                  group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]
                  transition-all duration-500'>
                    <IconUpload stroke={2} height={25} width={25} className='text-red-500 group-hover:text-red-500 z-10 transition-colors duration-300' />
                </div>
                <div>
                    <h3 className='font-figtree text-neutral-100 text-lg font-medium tracking-tight group-hover:text-white transition-colors'>Upload File</h3>
                    <p className='font-sans text-neutral-500 text-xm'>Drag and drop or browse</p>
                </div>
            </div>
            <div className='border-2 border-neutral-800 border-dashed rounded-xl flex flex-col justify-center items-center  p-6'>
                <div className='bg-neutral-800 p-2 rounded-full '>
                    <IconFileUpload stroke={2} height={30} width={30} className='text-neutral-400' />
                </div>
                <h3 className='text-neutral-100 font-figtree font-medium'>Click to upload</h3>
                <p className='text-neutral-400 font-sans text-sm'>or drag and drop your files</p>
                <div className='w-full'>
                    <input
                        type="file"
                        ref={inputRef}
                        onChange={chunkUploader}
                        className='w-full'
                    />
                    {
                        upLoading ? (
                            <div className='border border-neutral-800 py-2 px-2 rounded-xl'>
                                <div className='rounded-xl flex items-center gap-3'>
                                    <div className='bg-neutral-800 p-2 rounded-lg '>
                                        <IconFileUpload stroke={2} height={20} width={20} className='text-neutral-400' />
                                    </div>
                                    <div className='flex flex-col gap-1 w-full'>
                                        <p className='text-neutral-400 font-sans text-sm'>Uploading file {progress}%</p>
                                        <div className='w-full h-2 rounded-full bg-neutral-800'>
                                            <div className={`w-[${progress}%] bg-neutral-100 rounded-full h-2`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                            </div>
                        )
                    }
                </div>
            </div>

        </div>



    );
}

export default FileUpload;