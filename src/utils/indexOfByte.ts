
export function indexOfBytes(buffer: ArrayBuffer, pattern: Uint8Array<ArrayBuffer>) {
    const buf = new Uint8Array(buffer);
    const pat = new Uint8Array(pattern);

    for (let i = 0; i <= buf.length - pat.length; i++) {
        let match = true;
        for (let j = 0; j < pat.length; j++) {
            if (buf[i + j] !== pat[j]) {
                match = false;
                break;
            }
        }
        if (match) return i + pat.length;
    }
    return -1;
}