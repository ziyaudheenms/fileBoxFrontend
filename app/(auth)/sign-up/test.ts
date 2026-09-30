import { getSodium } from "@/lib/sodium";

// const password = "mysecretpassword"; // the password



// (async () => {
//   const sodium = await getSodium(); // ensuring that the Wasm version of the libsodium library is fully loaded.
//   const key = sodium.crypto_secretbox_keygen(); // generating a random key for encryption using the libsodium library.
//   console.log(key);
// })();




// // dealing with the password to keyEncryptionkey function

// //1, we need to genetate a salt and store it in the DB
// //2, two important parameters for the crypto_pwhash  are OPSLIMIT, MEMLIMIT



// // (async () => {
// //   const password = "mysecretpassword";
// //   const sodium = await getSodium(); // ensuring that the Wasm version of the libsodium library is fully loaded.
// //   const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES); // generating a random salt for password hashing using the libsodium library.  .crypto_pwhash_SALTBYTES is a constant that defines the length of the salt in bytes.
// //   const key = sodium.crypto_pwhash(
// //     32, // the length of the derived key in bytes
// //     sodium.from_string(password), // the password to be hashed is converted to a Uint8Array using the from_string function from the libsodium library.
// //     salt, // the salt to be used for hashing
// //     // _INTERACTVE IS USED FOR THE SMOOTH AND SNAPPY PERFORMANCE ON THE CLIENT BROWSER SIDE
// //     sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, // the number of operations to perform during hashing
// //     sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, // the amount of memory to use during hashing
// //     sodium.crypto_pwhash_ALG_DEFAULT // the algorithm to use for hashing
// //   );
// //   console.log(key)

// // })();



// // NEXT WE HAVE TO ENCRYPT THE MASTER KEY WITTH THIS KEYENCRYPTIONKEY GENERATED FROM THE PASSOWRD

// //1, we have to generate random nonce for the encryption of the master key, so that the master key encrypted will be difffrebnet each time we encyrpt them

// (async () => {
//   const sodium = await getSodium(); // ensuring that the Wasm version of the libsodium library is fully loaded.
//   const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES); // generating a random nonce for encryption using the libsodium library.  .crypto_secretbox_NONCEBYTES is a constant that defines the length of the nonce in bytes.
//   const encryptedMasterKey = sodium.crypto_secretbox_easy('lF-kLfX3eIr0zHQfzIrcKN72etK9uDOnYl8WMhVObgU', nonce, 'meHU7B-VwHtgUnSRgxcJCJN-Hsn6ISKPZpM2o4PNx-U')

// })();


// import { getSodium } from "@/lib/sodium";

// (async () => {
//   const sodium = await getSodium();

//   // 1. Generate the Master Key (This is the high-entropy random key used to encrypt the user's actual files/data)
//   const masterKey = sodium.crypto_secretbox_keygen(); // Returns a Uint8Array (32 bytes)
//   console.log("Master Key (Base64):", sodium.to_base64(masterKey));

//   // 2. Simulate User Password Entry
//   const password = "mysecretpassword";

//   // 3. Derive the Key Encryption Key (KEK) using Argon2 via crypto_pwhash
//   // A fresh random salt must be generated and stored in the database alongside the final encrypted payload.
//   const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
//   const passwordBytes = sodium.from_string(password);

//   const kek = sodium.crypto_pwhash(
//     32, // Desired key length in bytes
//     passwordBytes,
//     salt,
//     sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
//     sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
//     sodium.crypto_pwhash_ALG_DEFAULT
//   );
//   console.log("Derived KEK (Base64):", sodium.to_base64(kek));

//   // 4. Encrypt the Master Key using the KEK
//   // A fresh, random nonce must be generated for every encryption operation.
//   const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

//   // Note: All inputs (masterKey, nonce, kek) are properly in Uint8Array format here.
//   const encryptedMasterKey = sodium.crypto_secretbox_easy(
//     masterKey,
//     nonce,
//     kek
//   );

//   console.log("Encrypted Master Key (Base64):", sodium.to_base64(encryptedMasterKey));

//   // ==========================================
//   // WHAT YOU NEED TO SAVE IN YOUR DATABASE:
//   // ==========================================
//   const dbRecord = {
//     salt: sodium.to_base64(salt),
//     nonce: sodium.to_base64(nonce),
//     encryptedMasterKey: sodium.to_base64(encryptedMasterKey),
//   };

//   console.log("Data ready to store in DB:", dbRecord);
// })();





// NEXT STEP WE HAVE TO GENERATE THE ASYMMETRIC KEY PAIR FOR THE USER, SO THAT THE PUBLIC KEY CAN BE USED TO ENCRYPT THE MASTER KEY AND THE PRIVATE KEY CAN BE USED TO DECRYPT THE MASTER KEY
// important step we have to encrypt the private key and store it in the db , we are encrypting it using the KEK , whihc we get during the signin/signup


(async () => {
  const sodium = await getSodium(); // ensuring that the Wasm version of the libsodium library is fully loaded.
  const keyPair = sodium.crypto_box_keypair(); // generating a random key pair for encryption using the libsodium library.
  console.log("Public Key (Base64):", sodium.to_base64(keyPair.publicKey));
  console.log("Private Key (Base64):", sodium.to_base64(keyPair.privateKey));
})();