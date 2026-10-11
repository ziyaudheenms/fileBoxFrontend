/// this workflow discussses amd implements the flow for the uploading of imagefile into imagekit storage
// file: File is passed as an argument in this workflow function, the file is loaded as stream its encrypted with the libsodium stream api
// and is down streamed thorugh http request into our third party storage platform.
// ------------------------------------------------ALFGORITHMIC FLOW-------------------------------------------------------
// For each file to be uploaded we need to have a collection key, file key
//                                      master key
//                                          |  encrypted with master key 
//                                          V
//                                      collection key (collection key will be unique for each folders)  --> collection key will be assigned with the respected folders at the time they gets created
//                                          |  encrypted with the collection key
//                                          V
//                                      file key
//                                          |  encrypted with the file key with saperate nonce for both the file content and for file metadata
//                                          V
//                                       file content(streaming) $$ file metadata



export async function fileUploadFlow(
    file: File,
    collectionKey: Uint8Array
){

}