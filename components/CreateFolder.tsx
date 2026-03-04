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
}

function CreateFolder({ isRoot, folderID }: FolderCreateProps) {
  const { getToken } = useAuth()
  const [upLoading, setUpLoading] = useState<Boolean | false>(false)
  const [folderName, setFolderName] = useState("")
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  let APIENDPOINT = ""

  if (folderID === undefined) {
    APIENDPOINT = "http://127.0.0.1:8000/api/v1/Create/Folder/"
  }
  else {
    APIENDPOINT = `http://127.0.0.1:8000/api/v1/Create/Folder/?folderID=${folderID}`
  }

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
         

          isRoot ? router.push(`dashboard/${res.data.data}`) : router.push(`dashboard/${folderID}/${res.data.data}`)
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