export function XOR(buffer: ArrayBuffer, key = 0xAB) {
    const view = new Uint8Array(buffer);
    const result = new Uint8Array(view.length);
    for (let i = 0; i < view.length; i++) {
        result[i] = view[i] ^ key;
    }
    return result.buffer;
}