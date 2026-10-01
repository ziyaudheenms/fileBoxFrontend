// OPERATIONS PERFORMED BY THE CRYPTO MODULE

// 1. Generate a random Master Key (This is the high-entropy random key used to encrypt the user's actual files/data)
// 2. Derive the Key Encryption Key (KEK) using Argon2 via crypto_pwhash
// 3. Generating the Public key and the private key for the user