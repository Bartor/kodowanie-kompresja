const fs = require('fs');
const entropyAnalyzer = require('../shared/entropyAnalyzer');

function getASCIIChar(binaryString) {
    return String.fromCharCode(parseInt(binaryString, 2));
}

class HuffmanNode {
    constructor(symbol = '', weight = 0, parent = null, left = null, right = null) {
        this.parent = parent;
        this.left = left;
        this.right = right;
        this.weight = weight;
        this.symbol = symbol;
    }
}

class AdaptiveHuffman {
    constructor() {
        this.nyt = new HuffmanNode('NYT');
        this.root = this.nyt;
        this.nodes = [];
        this.seen = Array(256).fill(null);
    }

    getCode(s, node, code = '') {
        if (node.left === null && node.right === null) {
            return node.symbol === s ? code : '';
        } else {
            let temp = '';

            if (node.left !== null) {
                temp = this.getCode(s, node.left, code + '0');
            }

            if (!temp && node.right !== null) {
                temp = this.getCode(s, node.right, code + '1');
            }

            return temp;
        }
    }

    findLargestHuffmanNode(weight) {
        for (let node of this.nodes) {
            if (node.weight === weight) {
                return node;
            }
        }
    }

    swapHuffmanNodes(a, b) {
        let [ai, bi] = [this.nodes.indexOf(a), this.nodes.indexOf(b)];
        [this.nodes[ai], this.nodes[bi]] = [this.nodes[bi], this.nodes[ai]];

        [a.parent, b.parent] = [b.parent, a.parent];

        if (a.parent.left === b) a.parent.left = a;
        else a.parent.right = a;

        if (b.parent.left === a) b.parent.left = b;
        else b.parent.right = b;
    }

    insert(s) {
        let node = this.seen[s.charCodeAt()];

        if (node === null) {
            let spawn = new HuffmanNode(s, 1);
            let internal = new HuffmanNode('', 1, this.nyt.parent, this.nyt, spawn);

            spawn.parent = internal;
            this.nyt.parent = internal;

            if (internal.parent !== null) internal.parent.left = internal;
            else this.root = internal;

            this.nodes.push(internal);
            this.nodes.push(spawn);

            this.seen[s.charCodeAt()] = spawn;
            node = internal.parent;
        }

        while (node !== null) {
            let largest = this.findLargestHuffmanNode(node.weight);

            if (node !== largest && node !== largest.parent && largest !== node.parent) {
                this.swapHuffmanNodes(node, largest);
            }

            node.weight++;
            node = node.parent;
        }
    }

    encode(text) {
        let result = '';

        for (let character of text) {
            if (this.seen[character.charCodeAt()]) {
                result += this.getCode(character, this.root);
            } else {
                result += this.getCode('NYT', this.root);
                result += character.charCodeAt().toString(2).padStart(8, '0');
            }

            this.insert(character);
        }

        return result;
    }

    decode(text) {
        let result = '';

        let symbol = getASCIIChar(text.slice(0, 8));
        result += symbol;
        this.insert(symbol);

        let node = this.root;
        let i = 8;
        while (i < text.length) {
            node = text[i] === '0' ? node.left : node.right;
            symbol = node.symbol;

            if (symbol) {
                if (symbol === 'NYT') {
                    symbol = getASCIIChar(text.slice(i + 1, i + 9));
                    i += 8;
                }

                result += symbol;
                this.insert(symbol);
                node = this.root;
            }
            i++;
        }

        return result;
    }
}

if (process.argv.length !== 5) {
    console.error('Usage: node index.js (decode|encode) [input] [output]');
    process.exit(1);
}

const decode = process.argv[2] === 'decode';
const input = process.argv[3];
const output = process.argv[4];

const coder = new AdaptiveHuffman();

fs.readFile(input, (error, buffer) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    let result;

    if (decode) {
        let padding = buffer[0];

        let codeString = '';
        for (let char of buffer.slice(1)) {
            codeString += char.toString(2).padStart(8, '0');
        }
        codeString = codeString.slice(0, -padding); // unpadding

        result = coder.decode(codeString);
    } else {
        let encoded = coder.encode(buffer.toString());
        let padding = (8 - (encoded.length % 8));

        encoded = padding.toString(2).padStart(8, '0') + encoded; // first bytes is padding
        encoded = encoded.padEnd(encoded.length + padding, '0'); // pad end

        result = Buffer.alloc(encoded.length / 8);

        let i = 0;
        while (i < encoded.length) {
            result.writeUInt8(parseInt(encoded.slice(i, i + 8), 2), i / 8);
            i += 8;
        }

        const compressionRatio = buffer.length / (encoded.length / 8);

        console.log(`Entropy: ${entropyAnalyzer(buffer).entropy}`);
        console.log(`Compression ratio: ${compressionRatio}`);
        console.log(`Avg code length: ${8/compressionRatio}`);
    }

    fs.writeFile(output, result, () => {
        console.log('Done');
    });
});