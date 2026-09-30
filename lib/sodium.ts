// libsodium uses the Wasm so we have to load it asynchronously

import _sodium from 'libsodium-wrappers-sumo';

export async function getSodium() {
    // loading the sodium asynchronously to ensure that the Wasm is ready before using it
    await _sodium.ready;
    return _sodium;
}

