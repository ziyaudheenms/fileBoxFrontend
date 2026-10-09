// This module deals with the flow of signIn operation with the handling of :--
// decrypting of the encrypted master key, encrypted private key

import { decryptMasterKey, decryptPrivateKey, deriveKeyEncryptionKey, fromBase64 } from "@/lib/crypto/keys"

// ------------------------------------ALGORITHMIC FLOW------------------------------------------------------------------------
// when the user logs in with the email and password , using that password KEK is generated and using the encrypted blobs from
// from the db along with KEK its decrypted and loaded.
// along with that, the decrypted keys are encrypted with a native crypto key and stored in indexed DB.

interface Payload {
    password: string,
    salt: string,
    encryptedMasterKey: string,
    encryptedPrivateKey: string,
    masterkeyNonce: string,
    privateKeyNonce: string,
    publicKey: string
}

export async function loginCryptoSesions(payload: Payload): Promise<{ masterKey: Uint8Array; privateKey: Uint8Array; publicKey: Uint8Array | null } | null> {
    try {
        // Type conversion process (Base64 string -> Uint8Array)
        const Uint8EncryptedMasterKey = await fromBase64(payload.encryptedMasterKey);
        const Uint8MasterKeyNonce = await fromBase64(payload.masterkeyNonce);
        const Uint8EncryptedPrivateKey = await fromBase64(payload.encryptedPrivateKey);
        const Uint8PrivateKeyNonce = await fromBase64(payload.privateKeyNonce);
        const Uint8Salt = await fromBase64(payload.salt);

        if (!Uint8Salt) {
            console.error("Salt could not be converted into a Uint8Array.");
            return null;
        }

        // Derive KEK using the stored salt and user's password
        const kek = await deriveKeyEncryptionKey(payload.password, Uint8Salt);

        if (!Uint8EncryptedMasterKey || !Uint8MasterKeyNonce || !Uint8EncryptedPrivateKey || !Uint8PrivateKeyNonce || !kek) {
            console.error("Failed to parse cryptographic buffers or derive KEK.");
            return null;
        }

        // Decrypt the master key and the private key
        const decryptedMasterKey = await decryptMasterKey(Uint8EncryptedMasterKey, Uint8MasterKeyNonce, kek);
        const decryptedPrivateKey = await decryptPrivateKey(Uint8EncryptedPrivateKey, Uint8PrivateKeyNonce, kek);

        if (!decryptedMasterKey || !decryptedPrivateKey) {
            console.error("Decryption failed: Incorrect password or corrupted data blob.");
            return null;
        }

        // Return the raw decrypted keys so they can be fed directly into persistSessionKeys()
        return {
            masterKey: decryptedMasterKey,
            privateKey: decryptedPrivateKey,
            publicKey: await fromBase64(payload.publicKey)  //converting the base64 string into the Uint8 array for our workflow.
        };

    } catch (error) {
        console.error("An unexpected error occurred during login cryptographic processing:", error);
        return null;
    }
}