import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog'
import React, { useRef, useState } from 'react'
import { AlertDialogHeader } from './ui/alert-dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { IconCross, IconFolder, IconPlus, IconUpload, IconX } from '@tabler/icons-react'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
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



            <div className='group relative w-full px-4 py-3 bg-neutral-900/40 hover:bg-neutral-800/50 border border-neutral-800 
                rounded-xl text-neutral-100 font-figtree font-bold text-md 
                flex items-center gap-4 hover:border-red-900/50 
                hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer'>

              {/* 1. Icon Container with "Pulse" logic */}
              <div className='relative flex items-center justify-center p-2.5 rounded-lg 
                  bg-neutral-950 border border-neutral-800 
                  group-hover:scale-110 group-hover:border-red-500/40 
                  group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]
                  transition-all duration-500'>

                {/* The Icon */}
                <IconFolder stroke={2} className='text-red-500 group-hover:text-red-500 z-10 transition-colors duration-300' size={24} />

                {/* The Internal Light Bleed */}
                <div className='absolute inset-0 bg-red-600/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
              </div>

              {/* 2. The Text with "Slide-in" motion */}
              <span className='group-hover:translate-x-1 group-hover:text-white transition-all duration-300 ease-out'>
                Create Folder
              </span>

              {/* 3. Subtle Right-Side Indicator (Optional) */}
              <div className='ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500'>
                <IconPlus size={18} className='text-red-600' />
              </div>
            </div>


          </DialogTrigger>
          <DialogContent className="w-full p-4 bg-neutral-950 text-neutral-400 border border-neutral-800 rounded-xl my-2">
            <AlertDialogHeader >
              <DialogTitle className='text-black'></DialogTitle>
            </AlertDialogHeader>
            <div className="relative group w-full max-w-md ">
              {/* The Glow Effect (Background layer) */}
              <div className="absolute -inset-0.5 bg-linear-to-r from-red-600 to-orange-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>

              <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 group-focus-within:border-neutral-600 group-focus-within:bg-black shadow-2xl">

                {/* Leading Icon */}
                <div className="pl-4 text-neutral-500 group-focus-within:text-red-500 transition-colors duration-300">
                  <IconFolder size={18} strokeWidth={2.5} />
                </div>

                {/* The Input */}
                <input
                  type="text"
                  placeholder="Create New Folder"
                  className="w-full bg-transparent border-none py-3 px-4 text-neutral-100 placeholder:text-neutral-500 focus:ring-0 focus:outline-none font-figtree text-sm"
                  value={folderName} onChange={(e) => setFolderName(e.target.value)}
                />

                {/* Keyboard Shortcut Hint (Senior UI touch) */}
                <div className="pr-4 hidden sm:block">
                  <kbd className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-neutral-500 bg-neutral-800 border border-neutral-700 rounded-md">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
            </div>
            <DialogFooter className='m-2'>
              <DialogClose asChild>
                <Button className='group relative flex items-center gap-2.5 px-6 py-2.5 
                   bg-neutral-900 border border-neutral-800 
                   text-neutral-200 font-figtree font-medium 
                   rounded-xl transition-all duration-300 
                   hover:border-red-800/60 hover:text-white 
                   hover:-translate-y-0.5 
                   active:translate-y-0 active:scale-95
                   shadow-[0_1px_2px_rgba(0,0,0,0.1)] 
                   hover:shadow-[0_8px_16px_rgba(220,38,38,0.08)]
                   overflow-hidden'>

                  {/* Inner Glow/Gradient Layer (Appears on Hover) */}
                  <span className='absolute inset-0 bg-linear-to-b from-red-600/20 to-transparent 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-500 blur-sm'/>

                  {/* Icon with scaling micro-interaction */}
                  <IconX
                    stroke={1.5}
                    size={20}
                    className='text-neutral-500 group-hover:text-red-400 group-hover:scale-110 
               transition-all duration-300 z-10'
                  />

                  {/* Button Text */}
                  <span className='relative z-10'>Cancel</span>
                </Button>
              </DialogClose>
              <Button className='group relative flex items-center gap-2.5 px-6 py-2.5 
                   bg-neutral-900 border border-neutral-800 
                   text-neutral-200 font-figtree font-medium 
                   rounded-xl transition-all duration-300 
                   hover:border-red-800/60 hover:text-white 
                   hover:-translate-y-0.5 
                   active:translate-y-0 active:scale-95
                   shadow-[0_1px_2px_rgba(0,0,0,0.1)] 
                   hover:shadow-[0_8px_16px_rgba(220,38,38,0.08)]
                   overflow-hidden' onClick={handleCreateFolder}><span className='absolute inset-0 bg-linear-to-b from-red-600/20 to-transparent 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-500 blur-sm'/>

                {/* Icon with scaling micro-interaction */}
                <IconUpload
                  stroke={1.5}
                  size={20}
                  className='text-neutral-500 group-hover:text-red-400 group-hover:scale-110 
               transition-all duration-300 z-10'
                />

                {/* Button Text */}
                <span className='relative z-10'>Create Folder</span></Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  )
}

export default CreateFolder