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
        for (let node of this.nodes.reverse()) {
            if (node.weight === weight) {
                this.nodes.reverse();
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

            this.nodes.unshift(internal);
            this.nodes.unshift(spawn);

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

    getASCIIChar(binaryString) {
        return String.fromCharCode(parseInt(binaryString, 2));
    }

    decode(text) {
        let result = '';

        let symbol = this.getASCIIChar(text.slice(0, 8));
        result += symbol;
        this.insert(symbol);

        let node = this.root;
        let i = 8;
        while (i < text.length) {
            node = text[i] === '0' ? node.left : node.right;
            symbol = node.symbol;

            if (symbol) {
                if (symbol === 'NYT') {
                    symbol = this.getASCIIChar(text.slice(i + 1, i + 9));
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

const e = new AdaptiveHuffman();
const encoded = e.encode('testa       aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa duisa dashdsoiuhasddas8 sauha ds9hadsb ou da sau09da90 8dhadf ijhasdojhdsaolioasdoijsado iasdjposadijdasopiadjs opidja po dijaspodijasp oidjapos idjaposi djopasijd po');
const d = new AdaptiveHuffman();
const decoded = d.decode(encoded);

console.log(encoded);
console.log(decoded);