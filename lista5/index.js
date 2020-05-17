const imageUtils = require('../shared/imageUtils');
const lbg = require('./lbg');
const fs = require('fs');

if (process.argv.length !== 5) {
    console.log('Usage: node index.js <level> <input file> <output file>');
    process.exit(1);
}

fs.readFile(process.argv[3], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const original = imageUtils.readTga(buffer, false);
    const arrayMapped = original.colors.map(row => row.map(pixel => [pixel.b, pixel.g, pixel.r])).reduce((acc, e) => [...acc, ...e], []);
    const codebook = lbg.createCodebook(arrayMapped, 2 ** process.argv[2])
        .map(e => e.map(v => Math.round(v)));

    const newImage = arrayMapped.map(pixel => {
        const diffs = codebook.map(e => lbg.vectorDistance(pixel, e));
        return codebook[diffs.findIndex(e => e === Math.min(...diffs))];
    });
    
    let i = 18;
    for (let pixel of newImage.reverse()) {
        for (let color of pixel) {
            buffer[i++] = color;
        }
    }

    fs.writeFile(process.argv[4], buffer, () => {
        console.log('Done');
    });
});