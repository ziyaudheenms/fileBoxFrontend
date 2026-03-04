"use client"
import React from 'react'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
// import { IconCheck, IconInfoCircle, IconPlus } from "@tabler/icons-react"
import {
  CheckIcon,
  CreditCardIcon,
  InfoIcon,
  MailIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { IconBellPlus, IconBellPlusFilled, IconFileRss } from '@tabler/icons-react';

function Navbar() {

  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  return (
    <div>
      <header className="flex justify-between items-center py-6 px-4 gap-4  w-full ">
        <div className=' w-[90%] flex items-center justify-between '>
          <div>
            <h1 className='text-neutral-200 font-figtree text-3xl font-bold'>Dashboard</h1>
            <p className='text-neutral-400 font-sans font-light'>Manage and organize your files securely</p>
          </div>
          <div className=' border border-neutral-400 p-2 rounded-lg '>
            <IconBellPlusFilled stroke={2} height={20} width={20} className='text-neutral-400' />
          </div>
        </div>
        <div className='flex justify-center items-center gap-2 border-l-2 border-neutral-600 px-2'>
          <SignedOut>
            <button className="bg-blue-600 text-white py-1 px-3 rounded-lg  hover:cursor-pointer hover:opacity-80" onClick={() => {
              router.push("/sign-in")
            }}>
              Sign In
            </button>
            <button className="bg-black text-white py-1 px-3 rounded-lg hover:cursor-pointer hover:opacity-80" onClick={() => {
              router.push("/sign-up")
            }}>
              Sign Up
            </button>
          </SignedOut>
          <SignedIn>
            <div>
              <h1 className='text-lg font-medium font-figtree text-neutral-200 text-left'>{user?.username}</h1>
              <p className='text-sm font-sans text-neutral-400 text-right'>Free Plan</p>
            </div>
            <UserButton />
          </SignedIn>
        </div>
      </header>
    </div>
  )
}

export default Navbar