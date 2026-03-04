import { IconBell } from "@tabler/icons-react"
import { RefreshCcwIcon } from "lucide-react"
import { IconNotesOff } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { motion } from 'framer-motion';

export function EmptyPage() {
    
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
                    <IconNotesOff width={96} height={96} className="text-neutral-200 mx-auto" />
                </div>

            </motion.div>
            <div>
                <h2 className="text-2xl font-semibold mt-4 text-center text-neutral-200">No Files or Folders</h2>
                <p className="text-neutral-400 font-sans font-light">You haven't created any files or folders yet.</p>
            </div>
        </div>
    )
}
