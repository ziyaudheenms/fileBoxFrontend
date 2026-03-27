import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog'
import React, { useRef, useState } from 'react'
import { AlertDialogHeader } from './ui/alert-dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { IconFolder } from '@tabler/icons-react'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
interface FolderCreateProps {
  isRoot: boolean;
  folderID?: string;
  shareUUID?: string;
  parentHash?: string;
}

function CreateFolder({ isRoot, folderID, shareUUID, parentHash }: FolderCreateProps) {
  const { getToken } = useAuth()
  const [upLoading, setUpLoading] = useState<Boolean | false>(false)
  const [folderName, setFolderName] = useState("")
  const [progress, setProgress] = useState(0)
  const router = useRouter()


  let APIURL = `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/Create/Folder/`

  const params = new URLSearchParams();

  if (folderID) {
    params.append('folderID', folderID)
  }

  if (shareUUID) {
    params.append("sharableUUID", shareUUID)
  }

  if (parentHash) {
    params.append("parentHash", parentHash)
  }

  const queryString = params.toString()

  let APIENDPOINT = queryString ? `${APIURL}?${queryString}` : APIURL;


  const handleCreateFolder = async (e: any) => {
    e.preventDefault()
    setUpLoading(true)

    const jwtToken = await getToken()

    axios.post(APIENDPOINT, {

      name: folderName

    },
      {

        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      }).then((res) => {

        console.log(res);

        if (res.data.status_code == 5000) {
          toast.success("Folder Successfully Created")
          if (shareUUID) {
            if (parentHash) {
              //            http://localhost:3000/sharable/folder/8e11a9ef-99b9-447b-9efd-18fc7a516657/kpB4Aqe3
              router.push(`sharable/folder/${shareUUID}/${res.data.data}`)
            }
            else {
              router.push(`${shareUUID}/${res.data.data}`)
            }
          }
          else {
            router.push(`dashboard/${res.data.data}`) // Redirecting for the actual users.........
          }
        }
        else if (res.data.status_code == 4001) {
          toast.success("Folder Creation Failed: Folder with Same Name Already Exists")
        }
        else { }

      }).catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setUpLoading(false);
        setFolderName("");
      })
  }


  return (
    <div>
      <Dialog>
        <form>
          <DialogTrigger asChild>
            <div className=' w-full px-5 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-figtree font-bold text-md flex items-center gap-2'><IconFolder stroke={2} height={40} width={40} className='p-2 text-neutral-400 bg-neutral-800 rounded-lg' />Create Folder</div>
          </DialogTrigger>
          <DialogContent className="w-full p-4 bg-neutral-950 text-neutral-400 border border-neutral-800 rounded-xl my-2">
            <AlertDialogHeader >
              <DialogTitle className='text-black'></DialogTitle>
            </AlertDialogHeader>
            <div className='w-full py-4'>
              <InputGroup>
                <InputGroupInput className='text-neutral-100' placeholder='Enter the Name Of Folder' value={folderName} onChange={(e) => setFolderName(e.target.value)} />
                <InputGroupAddon>
                  <IconFolder />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className='bg-'>Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  )
}

export default CreateFolder