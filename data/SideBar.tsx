import { IconClipboardCheckFilled, IconDashboard, IconFile, IconFileStack, IconFileStar, IconFileTypePdf, IconImageInPicture, IconStereoGlasses, IconTrash } from '@tabler/icons-react'


export const sideBarMain = [
    {
        id: 1,
        name : "DashBoard",
        path: "/dashboard",
        icon: <IconDashboard stroke={2} height={30} width={30} />
    },
    {
        id: 2,
        name : "Images",
        path: "/images",
        icon: <IconImageInPicture stroke={2} height={30} width={30}  />
    },
    {
        id: 3,
        name : "Documents",
        path: "/Documents",
        icon: <IconFileTypePdf stroke={2} height={30} width={30} />
    },
    {
        id: 4,
        name : "Others",
        path: "/others",
        icon: <IconFile stroke={2} height={30} width={30} />
    }
]


export const sideBarLibrary = [
    {
        id: 1,
        name : "Trash",
        path: "/trash",
        icon: <IconTrash  stroke={2} height={30} width={30} />
    },
    {
        id: 2,
        name : "Favorites",
        path: "/favorites",
        icon: <IconFileStar stroke={2} height={30} width={30} />
    },

    {
        id: 3,
        name : "Storage Store",
        path: "/store",
        icon: <IconStereoGlasses stroke={2} height={30} width={30} />
    },
]