import { IconDownload } from '@tabler/icons-react'
import React from 'react'
import { Button } from './ui/button'

interface Props {
    fileUrl: string | null;
    fileName: string;
}


function Download({ fileUrl, fileName }: Props) {
    return (
        <Button className='w-full font-figtree text-neutral-800 bg-neutral-100 font-medium text-lg hover:bg-neutral-400 hover:text-neutral-100' onClick={() => {
                  if (fileUrl) {
                    // Since our resource (the image) is been stored in an external storage , as a part of security , we have to fetch it , create a blob and temp url for downloading the image......
                    fetch(fileUrl).then(responce => responce.blob()).then(blob => {
                        const blobURL = window.URL.createObjectURL(blob);
                        const link = document.createElement("a")
                        link.href = blobURL
                        link.download = fileName || "download"
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobURL);
                        console.log("Download triggered!");

                    })
                  }
                }}> <IconDownload stroke={2} height={30} width={30} className='text-lg' />Download</Button>
    )
}

export default Download