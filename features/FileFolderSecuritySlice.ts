/* 
  Redux Toolit internally uses ''Immer'' which helps as to automate
  the process of copying the state for updating it , since the state in redux is immutable.
*/
import { createSlice , createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


interface fileFolderSecurityProps {is_password_protected : boolean , is_critical:boolean ,is_locked:boolean ,session_duration: number}
interface fileFolderSecurityFetchProps {requesturl : string , jwtToken: string , request_payload? : {
    is_password_protected? : boolean ,
    is_security_critical? : boolean ,
    password? : string,
    is_locked? : boolean ,
    session_duration? : number ,
} }




export const getFileFolderSettings = createAsyncThunk<any , fileFolderSecurityFetchProps>(   // any -> type of the responce and fileFolderSecurityFetchProps -> type of the arguments passed to the function.
    'fileFolders/settings',
    async({requesturl , jwtToken  } ,{rejectWithValue}) => {   //rejextWithValue -> is used to handle the rejection of the api request
        try {
            const response = await axios.get(requesturl , {
            headers: { authorization: `Bearer ${jwtToken}` },
            })
            console.log(response.data)
            return response.data

        }
        catch (err) {
            return rejectWithValue(err);
        }
    }
)

export const updateSecurity = createAsyncThunk<any , fileFolderSecurityFetchProps>(   // any -> type of the responce and fileFolderSecurityFetchProps -> type of the arguments passed to the function.
    'fileFolders/settings/update',
    async({requesturl , jwtToken , request_payload } ,{rejectWithValue}) => {   //rejextWithValue -> is used to handle the rejection of the api request
        try {
            const response = await axios.post(requesturl , request_payload, {
            headers: { authorization: `Bearer ${jwtToken}` },
            })
            console.log(response.data)
            return response.data

        }
        catch (err) {
            return rejectWithValue(err);
        }
    }
)


export const fileFolderSecuritySlice = createSlice({
    name:"fileFolderSecurity",
    initialState: {
        settingData: {
            is_password_protected : false,
            is_critical : false,
            session_duration : 0,
            is_locked : false,
        } as fileFolderSecurityProps,
        securitySettingsPassword : '',
        securitySettingStatus : {
            status_code : 0,
            message : "",
        },
        settingUpdateLoading : false,
    },
    // Reducers are the methods used to update the states.
    reducers: {
    },
    extraReducers: (builder) => {
        builder
        // .addCase(getFileFolderSettings.pending , (state , action) => {
        //         // this means that the filefolder have no security policy.
        //         state.settingData.is_password_protected = false;
        //         state.settingData.is_critical = false;
        // })
        .addCase(getFileFolderSettings.fulfilled , (state , action) => {
            let res = action.payload;
            console.log("security..........." , res.status_code)
            if (res.status_code === 5001) {
                // this means that the filefolder have no security policy.
                console.log("hitting 5001" )
                state.settingData.is_password_protected = false;
                state.settingData.is_critical = false;
            }

            if (res.status_code === 5000) {
                // updating with the data from backend.
                state.settingData = {
                    is_password_protected : res.data.is_password_protected,
                    is_critical: res.data.is_critical,
                    session_duration : res.data.session_duration,
                    is_locked: res.data.is_locked,
                }
            }
        })
        .addCase(updateSecurity.pending , (state , action) => {
            state.settingUpdateLoading = true;
            state.securitySettingStatus= {
                status_code : 0,
                message : "",
            }
        })
        .addCase(updateSecurity.fulfilled , (state , action) => {
            let res = action.payload;
            state.settingUpdateLoading = false;
            if (res.status_code === 5000) {
                // updating with the data with the acknowledgment from the server.
                state.securitySettingsPassword = action.meta.arg.request_payload?.password? action.meta.arg.request_payload.password : state.securitySettingsPassword;
                state.settingData.is_password_protected = action.meta.arg.request_payload?.is_password_protected? action.meta.arg.request_payload.is_password_protected : state.settingData.is_password_protected;
                state.settingData.is_critical = action.meta.arg.request_payload?.is_security_critical? action.meta.arg.request_payload.is_security_critical : state.settingData.is_critical;
                state.settingData = {
                    is_password_protected : action.meta.arg.request_payload?.is_password_protected? action.meta.arg.request_payload.is_password_protected : state.settingData.is_password_protected,
                    is_critical: action.meta.arg.request_payload?.is_security_critical? action.meta.arg.request_payload.is_security_critical : state.settingData.is_critical,
                    session_duration : action.meta.arg.request_payload?.session_duration? action.meta.arg.request_payload.session_duration : state.settingData.session_duration,
                    is_locked: action.meta.arg.request_payload?.is_locked? action.meta.arg.request_payload.is_locked : state.settingData.is_locked,
                }
                state.securitySettingStatus = {
                    status_code: res.status_code,
                    message: res.message
                };
            }
        })
    },


})




export default fileFolderSecuritySlice.reducer; 