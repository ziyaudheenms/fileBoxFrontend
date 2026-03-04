
# FileBox - File Storage Web App

FileBox is a modern cloud storage web application built with [Next.js](https://nextjs.org), providing a secure and user-friendly interface to manage, upload, and organize your files. The project leverages a clean dashboard UI, advanced file/folder management, and real-time cloud storage statistics.

## Features

- **Dashboard Overview**: Centralized dashboard to view, search, and manage all your files and folders.
- **File & Folder Management**: Create folders, upload files, and organize your data in a hierarchical structure.
- **Grid/List View Toggle**: Switch between grid and list layouts for file/folder display.
- **Search & Filters**: Quickly search files/folders and filter by type (images, documents, videos, etc.) or sort by name, date, or size.
- **File Actions**: Mark as favorite, move to trash, view details, and more via contextual dropdown menus.
- **Drag & Drop Upload**: Easily upload files with drag-and-drop or browse functionality.
- **Storage Usage Visualization**: Real-time display of used and available storage, with breakdown by file type (images, documents, others).
- **Recent Uploads**: Quick access to recently uploaded files.
- **Authentication**: Secure access using Clerk authentication.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Dashboard Page Overview

The dashboard page (`app/(home)/dashboard/page.tsx`) is the main hub for file management. It features:

- **Sidebar Navigation**: Access to main sections (Dashboard, Images, Documents, Others, Trash, Favorites, Storage Store).
- **Main Content Area**:
	- **Breadcrumb & Search**: Home navigation, search bar, and filter/sort dropdown.
	- **File/Folder Listing**: Displayed in grid or list view, showing all items with icons, names, and quick actions.
	- **Load More**: Paginated loading for large file sets.
	- **Empty State**: Friendly message when no files/folders are present.
- **Right Panel**:
	- **Create Folder**: Instantly create new folders at the root level.
	- **Upload File**: Drag-and-drop or browse to upload files, with visual feedback.
	- **Storage Status**: Visual bar and stats for storage usage (used, free, by type).
	- **Recent Uploads**: List of recently uploaded files with size and time info.

### Dashboard UI Example

![Dashboard Screenshot](#)

> The dashboard provides a seamless experience for managing files, with intuitive controls and real-time updates. (See the attached screenshot for a visual reference.)

## Technologies Used

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS** (for styling)
- **Clerk** (authentication)
- **Axios** (API requests)
- **Sonner** (notifications)
- **Tabler Icons & Lucide React** (icons)

## Getting Started

## Getting Started


First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


You can start editing the dashboard by modifying `app/(home)/dashboard/page.tsx`. The page auto-updates as you edit the file.


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
