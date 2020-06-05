const fs = require('fs');

if (process.argv.length !== 5) {
    console.error('Usage: node noise.js <p> <input> <output>');
    process.exit(1);
}

const p = Number.parseFloat(process.argv[2]);

fs.readFile(process.argv[3], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    for (let b = 0; b < buffer.length; b++) {
        for (let i = 0; i < 8; i++) {
            buffer[b] = Math.random() < p ? buffer[b] ^ (0b1 << i) : buffer[b];
        }
    }

    fs.writeFile(process.argv[4], buffer, () => {
        console.log('Done');
    });
});