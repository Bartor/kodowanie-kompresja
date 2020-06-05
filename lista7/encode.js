const bufferOperations = require('./bufferOperations');
const fs = require('fs');

function calculateParity(bits, ids) {
    return (ids.reduce((acc, i) => acc + (bits[i] === '1'), 0) % 2).toString();
}

function toHammingCode(bits) {
    let p1 = calculateParity(bits, [0, 1, 3]);
    let p2 = calculateParity(bits, [0, 2, 3]);
    let p3 = calculateParity(bits, [1, 2, 3]);
    let p = calculateParity(p1 + p2 + bits[0] + p3 + bits.slice(1), [0, 1, 2, 3, 4, 5, 6]);

    return p1 + p2 + bits[0] + p3 + bits.slice(1) + p;
}

function encode(bits) {
    let result = '';

    while (bits.length >= 4) {
        result += toHammingCode(bits.slice(0, 4));
        bits = bits.slice(4);
    }

    return result;
}

if (process.argv.length !== 4) {
    console.error('Usage: node encode.js <input> <output>');
    process.exit(1);
}

fs.readFile(process.argv[2], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    const bits = bufferOperations.bufferToBinaryString(buffer);
    const encoded = encode(bits);
    const output = bufferOperations.bitsToBuffer(encoded);

    fs.writeFile(process.argv[3], output, () => {
        console.log('Done');
    });
});