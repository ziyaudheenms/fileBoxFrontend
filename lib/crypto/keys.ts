// OPERATIONS PERFORMED BY THE CRYPTO MODULE

// Source Libsodium :- https://libsodium.gitbook.io/doc

// 1. Generate a random Master Key (This is the high-entropy random key used to encrypt the user's actual files/data)
// 2. Derive the Key Encryption Key (KEK) using Argon2 via crypto_pwhash
// 3. Generating the Public key and the private key for the user



import { getSodium } from "@/lib/sodium";

// Generate Master Key is used to generate the Master key
export async function generateMasterKey(): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium();
        return sodium.crypto_secretbox_keygen(); // Returns a Uint8Array (32 bytes)
    } catch (error) {
        console.error("Failed to generate master key:", error);
        return null;
    }
}


// this handle function is used to generate the asymmetric key pairs.
export async function generateAsymmetricKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        const keyPair = sodium.crypto_box_keypair();
        return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
    } catch (error) {
        console.error("Failed to generate asymmetric key pair:", error);
        return null;
    }
}


// Handles the generation of the Key Encryption Key (KEK) using Argon2 via crypto_pwhash
// //1, we need to genetate a salt and store it in the DB
// //2, two important parameters for the crypto_pwhash  are OPSLIMIT, MEMLIMIT

export async function deriveKeyEncryptionKey(password: string, salt: Uint8Array): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium()

        return sodium.crypto_pwhash(
            32, // the length of the derived key in bytes
            sodium.from_string(password), // the password to be hashed is converted to a Uint8Array using the from_string function from the libsodium library.
            salt, // the salt to be used for hashing
            // _INTERACTVE IS USED FOR THE SMOOTH AND SNAPPY PERFORMANCE ON THE CLIENT BROWSER SIDE
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, // the number of operations to perform during hashing
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, // the amount of memory to use during hashing
            sodium.crypto_pwhash_ALG_DEFAULT // the algorithm to use for hashing
        );
    } catch (error) {
        console.error("Failed to derive key encryption key:", error);
        return null;
    }
}


// NEXT WE HAVE TO ENCRYPT THE MASTER KEY WITTH THIS KEYENCRYPTIONKEY GENERATED FROM THE PASSOWRD
// nonce is generated for the encryption of the master key, so that the master key encrypted will be different each time we encrypt them
export async function encryptMasterKey(masterKey: Uint8Array, kek: Uint8Array): Promise<{ nonce: Uint8Array; encryptedMasterKey: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES); // generating a random nonce for encryption using the libsodium library.  .crypto_secretbox_NONCEBYTES is a constant that defines the length of the nonce in bytes.
        const encryptedMasterKey = sodium.crypto_secretbox_easy(masterKey, nonce, kek);
        return { nonce, encryptedMasterKey };
    } catch (error) {
        console.error("Failed to encrypt master key:", error);
        return null;
    }
}

// During the login we have to decrypt the master key using the KEK generated from the password and the nonce stored in the DB
export async function decryptMasterKey(encryptedMasterKey: Uint8Array, nonce: Uint8Array, kek: Uint8Array): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium();
        return sodium.crypto_secretbox_open_easy(encryptedMasterKey, nonce, kek);
    } catch (error) {
        console.error("Failed to decrypt master key:", error);
        return null;
    }
}

