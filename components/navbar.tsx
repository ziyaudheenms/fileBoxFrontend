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
      <header className="flex justify-between items-center py-4 sm:py-6 px-3 sm:px-4 gap-2 sm:gap-4 w-full">
        <div className='flex-1 min-w-0 flex items-center justify-between gap-2 mr-2'>
          <div className='min-w-0'>
            <h1 className='text-neutral-900 dark:text-neutral-200 font-figtree text-xl sm:text-3xl font-bold truncate'>Dashboard</h1>
            <p className='text-neutral-500 dark:text-neutral-400 font-sans font-light text-xs sm:text-sm truncate'>Manage and organize your files securely</p>
          </div>
          <div className='border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-transparent p-1.5 sm:p-2 rounded-lg flex-shrink-0'>
            <IconBellPlusFilled stroke={2} height={18} width={18} className='text-neutral-400 dark:text-neutral-400' />
          </div>
        </div>
        <div className='flex justify-center items-center gap-2 border-l-2 border-neutral-300 dark:border-neutral-600 pl-2 sm:px-2 flex-shrink-0'>
          <SignedOut>
            <button className="bg-blue-600 text-white text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-lg hover:cursor-pointer hover:opacity-80" onClick={() => {
              router.push("/sign-in")
            }}>
              Sign In
            </button>
            <button className="bg-black text-white text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-lg hover:cursor-pointer hover:opacity-80" onClick={() => {
              router.push("/sign-up")
            }}>
              Sign Up
            </button>
          </SignedOut>
          <SignedIn>
            <div className='hidden sm:block text-right'>
              <h1 className='text-sm sm:text-base font-medium font-figtree text-neutral-900 dark:text-neutral-200 truncate max-w-[120px]'>{user?.username}</h1>
              <p className='text-xs font-sans text-neutral-500 dark:text-neutral-400'>Free Plan</p>
            </div>
            <UserButton />
          </SignedIn>
        </div>
      </header>
    </div>
  )
}

export default Navbar