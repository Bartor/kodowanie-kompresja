const imageUtils = require('../shared/imageUtils');
const coding = require('../shared/coding');
const fs = require('fs');

const HEADERS = {
    HIGH: 0b00010000,
    LOW: 0b00000000,
};

const HIGH_PASS = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
];
const LOW_PASS = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
];

class BitmapWrapper {
    constructor(parsedTga) {
        this.bitmap = parsedTga.colors.reverse();
        this.height = parsedTga.height;
        this.width = parsedTga.width;
    }

    get(row, column) {
        if (row < 0) row = 0;
        if (row >= this.bitmap.length) row = this.bitmap.length - 1;

        if (column < 0) column = 0;
        if (column >= this.bitmap[row].length) column = this.bitmap[row].length - 1;

        return this.bitmap[row][column];
    }

    toArray() {
        return this.bitmap.reduce((acc, row) => [...acc, ...row], []);
    }
}

function filter(bitmap, row, column, weights) {
    let pixel = new imageUtils.Pixel(0, 0, 0);
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            pixel = pixel.add(bitmap.get(row + i, column + j).mul(weights[i + 1][j + 1]));
        }
    }

    const weightSum = weights.reduce((acc, r) => acc + r.reduce((a, e) => a + e, 0), 0);
    if (weightSum <= 0) weightSum = 1;

    return pixel.div(weightSum).normalize();
}

function diffEncode(pixels) {
    let previous = pixels[0];
    const diffs = [previous];

    for (let pixel of pixels.slice(1)) {
        diffs.push(pixel.sub(previous));
        previous = pixel;
    }

    return diffs;
}

function diffDecode(diffs) {
    let previous = diffs[0];
    const result = [previous];

    for (let diff of diffs.slice(1)) {
        result.push(previous = previous.add(diff));
    }

    return result;
}

function pixelsToNums(pixels) {
    let nums = [];
    for (let pixel of pixels) {
        for (let color of pixel.bgr()) {
            nums.push(color);
        }
    }

    return coding.mapNegative(nums);
}

function numsToPixels(nums) {
    const pixels = [];
    for (let i = 0; i < nums.length; i += 3) {
        pixels.push(new imageUtils.Pixel(nums[i + 2], nums[i + 1], nums[i]));
    }
    return pixels;
}

function encodeHighpass(buffer, quantizationStep) {
    const bitmap = new BitmapWrapper(imageUtils.readTga(buffer, false));

    const filtered = [];
    for (let i = 0; i < bitmap.height; i++) {
        for (let j = 0; j < bitmap.width; j++) {
            filtered.push(filter(bitmap, i, j, HIGH_PASS));
        }
    }

    const step = Math.floor(256 / (2 ** quantizationStep));
    const quantized = filtered.map(pixel => pixel.div(step));
    const nums = pixelsToNums(quantized);

    const header = Buffer.from([HEADERS.HIGH | quantizationStep]);
    const outputBuffer = coding.fibonacci(nums);
    const out = Buffer.concat([header, buffer.slice(0, 18), outputBuffer]);
    fs.writeFile('high_pass.encoded', out, () => {
        console.log('high_pass.encoded done');
    });
}

function decodeHighpass(buffer, quantizationStep) {
    const nums = coding.unmapNegative(coding.decode(buffer.slice(18)));
    const step = 2 ** (8 - quantizationStep);
    const pixels = numsToPixels(nums).map(pixel => pixel.mul(step));

    const outputBuffer = Buffer.alloc(pixels.length * 3);
    const out = Buffer.concat([buffer.slice(0, 18), outputBuffer]);

    let i = 18;
    for (let pixel of pixels) {
        for (let color of pixel.bgr()) {
            out[i++] = color;
        }
    }

    fs.writeFile('high_pass.tga', out, () => {
        console.log('high_pass.tga done');
    });
}

function encodeLowpass(buffer) {
    const bitmap = new BitmapWrapper(imageUtils.readTga(buffer, false));

    let filtered = [];
    for (let i = 0; i < bitmap.height; i++) {
        for (let j = 0; j < bitmap.width; j++) {
            filtered.push(filter(bitmap, i, j, LOW_PASS));
        }
    }

    const diffed = diffEncode(filtered);
    const nums = pixelsToNums(diffed);

    const header = Buffer.from([HEADERS.LOW]);
    const outputBuffer = coding.fibonacci(nums);
    const out = Buffer.concat([header, buffer.slice(0, 18), outputBuffer]);
    fs.writeFile('low_pass.encoded', out, () => {
        console.log('low_pass.encoded done');
    });
}

function decodeLowpass(buffer) {
    const nums = coding.unmapNegative(coding.decode(buffer.slice(18)));
    const pixels = numsToPixels(nums);

    const undiffed = diffDecode(pixels);
    const outputBuffer = Buffer.alloc(pixels.length * 3);
    const out = Buffer.concat([buffer.slice(0, 18), outputBuffer]);

    let i = 18;
    for (let pixel of undiffed) {
        for (let color of pixel.bgr()) {
            out[i++] = color;
        }
    }

    fs.writeFile('low_pass.tga', out, () => {
        console.log('low_pass.tga done');
    });
}

fs.readFile(process.argv[2], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    if (process.argv.length !== 4) {
        console.log('Usage: node index.js <input file> <2*k quan steps> OR node index.js <input to decode> -d');
    }

    if (process.argv[3] === '-d') {
        if (buffer[0] & HEADERS.HIGH) {
            const step = buffer[0] & 0b1111;
            decodeHighpass(buffer.slice(1), step);
        } else if (buffer[0] === HEADERS.LOW) {
            decodeLowpass(buffer.slice(1));
        }
    } else {
        const step = Number.parseInt(process.argv[3]);
        encodeHighpass(buffer, step);
        encodeLowpass(buffer);
    }
});