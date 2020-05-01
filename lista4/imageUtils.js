Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
};

class Pixel {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    sub(pixel) {
        return new Pixel((this.r - pixel.r).mod(256), (this.g - pixel.g).mod(256), (this.b - pixel.b).mod(256));
    }

    add(pixel) {
        return new Pixel((this.r + pixel.r) % 256, (this.g + pixel.g) % 256, (this.b + pixel.b) % 256);
    }

    div(num) {
        return new Pixel(Math.floor(this.r / num), Math.floor(this.g / num), Math.floor(this.b / num));
    }

    length() {
        return Math.sqrt((this.r / 255) ** 2 + (this.g / 255) ** 2 + (this.b / 255) ** 2);
    }

    toString() {
        return `(${this.r}, ${this.g}, ${this.b})`;
    }
}

function readTga(inputBuffer) {
    const height = inputBuffer[15] * 256 + inputBuffer[14]
    const width = inputBuffer[13] * 256 + inputBuffer[12]

    const result = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const index = 18 + 3 * (y * width + x);
            row.push(new Pixel(
                inputBuffer[index + 2],
                inputBuffer[index + 1],
                inputBuffer[index]
            ));
        }
        result.unshift(row);
    }


    return {
        width: width,
        height: height,
        colors: result[0].map((_, i) => result.map(row => row[i])), // transpose for colors[x][y]
        raw: inputBuffer.slice(18, inputBuffer.length - 26)
    };
}

function colorEntropy(colors) {
    let rStats = Array(256).fill(0);
    let gStats = Array(256).fill(0);
    let bStats = Array(256).fill(0);

    const count = colors[0].length * colors.length;

    for (let row of colors)
        for (let pixel of row) {
            rStats[pixel.r]++;
            gStats[pixel.g]++;
            bStats[pixel.b]++;
        }

    const fullStats = rStats.map((e, i) => e + gStats[i] + bStats[i]).filter(e => e);
    rStats = rStats.filter(e => e);
    gStats = gStats.filter(e => e);
    bStats = bStats.filter(e => e);

    let rRes = 0;
    let gRes = 0;
    let bRes = 0;
    let fullRes = 0;

    for (let r of rStats) rRes += r * Math.log2(r);
    for (let g of gStats) gRes += g * Math.log2(g);
    for (let b of bStats) bRes += b * Math.log2(b);
    for (let f of fullStats) fullRes += f * Math.log2(f);

    return {
        rEntropy: Math.log2(count) - rRes / count,
        gEntropy: Math.log2(count) - gRes / count,
        bEntropy: Math.log2(count) - bRes / count,
        fullEntropy: Math.log2(count * 3) - fullRes / (count * 3)
    };
}

const predictionSchemes = [
    (n, w, nw) => w,
    (n, w, nw) => n,
    (n, w, nw) => nw,
    (n, w, nw) => n.add(w).sub(nw),
    (n, w, nw) => n.add(w.sub(nw).div(2)),
    (n, w, nw) => w.add(n.sub(nw).div(2)),
    (n, w, nw) => n.add(w).div(2),
    (n, w, nw) => {
        if (nw.length() >= Math.max(n.length(), w.length())) {
            return n.length() > w.length() ? w : n;
        } else if (nw.length() <= Math.max(n.length(), w.length())) {
            return n.length() > w.length() ? n : w;
        } else {
            return w.add(n).sub(nw);
        }
    }
];

function jpegLs(colors, scheme, neighbourColor = new Pixel(0, 0, 0)) {
    const result = [];
    for (let row = 0; row < colors.length; row++) {
        const currentRow = [];
        for (let column = 0; column < colors[row].length; column++) {
            const n = colors[row][column - 1] || neighbourColor;
            const w = (colors[row - 1] || [])[column] || neighbourColor;
            const nw = (colors[row - 1] || [])[column - 1] || neighbourColor;

            currentRow.push(colors[row][column].sub(scheme(n, w, nw)));
        }
        result.push(currentRow);
    }
    return result;
}

module.exports = {
    Pixel,
    readTga,
    colorEntropy,
    predictionSchemes,
    jpegLs
};