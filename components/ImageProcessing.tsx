import { IconProgressDown } from '@tabler/icons-react'
import React from 'react'
import { motion } from 'framer-motion';


interface Props {
    parent : string
}

function ImageProcessing({ parent}: Props) {
  return (
    <div className="flex items-center justify-center flex-col">
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
                <div className="p-2 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-lg">
                    <IconProgressDown width={parent === "image" ? 50 : 30} height={parent === "image" ? 50 : 30} className="text-neutral-200 mx-auto" />
                </div>
                
            </motion.div>
            {
                parent == "image" ? (
                    <div>
                <h2 className="text-2xl font-semibold mt-4 text-center text-neutral-200">Processing the Image</h2>
                <p className="text-neutral-400 font-sans font-light">We Optimize It Better For You</p>
            </div>
                ) : (
                    <div></div>
                )
            }
            
    </div>
  )
}

export default ImageProcessing