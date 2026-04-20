import { createSlice , createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { number } from 'framer-motion';

interface FileFolderProps {
    id: number;
    author: string;
    size: number;
    parentFolder: string | null;
    name: string;
    uploaded_at: Date;
    updated_at: Date;
    isfolder: boolean;
    is_root_folder: boolean;
    file_url: string | null;
    file_extension: string | null;
    upload_status: string;
    celery_task_ID: string | null;
    is_trash: boolean;
    is_favorite: boolean;
}

interface fileFolderFetchProps {requesturl : string , jwtToken:string , samePage : boolean }
interface trashUpdateProps {fileFolerID : number , jwtToken :string}
interface favoriteUpdateProps {fileFolerID : number , jwtToken :string , isFavoritePage : boolean}


export const getAllFileFolders = createAsyncThunk<any , fileFolderFetchProps>(   // any -> type of the responce and fileFolderFetchProps -> type of the arguments passed to the function.
    'fileFolders/getAll',
    async({requesturl , jwtToken  , samePage} ,{rejectWithValue}) => {   //rejextWithValue -> is used to handle the rejection of the api request
        try {
            const response = await axios.get(requesturl , {
            headers: { authorization: `Bearer ${jwtToken}` },
            })
            return response.data
        }
        catch (err) {
            return rejectWithValue(err);
        }
    }
)

export const handleFileFolderTrashUpdate = createAsyncThunk<any , trashUpdateProps>(
    'filefolders/trash',

    async({fileFolerID , jwtToken } ,{rejectWithValue}) => {   //rejextWithValue -> is used to handle the rejection of the api request
        try {
            console.log("staring the trash function")
            const responce = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/trash/FolderFile/?folderFileID=${fileFolerID}` , {
            headers: {
                authorization: `Bearer ${jwtToken}`,
            },
            })
            return responce.data
        }
        catch (err) {
            return rejectWithValue(err);
        }
    }
)

export const handleFavoriteFileFolderUpdate = createAsyncThunk<any , favoriteUpdateProps>(
    'filefolders/favorite',
     async({fileFolerID , jwtToken } ,{rejectWithValue}) => {   //rejextWithValue -> is used to handle the rejection of the api request
        try {
            console.log("staring the favorites function")
            const responce = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/favorite/FolderFile/?folderFileID=${fileFolerID}` , {
            headers: {
                authorization: `Bearer ${jwtToken}`,
            },
            })
            return responce.data
        }
        catch (err) {
            return rejectWithValue(err);
        }
    }
) 

export const fileFolderSlice = createSlice({
    name:"fileFolders",
    initialState: {
        isLoading : false,
        isTrashLoading : false,
        isFavoriteLoading : false,
        specificRecordID : 0, // used to target or get the specific filefolder been targeted
        message : {
            "next_cursor" : null ,
            "previous_cursor" : null,
        },
        data : [] as FileFolderProps[],
        error : null as any  // "used to include the error object"
    },
    // Reducers are the methods used to update the states.
    reducers: {
    },
    extraReducers: (builder) => {
        builder
        .addCase(getAllFileFolders.pending , (state , action) => {
            state.isLoading = true;
            const isSamePagee = action.meta.arg.samePage
            if (!isSamePagee) {
                state.data = []
            }
        })
        .addCase(getAllFileFolders.fulfilled , (state , action) => {
            state.isLoading = false;
            const res = action.payload
            
            // if we get 5000 , want to update the fileFolder state
            if (res.status_code === 5000) {
            // Logic to append unique items
            const newData = res.data;
            const uniqueNewItems = newData.filter(
                (newItem: FileFolderProps) => !state.data.some((item) => item.id === newItem.id)
            );
            state.data = [...state.data, ...uniqueNewItems];
            // setting up the stats for pagination
            state.message.next_cursor = res.message.next_cursor
            state.message.previous_cursor = res.message.previous_cursor

            }
        })
        .addCase(handleFileFolderTrashUpdate.pending , (state , action) => {
            state.isTrashLoading = true;
            state.specificRecordID = action.meta.arg.fileFolerID
        })
        .addCase(handleFileFolderTrashUpdate.fulfilled, (state, action) => {
            const res = action.payload
            const fileFolderID = Number(action.meta.arg.fileFolerID)
            if (res.status_code === 5000) {
                state.data = state.data.filter(file => file.id !== fileFolderID)
            }

            state.isTrashLoading = false
            state.specificRecordID = 0  // cleaning the specific record state
        })
        .addCase(handleFavoriteFileFolderUpdate.pending , (state , action) => {
            state.isFavoriteLoading = true;
            state.specificRecordID = action.meta.arg.fileFolerID
        })
        .addCase(handleFavoriteFileFolderUpdate.fulfilled, (state, action) => {
            const res = action.payload
            const fileFolderID = Number(action.meta.arg.fileFolerID)
            if (res.status_code === 5000 && action.meta.arg.isFavoritePage) {
                const index = state.data.findIndex(file => file.id === fileFolderID);
                if (index !== -1) {
                    state.data[index].is_favorite = !state.data[index].is_favorite;   // updating the favorite state.
                }
            }
            else if (res.status_code === 5000 && !action.meta.arg.isFavoritePage) {
                state.data = state.data.filter(file => file.id !== fileFolderID)
            }

            state.isFavoriteLoading = false
        })
    },


})




export default fileFolderSlice.reducer; 