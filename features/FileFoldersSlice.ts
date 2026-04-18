import { createSlice , createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

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

interface fileFolderFetchProps {requesturl : string , jwtToken:string }


export const getAllFileFolders = createAsyncThunk<any , fileFolderFetchProps>(   // any -> type of the responce and fileFolderFetchProps -> type of the arguments passed to the function.
    'fileFolders/getAll',
    async({requesturl , jwtToken } ,{rejectWithValue}) => {   //rejextWithValue -> is used to handle the rejection of the api request
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

export const fileFolderSlice = createSlice({
    name:"fileFolders",
    initialState: {
        isLoading : false,
        isempty: false,
        data : [] as FileFolderProps[],
        error : null as any  // "used to include the error object"
    },
    // Reducers are the methods used to update the states.
    reducers: {
    },
    extraReducers: (builder) => {
        builder
        .addCase(getAllFileFolders.pending , (state) => {
            state.isLoading = true;
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
            }
            if (res.status_code === 5002) {
                state.isempty = true;
            }
        })
        .addCase(getAllFileFolders.rejected, (state, action) => {
            state.isempty = false;
            state.error = action.payload;
        });
    },


})




export default fileFolderSlice.reducer; 