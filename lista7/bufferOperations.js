function bufferToBinaryString(buffer) {
    let result = '';
    for (let byte of buffer) {
        result += byte.toString(2).padStart(8, '0');
    }
    return result;
}

function bitsToBuffer(bits) {
    if (bits.length % 8) {
        throw 'Bits are not padded to mod 8';
    }

    const buffer = Buffer.alloc(bits.length / 8);
    for (let i = 0; i < bits.length / 8; i++) {
        buffer[i] = Number.parseInt(bits.slice(8 * i, 8 * (i + 1)), 2);
    }
    return buffer;
}

module.exports = {
    bufferToBinaryString,
    bitsToBuffer
};