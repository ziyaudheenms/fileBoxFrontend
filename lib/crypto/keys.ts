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

//function which that is used to encrypt the private key using the KEK generated from the password and the nonce stored in the DB
export async function encryptPrivateKey(privateKey: Uint8Array, kek: Uint8Array): Promise<{ nonce: Uint8Array; encryptedPrivateKey: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const encryptedPrivateKey = sodium.crypto_secretbox_easy(privateKey, nonce, kek);
        return { nonce, encryptedPrivateKey };
    } catch (error) {
        console.error("Failed to encrypt private key:", error);
        return null;
    }
}

export async function decryptPrivateKey(encryptedPrivateKey: Uint8Array, nonce: Uint8Array, kek: Uint8Array): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium();
        return sodium.crypto_secretbox_open_easy(encryptedPrivateKey, nonce, kek);
    } catch (error) {
        console.error("Failed to decrypt private key:", error);
        return null;
    }
}

export async function generateCollectionKey(): Promise<{ collectionKey: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        return { collectionKey: sodium.crypto_secretbox_keygen() };
    } catch (error) {
        console.error("Failed to generate collection key:", error);
        return null;
    }
}


export async function encryptCollectionKey(
    collectionKey: Uint8Array,
    masterKey: Uint8Array
): Promise<{ encryptedCollectionKey: Uint8Array; nonce: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const encryptedCollectionKey = sodium.crypto_secretbox_easy(collectionKey, nonce, masterKey);
        return { encryptedCollectionKey, nonce };
    } catch (error) {
        console.error("Failed to encrypt collection key:", error);
        return null;
    }
}

export async function decryptCollectionKey(
    encryptedCollectionKey: Uint8Array,
    nonce: Uint8Array,
    masterKey: Uint8Array
): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium();
        return sodium.crypto_secretbox_open_easy(encryptedCollectionKey, nonce, masterKey);
    } catch (error) {
        console.error("Failed to decrypt collection key:", error);
        return null;
    }
}

export async function generateFileKey(): Promise<{ fileKey: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        return { fileKey: sodium.crypto_secretbox_keygen() };
    } catch (error) {
        console.error("Failed to generate file key:", error);
        return null;
    }
}

export async function encryptFileKey(
    fileKey: Uint8Array,
    collectionKey: Uint8Array
): Promise<{ encryptedFileKey: Uint8Array; nonce: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const encryptedFileKey = sodium.crypto_secretbox_easy(fileKey, nonce, collectionKey);
        return { encryptedFileKey, nonce };
    } catch (error) {
        console.error("Failed to encrypt file key:", error);
        return null;
    }
}

export async function decryptFileKey(
    encryptedFileKey: Uint8Array,
    nonce: Uint8Array,
    collectionKey: Uint8Array
): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium();
        return sodium.crypto_secretbox_open_easy(encryptedFileKey, nonce, collectionKey);
    } catch (error) {
        console.error("Failed to decrypt file key:", error);
        return null;
    }
}

export async function encryptFileContent(
    file: File,
    encryptionKey: Uint8Array
): Promise<{encryptedFile: Blob, header:Uint8Array} | null> {
    // here for the file content encryption we are using the stream encryption techniqu where we encrypt the stream of data instead of treating it in the goooo.
    try {
        const sodium = await getSodium()

        // first we have to check the length of the key that is used for the encryption if it supports the stream Encryption or not
        if (encryptionKey.length != sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES) {
            console.log(`we require a size of ${sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES} bytes but got a size of ${encryptionKey.length}bytes and its invalid!!`)
            return null
        }

        // next we have to generate the core thing for the entire encryption and decryption and that is the header and states

        const stateAndHeader = sodium.crypto_secretstream_xchacha20poly1305_init_push(encryptionKey)  //state and header based on the given encryptionKey will be generated.
        // header --> header is used for intializing the nonce and the salt for the entire file encryption through streams and it is reuired for the decryption engine too, header contains the initialization metadata and salt for the stream.
        // state --> mean while state is used for the security purpose of the encrypion , state is used to identify the order in which the streams are arragned, which means it prevents the attacks like changing the order oof streams or manuplating the total no of streams
        const { header, state } = stateAndHeader

        const CHUNK_SIZE = 3 * 1024 * 1024; // 3 MB chunks
        const encryptedChunks: Uint8Array[] = [] 

        let offset = 0 // this variable is used to track the no of bytes / size that which is being encrypted.

        // we have to look through the chunks and perform the required encryptions.
        while (offset < file.size) {
            const isLastChunk = (offset + CHUNK_SIZE) >= file.size // tracking whether its the last.
            //now we have to cut the chunks into the parts as we need
            const blobsize = file.slice(offset, offset + CHUNK_SIZE)

            // Next we have to load this file into binary and then load it into array buffer of Uint8

            const arrayBuffer = await blobsize.arrayBuffer()
            const Uint8chunk = new Uint8Array(arrayBuffer)

            // Now for true utilization of state, we have to assign tags with each stream with a special tag for the last stream so that the encryption can understand where does the stream ends and can prevent ffrom the truncation attacks.
            const tag = isLastChunk
                ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL   // TAG_FINAL hepls is identifying the last chunk so to determine how many chunks are there.
                : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;
            
            // Now using all these data we have to encrypt each streams
            const encryptedBlock = sodium.crypto_secretstream_xchacha20poly1305_push(
                state,
                Uint8chunk,
                null, // Additional optional unencrypted data (AD)
                tag
            );

            // we have to append this encrypted chunk into the main chunck we initalized with header and adjust the offset
            encryptedChunks.push(encryptedBlock)  // only push and pop is allwed in the js/ts arrays 
            offset += CHUNK_SIZE

        }

        // Combine all chunks into a single Blob
        const encryptedFile = new Blob(encryptedChunks as BlobPart[], { type: 'application/octet-stream' });
        
        return {
            encryptedFile,
            header // Returning the raw Uint8Array header as well
        };


    }
    catch (e) {
        console.log('some kind of error occureed')
        console.error(e)
        return null
    }
}

export async function encryptFileMetadata(
    encryptionKey: Uint8Array,
    metadata: {
        name: string,
        fileType: string,
        fileUrl: string
    }
): Promise<{ encryptedFileMetadata: Uint8Array; nonce: Uint8Array } | null> {
    try {
        const sodium = await getSodium();
        const jsonString = JSON.stringify(metadata);
        const uint8MetaData = new TextEncoder().encode(jsonString);
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const encryptedFileMetadata = sodium.crypto_secretbox_easy(uint8MetaData, nonce, encryptionKey);

        return { encryptedFileMetadata, nonce };
    } catch (error) {
        console.error("Failed to encrypt file metadata:", error);
        return null;
    }
}



// ---------------------------------------HELPER FUNCTION TO CONVERT Uint8 to and fro with Base64 -------------------------------------------------

export async function toBase64(data: Uint8Array): Promise<string | null> {
    try {
        const sodium = await getSodium();
        return sodium.to_base64(data);
    } catch (error) {
        console.error("Failed to encode base64:", error);
        return null;
    }

}

export async function fromBase64(base64Str: string): Promise<Uint8Array | null> {
    try {
        const sodium = await getSodium();
        return sodium.from_base64(base64Str);
    } catch (error) {
        console.error("Failed to decode base64:", error);
        return null;
    }
}