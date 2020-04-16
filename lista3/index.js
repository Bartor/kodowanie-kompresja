const fs = require('fs');
const lzw = require('./LZW');

if (process.argv.length !== 5) {
    console.error('Usage: node index.js [decode|encode] [input] [output]');
    process.exit(1);
}

const decode = process.argv[2] === 'decode';

//todo all the file reading elias coding thingies

let toCompress = Buffer.from('siema siema jak się macie? pozdrawiam rodzinkę :)');
let compressed = lzw.compress(toCompress);
let decompressed = lzw.decompress(compressed, toCompress.length);
console.log(decompressed.toString());