// In the decryption phase of the file, we in this context have to decrypt two contents
// FILE METADATA
// ACTUALL FILE CONTENT

import { toast } from "sonner"
import { sessionVault } from "../session-vault"
import { restoreSessionKeys } from "../sessionPersistance"
import { decryptCollectionKey, decryptFileKey, decryptFileMetadata, fromBase64 } from "../keys"

// Both are encrypted with the same encryption key with different nonce (encrypted file key nonce and header nonce)
//-------------------------------ALGORITHMIC FLOW---------------------------------------------------------------------------    
// FIRST we need the master key, using the master key we have to get the collection key of the respected file
//  using the collection key, file key is derived and is passed into the metaData derivation function along with all the required parameters.

export async function FileMetaDataFlow(
    parentFolderID: string,
    encryptedMetaData: string,
    encryptedFileKey: string,
    fileKeyNonce: string,
    metadataNonce: string
): Promise<{ name: string; fileType: string; description: string } | null> {

    const Uint8encryptedFileKey = await fromBase64(encryptedFileKey);
    const Uint8fileKeyNonce = await fromBase64(fileKeyNonce);

    if (!Uint8encryptedFileKey || !Uint8fileKeyNonce) {
        console.log("required parameters not found")
        return null
    }

    if (sessionVault.getMasterKey() == null) {
        // which means the session vault is erased during the exisiting session, so we have to restore it/
        await restoreSessionKeys()
    }

    const masterKey = sessionVault.getMasterKey()

    if (!masterKey) {
        console.log("Cant find the master key")
        toast.error('something wrong with the crypto')
        return null
    }

    // once the master key is resolved next we have to derive the collection key if it is not present
    let decryptedCollectionKey = sessionVault.getCollectionKey(parentFolderID) || null

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
            sessionVault.setCollectionKey(parentFolderID, decryptedCollectionKey)
        }
    }
    else {
        decryptedCollectionKey = sessionVault.getCollectionKey(parentFolderID) ?? null
    }

    // once the collection key has derieved next we have to decrypt the file key
    if (!decryptedCollectionKey) {
        console.log("collection key not found")
        return null
    }

    const fileKey = await decryptFileKey(Uint8fileKeyNonce, Uint8fileKeyNonce, decryptedCollectionKey)

    if (!fileKey) {
        console.log("file key not found")
        return null
    }

    // once all the keys are found out and derieved now, lets derive the metadata

    const fileMetaData = await decryptFileMetadata(encryptedMetaData, metadataNonce, fileKey)

    if (!fileMetaData) {
        console.log("cant decrypt the file metadata , retry again")
        return null
    }

    return fileMetaData
}