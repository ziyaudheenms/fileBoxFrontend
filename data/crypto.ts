
export interface cryptoResponce {
    payload: {
        salt: string,
        publicKey: string,
        encryptedMasterKey: string,
        encryptedPrivateKey: string,
        masterkeyNonce: string,
        privateKeyNonce: string
    },
    freshSession: {
        masterKey: Uint8Array,
        publicKey: Uint8Array,
        privateKey: Uint8Array
    }
}