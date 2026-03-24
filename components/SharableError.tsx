import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { IconDashboard, IconPasswordUser } from '@tabler/icons-react';
import { SharableErrorType } from '@/data/ErrorStateData';


function SharableError({error}:{error:SharableErrorType}) {
    const ERRORCONFIG = {
       "NO-ACCESS" : {
            title: "You Have No Access !!",
            description: "Owner of the resource doesnt provided you with the access to it",
            avatar: "/NoAccess.gif",
            btnTxt : "Go to Dashboard",
            btnIconAvatar : <IconDashboard stroke={2} className='h-20'/>
        },
        "LINK-EXPIRED" : {
            title: "Sorry , Its Allready Expired !!!",
            description: "The File has reached its expiry time set by the owner...",
            avatar: '/expired.gif',
            btnTxt : "Go to Dashboard",
            btnIconAvatar : <IconDashboard stroke={2} className='h-20'/>
        },
        "INCORRECT-PASSWORD" : {
            title: "It's A Wrong Password..... !!!",
            description: "Opps ! Password doesnt matches what you provided...",
            avatar: '/IncorrectPassword.gif',
            btnTxt : "Retry Password",
            btnIconAvatar : <IconPasswordUser stroke={2} className='h-20'/>
        },
        "ACCESS-LIMIT-CROSSED" : {
            title: "View Count Crossed It's Limit !!!",
            description: "No of times you can visit crossed the limit...",
            avatar: '/CountLimited.gif',
            btnTxt : "Go to Dashboard",
            btnIconAvatar : <IconDashboard stroke={2} className='h-20'/>
        },
        "NOT-FOUND" : {
            title: "We Can't Find It !!!",
            description: "The File or Folder you are looking for is not available in our system...",
            avatar: '/NotFound.gif',
            btnTxt : "Go to Dashboard",
            btnIconAvatar : <IconDashboard stroke={2} className='h-20'/>
        }
    }
    const currentError = ERRORCONFIG[error] //configured the error's type using the type SHARABLEERRORTYPE and created a config object to store the details of each error type and then accessed the current error's details using the error prop passed to the component.
  return (
    <div className='w-full h-full flex items-center flex-col justify-center'>
      <div>
        <Image src={currentError.avatar} alt={currentError.title} className='h-96 w-96' height={500} width={500} />
      </div>
      <div className='pb-4'>
        <motion.div
          animate={{
            y: [0, -15, 0], // Moves up 15px and back to start
          }}
          transition={{
            duration: 3,      // Time for one full loop
            repeat: Infinity, // Loop forever
            ease: "easeInOut" // Smooth acceleration/deceleration
          }}
        >
          <h3 className='text-3xl text-center font-bold font-sans text-neutral-100'>You Have No Access !!</h3>


        </motion.div>
        <h3 className='text-neutral-400 text-center font-figtree font-light text-lg'>{currentError.description}</h3>
      </div>
        <Button className='py-2 '>
            {currentError.btnIconAvatar}
            {currentError.btnTxt}
        </Button>
    </div>
  )
}

export default SharableError