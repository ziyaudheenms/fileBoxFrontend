// HERE WE ARE GOING TO DEFINE THE COMPLE FLOW OF THE REGISTRATION OF A USER IN FileDrive

// -----------------------------------------ALGORITHMIC APPROCH--------------------------------------------------------------------------

// First the user registers them self with email and password along with other things

//When the user registers we need to generate the masterkey first
//Using the password the KeyEncyptionKey is generated along with a random salt
// Asymmtric private and public key is genrated

//NOW COMES THE ENCRYPTION PART

// We have to encrypt the master key with the KEK along with a nonce -> have to save the nonce and enrypted masterkey in the DB
// Next we have to encrypt the private key also with the KEK again with a nonce -> save the encrypted_private_key with nonce in the DB


//During the encryption process we are returned with the Uint8 Arrays so we have to convert them into base64 and have to save in the db

// return -->    {
//                  salt, publicKey, encryptedMasterKey, MasterKeyNonce, 
//                  encryptedPrivateKey, PrivateKeyNonce
//}
// all in the base64 format.
//----------------------------------------------------------------------------------------------------------------------------------------


import { getSodium } from "@/lib/sodium";
import { generateMasterKey, deriveKeyEncryptionKey, generateAsymmetricKeyPair, encryptMasterKey, encryptPrivateKey, toBase64 } from "@/lib/crypto/keys";

// interface cryptoResponce {
//     payload: {
//         salt: string,
//         publicKey: string,
//         encryptedMasterKey: string,
//         encryptedPrivateKey: string,
//         masterkeyNonce: string,
//         privateKeyNonce: string
//     },
//     freshSession: {
//         masterKey: Uint8Array,
//         publicKey: Uint8Array,
//         privateKey: Uint8Array
//     }
// }

export async function cryptoUserRegistration(password: string)  {
    const sodium = await getSodium()
    // First we need the master keys and the asymmtric keys

    const masterKey = await generateMasterKey()
    const keyPair = await generateAsymmetricKeyPair()

    const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
    const kek = await deriveKeyEncryptionKey(password, salt)

    if (masterKey && keyPair && kek) {
        const encryptedMasterKeydata = await encryptMasterKey(masterKey, kek)
        const encryptedPrivateKeyData = await encryptPrivateKey(keyPair?.privateKey , kek)

        if (!encryptedMasterKeydata || !encryptedPrivateKeyData) {
            console.error("Encryption failed for keys during registration.");
            return null;
        }

        return {
            payload:{
                salt : await toBase64(salt),
                publicKey : await toBase64(keyPair.publicKey),
                encryptedMasterKey : await toBase64(encryptedMasterKeydata?.encryptedMasterKey),
                encryptedPrivateKey : await toBase64(encryptedPrivateKeyData?.encryptedPrivateKey),
                masterkeyNonce : await toBase64(encryptedMasterKeydata?.nonce),
                privateKeyNonce : await toBase64(encryptedPrivateKeyData?.nonce),
            },
            freshSession: {
                masterKey: masterKey,
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey
            }
        };

    }
    else {
        console.error('some error! cant load master key or key pair oe kek')
        return null
    }
    
}