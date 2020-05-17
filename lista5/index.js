const imageUtils = require('../shared/imageUtils');
const lbg = require('./lbg');
const fs = require('fs');

if (process.argv.length !== 5) {
    console.log('Usage: node index.js <input file> <level> <output file>');
    process.exit(1);
}

fs.readFile(process.argv[2], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const original = imageUtils.readTga(buffer);
    const arrayMapped = original.colors.map(row => row.map(pixel => [pixel.b, pixel.g, pixel.r])).reduce((acc, e) => [...acc, ...e], []);
    const codebook = lbg.createCodebook(arrayMapped, 2 ** process.argv[3])
        .map(e => e.map(v => Math.round(v)));

    
    
    console.log(codebook)
});