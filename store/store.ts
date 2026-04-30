import {configureStore} from '@reduxjs/toolkit'
import fileFolderReducer from "@/features/FileFoldersSlice"
import fileFolderSecurityReducer from "@/features/FileFolderSecuritySlice"

export const store = configureStore({
    reducer: {
        fileFolders : fileFolderReducer,
        fileFolderSecurityPolicy : fileFolderSecurityReducer,     
    }
})


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch