"use client"
import React, { useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { IconFileUpload, IconUpload } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { encryptFileContent, encryptFileKey, toBase64 } from '@/lib/crypto/keys';
import { fileUploadFlow } from '@/lib/crypto/workflows/fileUpload';

interface FileUploadProps {
    isRoot: boolean;
    folderID?: string | undefined;
    shareUUID?: string | undefined;
    parentHash?: string | undefined;
    closeToolsDrawer?: () => void;
}

function FileUpload({ isRoot, folderID , shareUUID , parentHash, closeToolsDrawer }: FileUploadProps) {
    const { getToken } = useAuth()
    const [upLoading, setUpLoading] = useState<Boolean | false>(false)
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0)
    const router = useRouter()

    const APIURL = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/Create/Image/`

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

    const APIENDPOINT = queryString ? `${APIURL}Chunk/?${queryString}` : `${APIURL}Chunk/`;
    const APIENDPOINTFORCHUNKED = queryString
        ? `${APIURL}Chunk/Join/?${queryString}`
        : `${APIURL}Chunk/Join/`;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUpLoading(true);
        setProgress(0);

        try {
            if (!file.type.includes("image/")) {
                toast.error("Only Image files are allowed");
                return;
            }

            const encryptionFolderID = folderID ?? parentHash ?? shareUUID;
            if (!encryptionFolderID) {
                toast.error("Select a folder before uploading an encrypted file.");
                return;
            }

            const jwtToken = await getToken();
            if (!jwtToken) {
                toast.error("Your session has expired. Please sign in again.");
                return;
            }

            const keys = await fileUploadFlow(file, encryptionFolderID);
            if (!keys) return;

            const encryptedFileKey = await encryptFileKey(keys.fileKey, keys.collectionKey);
            const encryptedContent = await encryptFileContent(file, keys.fileKey);
            if (!encryptedFileKey || !encryptedContent) {
                toast.error("Could not encrypt the file for upload.");
                return;
            }

            const [encryptedFileKeyBase64, fileKeyNonceBase64, streamHeaderBase64] = await Promise.all([
                toBase64(encryptedFileKey.encryptedFileKey),
                toBase64(encryptedFileKey.nonce),
                toBase64(encryptedContent.header),
            ]);
            if (!encryptedFileKeyBase64 || !fileKeyNonceBase64 || !streamHeaderBase64) {
                toast.error("Could not prepare encryption data for upload.");
                return;
            }

            const fileId = crypto.randomUUID();
            const totalChunks = Math.max(1, Math.ceil(file.size / (3 * 1024 * 1024)));
            const reader = encryptedContent.encryptedStream.getReader();

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const { done, value } = await reader.read();
                if (done || !value) {
                    throw new Error(`Encrypted stream ended before chunk ${chunkIndex + 1} of ${totalChunks}.`);
                }

                const chunkFormData = new FormData();
                chunkFormData.append("chunk", new Blob([value.slice().buffer], { type: "application/octet-stream" }));
                chunkFormData.append("chunkIndex", chunkIndex.toString());
                chunkFormData.append("totalChunks", totalChunks.toString());
                chunkFormData.append("fileId", fileId);
                chunkFormData.append("fileName", file.name);

                const chunkResponse = await fetch(APIENDPOINT, {
                    method: "POST",
                    headers: { authorization: `Bearer ${jwtToken}` },
                    body: chunkFormData,
                });
                if (!chunkResponse.ok) {
                    throw new Error(`Chunk ${chunkIndex + 1} upload failed with HTTP ${chunkResponse.status}.`);
                }

                setProgress(Math.round(((chunkIndex + 1) / totalChunks) * 90));
            }

            const extraChunk = await reader.read();
            if (!extraChunk.done) {
                throw new Error("Encrypted stream produced more chunks than expected.");
            }

            const joinResponse = await fetch(APIENDPOINTFORCHUNKED, {
                method: "POST",
                headers: {
                    authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    fileName: file.name,
                    fileSize: file.size,
                    fileExtenstion: file.type,
                    encryptedFileKey: encryptedFileKeyBase64,
                    fileKeyNonce: fileKeyNonceBase64,
                    encryptionHeader: streamHeaderBase64,
                }),
            });
            if (!joinResponse.ok) {
                throw new Error(`Chunked upload finalization failed with HTTP ${joinResponse.status}.`);
            }

            const result: { status_code?: number; data?: string } = await joinResponse.json();
            if (result.status_code !== 5000 || !result.data) {
                toast.error("File upload failed.");
                return;
            }

            setProgress(100);
            if (shareUUID) {
                router.push(parentHash
                    ? `/preview/${result.data}`
                    : `sharable/folder/${shareUUID}/${result.data}`);
            } else {
                router.push(`/images/${result.data}`);
            }
            toast.success("File Successfully Added to Queue");
        } catch (error) {
            console.error("File upload failed:", error);
            toast.error("Could not upload file.");
        } finally {
            setUpLoading(false);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    return (

        <div onClick={() => closeToolsDrawer && closeToolsDrawer()} className='group border border-neutral-200 dark:border-neutral-800 py-5 px-5 rounded-xl flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:border-red-900/50 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer'>
            <div className='flex items-center gap-2 '>
                <div className='relative flex items-center justify-center p-2.5 rounded-lg 
                  bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 
                  group-hover:scale-110 group-hover:border-red-500/40 
                  group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]
                  transition-all duration-500'>
                    <IconUpload stroke={2} height={25} width={25} className='text-red-500 group-hover:text-red-500 z-10 transition-colors duration-300' />
                </div>
                <div>
                    <h3 className='font-figtree text-neutral-900 dark:text-neutral-100 text-lg font-medium tracking-tight group-hover:text-neutral-900 dark:group-hover:text-white transition-colors'>Upload File</h3>
                    <p className='font-sans text-neutral-500 text-xm'>Drag and drop or browse</p>
                </div>
            </div>
            <div className='border-2 border-neutral-300 dark:border-neutral-800 border-dashed rounded-xl flex flex-col justify-center items-center  p-6'>
                <div className='bg-neutral-100 dark:bg-neutral-800 p-2 rounded-full '>
                    <IconFileUpload stroke={2} height={30} width={30} className='text-neutral-500 dark:text-neutral-400' />
                </div>
                <h3 className='text-neutral-900 dark:text-neutral-100 font-figtree font-medium mt-2'>Click to upload</h3>
                <p className='text-neutral-500 dark:text-neutral-400 font-sans text-sm pb-4'>or drag and drop your files</p>
                <div className='w-full'>
                    <input
                        type="file"
                        ref={inputRef}
                        onChange={handleFileUpload}
                        onClick={() => closeToolsDrawer && closeToolsDrawer()}
                        className='w-full text-neutral-700 dark:text-neutral-300 file:bg-neutral-100 file:dark:bg-neutral-800 file:text-neutral-900 file:dark:text-neutral-100 file:border-none file:px-4 file:py-2 file:rounded-xl file:cursor-pointer'
                    />
                    {
                        upLoading ? (
                            <div className='border border-neutral-200 dark:border-neutral-800 py-2 px-2 rounded-xl mt-4 bg-neutral-50 dark:bg-neutral-900/30'>
                                <div className='rounded-xl flex items-center gap-3'>
                                    <div className='bg-neutral-200 dark:bg-neutral-800 p-2 rounded-lg '>
                                        <IconFileUpload stroke={2} height={20} width={20} className='text-neutral-500 dark:text-neutral-400' />
                                    </div>
                                    <div className='flex flex-col gap-1 w-full'>
                                        <p className='text-neutral-600 dark:text-neutral-400 font-sans text-xs'>Uploading file {progress}%</p>
                                        <div className='w-full h-2 rounded-full bg-neutral-300 dark:bg-neutral-800'>
                                            <div style={{ width: `${progress}%` }} className={`bg-neutral-900 dark:bg-neutral-100 rounded-full h-2 transition-all`}></div>
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