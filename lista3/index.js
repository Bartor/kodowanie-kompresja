const fs = require('fs');
const lzw = require('./lzw');
const coding = require('./coding');
const entropyAnalyzer = require('../shared/entropyAnalyzer');

if ((process.argv.includes('decompress') && process.argv.length !== 5) ||
    (process.argv.includes('compress') && process.argv.length !== 6)) {
    console.error('Usage: node index.js [compress|decompress [f|o|d|g]] [input] [output]');
    process.exit(1);
}

const decode = process.argv[2] === 'decompress';
let algorithm = null;
if (!decode) {
    switch (process.argv.splice(3, 1)[0]) {
        case 'f':
            algorithm = coding.fibonacci;
            break;
        case 'o':
            algorithm = coding.omega;
            break;
        case 'd':
            algorithm = coding.delta;
            break;
        case 'g':
            algorithm = coding.gamma;
            break;
        default:
            console.error(`Available algorithms:
f - fibonnaci
o - elias omega
d - elias delta
g - elias gamma`);
            process.exit(2);
    }
}

const input = process.argv[3];
const output = process.argv[4];

const start = process.hrtime();
fs.readFile(input, (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(3);
    }



    let res;

    if (decode) {
        const uncoded = coding.decode(buffer);
        res = lzw.decompress(uncoded);
    } else {
        console.log(`Input entropy: ${entropyAnalyzer(buffer).entropy}`);
        console.log(`Input size: ${buffer.length}`);

        const compressed = lzw.compress(buffer);
        res = algorithm(compressed);

        console.log(`Code size: ${res.length}`);
        console.log(`Code entropy: ${entropyAnalyzer(res).entropy}`);
        console.log(`Compression ratio: ${buffer.length/res.length}`);
    }


    fs.writeFile(output, res, () => {
        const end = process.hrtime(start);
        console.log(`Done in ${end[0]}.${end[1]} ms`);
    });
});