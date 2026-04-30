'use client'
import React, { useEffect, useState } from 'react'
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
import { Button } from './ui/button'
import { useAuth } from '@clerk/nextjs'
import { IconAdjustmentsShare, IconBiohazard, IconEye, IconEyeOff, IconLock, IconSettings, IconToggleLeftFilled, IconToggleRightFilled, IconX } from '@tabler/icons-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { getFileFolderSettings, updateSecurity } from '@/features/FileFolderSecuritySlice'
import { toast } from 'sonner'
import InfiniteLoader from './InfiniteLoader'

interface fileFolderSecurityProps { is_password_protected?: boolean, is_security_critical?: boolean, password?: string }

function Settings({ fileFolderID }: { fileFolderID: string | undefined }) {
  const { getToken } = useAuth()
  const { settingData, securitySettingsPassword, securitySettingStatus, settingUpdateLoading } = useAppSelector((state) => state.fileFolderSecurityPolicy)
  const dispatch = useAppDispatch()
  const [toggleState, setToggleState] = useState(settingData.is_password_protected);
  const [criticalState, setCriticalState] = useState(settingData.is_critical);
  const [password, setPassword] = useState('')
  const [visiblePassword, setvisiblePassword] = useState(true)

  const getFileFolderSecurity = async () => {
    const jwtToken = await getToken()
    dispatch(getFileFolderSettings({
      requesturl: `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/security/?fileFolderID=${fileFolderID}`,
      jwtToken: jwtToken ? jwtToken : "",
    }))
  }

  const updateFileFolderSecurity = async () => {
    const jwtToken = await getToken()

    //Preparing the request payload based on the changes made by the user. Only the changed fields will be sent in the request to optimize it and also to avoid over writing any unchanged data in the backend.
    let request_payload = {} as fileFolderSecurityProps

    if (toggleState && !securitySettingsPassword && password === '') {
      toast.info('enter the password');
      return;
    }

    if (toggleState != settingData.is_password_protected) {
      request_payload['is_password_protected'] = toggleState
    }
    if (criticalState != settingData.is_critical) {
      request_payload['is_security_critical'] = criticalState
    }

    if (password != '') {
      request_payload['password'] = password
    }

    if (criticalState && !toggleState && password === '') {
      toast.info('enable password and enter the password first before marking as critical');
      return;
    }


    dispatch(updateSecurity({
      requesturl: `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/security/policy?fileFolderID=${fileFolderID}`,
      jwtToken: jwtToken ? jwtToken : "",
      request_payload: request_payload
    }))
  }


  useEffect(() => {
    getFileFolderSecurity()
  }, [])

  useEffect(() => {
    if (securitySettingStatus.status_code === 5000) {
      toast.success(securitySettingStatus.message)
      getFileFolderSecurity()
    }
    
  }, [securitySettingStatus.status_code])


  return (
    <div className='w-[80%]'>
      <Dialog>
        <DialogTrigger asChild>
          {/* Keep your existing trigger, it's already well-styled */}
          <div className='group relative w-full px-4 py-3 bg-neutral-900/40 hover:bg-neutral-800/50 border border-neutral-800 rounded-xl text-neutral-100 font-figtree font-bold text-md flex items-center gap-4 hover:border-red-900/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer'>
            <div className='relative flex items-center justify-center p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 group-hover:scale-110 group-hover:border-red-500/40 transition-all'>
              <IconSettings className='text-red-500' size={24} />
            </div>
            <span className='group-hover:translate-x-1 transition-transform'>Security Settings</span>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className='text-xl text-white font-figtree'>Security Configuration</DialogTitle>
            <DialogDescription className='text-neutral-500'>
              Define access policies and password protection for this resource.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Policy Toggles */}
            <div className="space-y-4">
              {/* Toggle Item 1 */}
              <div className="flex items-center justify-between p-4 bg-neutral-900/30 rounded-xl border border-neutral-800/50 hover:border-neutral-700 transition-all duration-300 ease-out active:translate-y-0 active:scale-95">
                <span className='text-neutral-200 font-medium'>Enable Password Protection</span>
                <button onClick={() => setToggleState(!toggleState)} className="transition-transform hover:scale-110">
                  {toggleState ?
                    <IconToggleRightFilled className='h-8 w-8 text-red-500' /> :
                    <IconToggleLeftFilled className='h-8 w-8 text-neutral-700' />
                  }
                </button>
              </div>

              {/* Toggle Item 2 */}
              <div className={`flex items-center justify-between p-4 bg-neutral-900/30 rounded-xl border ${criticalState ? 'border-red-500 hover:border-red-500' : 'border-neutral-800/50 hover:border-neutral-700'} transition-all duration-300 ease-out active:translate-y-0 active:scale-95`}>
                <span className='text-neutral-200 font-medium flex items-center gap-2'> <IconBiohazard stroke={1.5} />Mark as Critical</span>
                <button onClick={() => setCriticalState(!criticalState)} className="transition-transform hover:scale-110">
                  {criticalState ?
                    <IconToggleRightFilled className='h-8 w-8 text-red-500' /> :
                    <IconToggleLeftFilled className='h-8 w-8 text-neutral-700' />
                  }
                </button>
              </div>
            </div>

            {/* Helper Note */}
            <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl">
              <p className="text-sm text-red-400/80 leading-relaxed">
                <span className="font-bold text-red-500">Note:</span> Critical files require password access even for the author.
              </p>
            </div>
            {/* Password Input (Animated) */}
            {toggleState && (
              <div className="relative group w-full flex items-center gap-2">
                {/* The Glow Effect (Background layer) */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-red-600 to-orange-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                <div className="relative w-full flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 group-focus-within:border-neutral-600 group-focus-within:bg-black shadow-2xl justify-between">
                  {/* Leading Icon */}
                  <div className="pl-4 text-neutral-500 group-focus-within:text-red-500 transition-colors duration-300">
                    <IconLock size={18} strokeWidth={2.5} />
                  </div>
                  {/* The Input */}
                  <input
                    type={visiblePassword ? "text" : "password"}
                    placeholder="Enter the password"
                    className="w-full bg-transparent border-none py-3 px-4 text-neutral-100 placeholder:text-neutral-500 focus:ring-0 focus:outline-none font-figtree text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {
                  visiblePassword ? (
                    <div className="relative z-50" onClick={() => { setvisiblePassword(false); }}>
                      <IconEyeOff strokeWidth={2} className='text-red-500 h-10 w-8 cursor-pointer' />
                    </div>

                  ) : (
                    <div className="relative z-50" onClick={() => {
                      setvisiblePassword(true)
                    }}>
                      <IconEye strokeWidth={2} className='text-neutral-500 h-10 w-8 cursor-pointer' />
                    </div>
                  )
                }
              </div>
            )}
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
                   overflow-hidden' onClick={() => {
                    setToggleState(settingData.is_password_protected)
                    setCriticalState(settingData.is_critical)
                   }}>
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
                   overflow-hidden' onClick={() => {
                updateFileFolderSecurity()
              }} >

              {
                settingUpdateLoading ? (
                  <InfiniteLoader />
                ) : (
                  <div className='flex items-center gap-2'>
                    <IconAdjustmentsShare
                      stroke={1.5}
                      size={20}
                      className='text-neutral-500 group-hover:text-red-400 group-hover:scale-110
                transition-all duration-300 z-10'

                    />

                    <span className='relative z-10'>Update the Policy</span>
                  </div>
                )
              }
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Settings