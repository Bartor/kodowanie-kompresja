const bufferOperations = require('./bufferOperations');
const fs = require('fs');

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

        const diff = [];
        let i = 0;
        while (i < 8) {
            if (first[i] !== second[i]) diff.push(i + 1);
            i++;
        }

        if (diff.length === 0) {
            return bits[2] + bits[4] + bits[5] + bits[6];
        }

        if (diff.length === 1) {
            return code[2] + code[4] + code[5] + code[6];
        }

        if (diff.length === 2) return null;
    }

    return null;
}

function decode(bits) {
    let result = '';
    let errors = 0;

    while (bits.length >= 8) {
        const n = fromHammingCode(bits.slice(0, 8));

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