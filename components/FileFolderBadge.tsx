import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  avatar: string;
  username: string;
}

// Generates consistent colors based on the username string
const getDynamicColors = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    bg: `hsla(${hue}, 80%, 92%, 1)`,
    border: `hsla(${hue}, 70%, 40%, 0.4)`,
    text: `hsla(${hue}, 70%, 30%, 1)`,
  };
};

function FileFolderBadge({ avatar, username }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getDynamicColors(username);

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // This spring configuration mimics high-end OS interfaces (like macOS/iOS)
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        mass: 0.8
      }}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
      className="inline-flex items-center rounded-full border p-1 cursor-pointer shadow-sm select-none"
    >
      {/* Avatar Container - Layout ensures it slides smoothly */}
      <motion.div layout className="flex-shrink-0">
        <Avatar className="h-5 w-5 border border-white/40">
          <AvatarImage
            src={avatar}
            alt={username}
            className={`transition-all duration-500 ${isHovered ? 'grayscale-0 scale-110' : 'grayscale'}`}
          />
          <AvatarFallback className="text-[10px] font-bold">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {isHovered && (
          <motion.div
            layout
            initial={{ opacity: 0, x: -5, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -5, width: 0 }}
            transition={{
              opacity: { duration: 0.2 },
              layout: { type: "spring", stiffness: 350, damping: 30 }
            }}
            className="overflow-hidden"
          >
            <span
              className="px-3 pb-1 font-sans font-medium text-sm whitespace-nowrap inline-block"
              style={{ color: colors.text }}
            >
              {username}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FileFolderBadge;