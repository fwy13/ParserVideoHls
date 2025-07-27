function isLineValid(line: string) {
    return line.startsWith('#') || /^https?:\/\/.+$/.test(line) || /^[^#].+\.ts$/.test(line);
}

export default function isValidM3u8(str: string) {
    const lines = str.trim().split('\n').map(line => line.trim()).filter(Boolean);
    if (lines[0] !== '#EXTM3U') return false;

    for (let i = 1; i < lines.length; i++) {
        if (!isLineValid(lines[i])) return false;
    }

    return true;
}