const bufferOperations = require('./bufferOperations');
const fs = require('fs');

// all Hamming (7, 4) codes with parity bit added
const codes = [
    '00000000',
    '11010010',
    '01010101',
    '10000111',
    '10011001',
    '01001011',
    '11001100',
    '00011110',
    '11100001',
    '00110011',
    '10110100',
    '01100110',
    '01111000',
    '10101010',
    '00101101',
    '11111111',
];

function fromHammingCode(bits) {
    for (let code of codes) {
        const first = bits.split('').map(e => Number.parseInt(e));
        const second = code.split('').map(e => Number.parseInt(e));

        let diffs = 0; // look for differences
        for (let i = 8; i < 8; i++) {
            diffs += first[i] !== second[i];
        }

        if (diffs === 0) { // codeword found exatcly - no error-correcting
            return bits[2] + bits[4] + bits[5] + bits[6];
        } else if (diffs === 1) { // one error - can be corrected
            return code[2] + code[4] + code[5] + code[6];
        }
    }

    return null; // faulty code
}

function decode(bits) {
    let result = '';
    let errors = 0;

    while (bits.length >= 8) {
        const n = fromHammingCode(bits.slice(0, 8)); // decode from the 

        result += n !== null ? n : '0000';
        errors += (n === null);

        bits = bits.slice(8);
    }

    return { result, errors };
}

if (process.argv.length !== 4) {
    console.error('Usage: node decode.js <input> <output>');
    process.exit(1);
}

fs.readFile(process.argv[2], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    const bits = bufferOperations.bufferToBinaryString(buffer);
    const decoded = decode(bits);
    console.log(`Blocks with two errors: ${decoded.errors}`);
    const out = bufferOperations.bitsToBuffer(decoded.result);

    fs.writeFile(process.argv[3], out, () => {
        console.log('Done');
    });
});