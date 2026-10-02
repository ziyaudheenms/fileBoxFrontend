// this file acts as an vault for the immediate in-memmroy storage of the crutial session keys
// since using the contextAPI , zustand and redux can expose to developer tools , usig the in memmory is safe

// to tryuly protect the in-memmory variables we have to implement futher resistance later.....

let cachedMasterKey: Uint8Array | null = null;
let cachedPrivateKey: Uint8Array | null = null;
let cachedPublicKey: Uint8Array | null = null;

// sessionVault that which is used to collect all these important required things
export const sessionVault = {
  setKeys(masterKey: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
    cachedMasterKey = masterKey;
    cachedPrivateKey = privateKey;
    cachedPublicKey = publicKey;
  },

  getMasterKey(): Uint8Array | null {
    return cachedMasterKey;
  },

  getPrivateKey(): Uint8Array | null {
    return cachedPrivateKey;
  },

  getPublicKey(): Uint8Array | null {
    return cachedPublicKey;
  },

  clear() {
    cachedMasterKey = null;
    cachedPrivateKey = null;
    cachedPublicKey = null;
  }
};