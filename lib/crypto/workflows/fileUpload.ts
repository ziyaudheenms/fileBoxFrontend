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

// error codes that which will be used here inoder for redirection puropsees
//                                          404 -> redirect to login (indexed DB lost the context)
//                                          500 -> just for blocking the file Upload

import { sessionVault } from "@/lib/crypto/session-vault";
import { restoreSessionKeys } from "@/lib/crypto/sessionPersistance";
import { toast } from "sonner";
import { decryptCollectionKey, fromBase64, generateFileKey } from "../keys";
export async function fileUploadFlow(
    uploadingFile: File,
    folderID: string
) : Promise<{ collectionKey: Uint8Array, fileKey: Uint8Array } | null> {

    if (sessionVault.getMasterKey() == null) {
        // which means the session vault is erased during the exisiting session, so we have to restore it/
        await restoreSessionKeys()
    }

    const masterKey = sessionVault.getMasterKey()

    if (!masterKey) {
        console.log("crypto credantials not found")
        toast.error('something wrong with the crypto')
        return null
    }

    // we have to generate the collection key, if exists in the session vault take that key or else decrypt the collection key and store them in the vault.\
    let decryptedCollectionKey = sessionVault.getCollectionKey(folderID) ?? null

    if (!decryptedCollectionKey) {

        const encryptedCollectionKey = localStorage.getItem('CURRENT_FOLDER_ENCRYPTED')
        const encryptedCollectionKeyNonce = localStorage.getItem('CURRENT_FOLDER_ENCRYPTED_NONCE')

        if (encryptedCollectionKey == null || encryptedCollectionKeyNonce == null) {
            console.log("encrypted data not found in log")
            toast.error('something wrong with the crypto')
            return null
        }

        const collectionKeyUint8 = await fromBase64(encryptedCollectionKey)
        const collectionKeyNonceUint8 = await fromBase64(encryptedCollectionKeyNonce)

        if (collectionKeyUint8 == null || collectionKeyNonceUint8 == null) {
            console.log("encrypted data is not correct")
            toast.error('something wrong with the crypto')
            return null
        }

        decryptedCollectionKey = await decryptCollectionKey(collectionKeyUint8, collectionKeyNonceUint8, masterKey)
        if (decryptedCollectionKey) {
            sessionVault.setCollectionKey(folderID, decryptedCollectionKey)
        }
    }
    else{
        decryptedCollectionKey = sessionVault.getCollectionKey(folderID) ?? null
    }

    // Once the collection key is loaded we have to generate the file key

    const fileKey = await generateFileKey()

    // next we have to encrypt the file content and upload it through the imagekit and get the url

    if (!decryptedCollectionKey || !fileKey) {
        console.log("cant load the collection key or file key")
        toast.error('something wrong with the crypto')
        return null
    }

    return {
        collectionKey: decryptedCollectionKey,
        fileKey: fileKey
    }

}