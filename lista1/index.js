const fs = require('fs');

if (process.argv.length !== 3) {
    console.error('Usage: node index.js [file to analyze]');
    process.exit(1);
}

const byteStats = {};
const conditionalByteStats = {};

let entropy = 0;
let conditionalEntropy = 0;

fs.readFile(process.argv[2], (error, buffer) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    for (let [index, byte] of buffer.entries()) {
        byteStats[byte] = byteStats[byte] + 1 || 1;

        if (conditionalByteStats[byte]) { // yeah I love writing self-documenting, readable code, how did you know
            conditionalByteStats[byte][buffer[(index || 1) - 1]] = conditionalByteStats[byte][buffer[(index || 1) - 1]] + 1 || 1;
        } else {
            conditionalByteStats[byte] = {
                [buffer[(index || 1) - 1]]: 1
            };
        }
    }

    for (let [byte, byteCount] of Object.entries(byteStats)) {
        entropy += (Math.log2(buffer.length) - Math.log2(byteCount)) * byteCount;
        for (let conditionalByteCount of Object.values(conditionalByteStats[byte] || {})) {
            conditionalEntropy += (Math.log2(byteCount) - Math.log2(conditionalByteCount)) * conditionalByteCount;
        }
    }

    console.log(entropy / buffer.length);
    console.log(conditionalEntropy / buffer.length);
});