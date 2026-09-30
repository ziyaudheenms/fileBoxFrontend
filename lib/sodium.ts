// libsodium uses the Wasm so we have to load it asynchronously

import _sodium from 'libsodium-wrappers-sumo';


// this promise is used to provide the globally initialized sodium instance to any part where the program is called.
// as a result each time creating new promize when each pairt of the function calls the getSodium is solved

let sodiumReadyPromise: Promise<typeof _sodium> | null = null;


export async function getSodium() {
    // loading the sodium asynchronously to ensure that the Wasm is ready before using it

    if (!sodiumReadyPromise) {
        sodiumReadyPromise = (async () => {
            await _sodium.ready;
            return _sodium;
        })();
    }
    return sodiumReadyPromise;
}

