const fs = require('fs');

const imageUtils = require('../shared/imageUtils');
const jpegLs = require('./jpegLs');

if (process.argv.length !== 3) {
    console.log('Usage: node index.js <tga input file>');
    process.exit(1);
}

fs.readFile(process.argv[2], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const original = imageUtils.readTga(buffer);
    const originalEntropy = imageUtils.colorEntropy(original.colors);

    console.log('ORIGINAL ENTROPIES:\n', originalEntropy);

    let [rBest, gBest, bBest, fullBest] = [{
            v: 8,
            no: -1
        },
        {
            v: 8,
            no: -1
        },
        {
            v: 8,
            no: -1
        },
        {
            v: 8,
            no: -1
        },
    ];
    jpegLs.predictionSchemes.forEach((scheme, index) => {
        const predicted = jpegLs.jpegLs(original.colors, scheme);
        const entropies = imageUtils.colorEntropy(predicted);


        if (entropies.rEntropy < rBest.v) rBest = {
            v: entropies.rEntropy,
            no: index
        };
        if (entropies.gEntropy < gBest.v) gBest = {
            v: entropies.gEntropy,
            no: index
        };
        if (entropies.bEntropy < bBest.v) bBest = {
            v: entropies.bEntropy,
            no: index
        };
        if (entropies.fullEntropy < fullBest.v) fullBest = {
            v: entropies.fullEntropy,
            no: index
        };

        console.log(`SCHEME #${index + 1} ENTROPIES:\n`, entropies);
    });

    console.log(`Best scheme for r:\t#${rBest.no + 1} -> ${rBest.v}`);
    console.log(`Best scheme for g:\t#${gBest.no + 1} -> ${gBest.v}`);
    console.log(`Best scheme for b:\t#${bBest.no + 1} -> ${bBest.v}`);
    console.log(`Best scheme for full:\t#${fullBest.no + 1} -> ${fullBest.v}`);
});