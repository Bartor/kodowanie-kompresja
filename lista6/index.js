const imageUtils = require('../shared/imageUtils');
const fs = require('fs');

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
    constructor(bitmap) {
        this.bitmap = bitmap;
    }

    get(row, column) {
        if (row < 0) row = 0;
        if (row >= this.bitmap.length) row = this.bitmap.length - 1;

        if (column < 0) column = 0;
        if (column >= this.bitmap[row].length) column = this.bitmap[row].length - 1;

        return this.bitmap[row][column];
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

    const res = pixel.div(weightSum).normalize();
    return res;
}

fs.readFile(process.argv[2], (err, buffer) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const original = imageUtils.readTga(buffer, false);
    const bitmap = new BitmapWrapper(original.colors.reverse());

    let filtered = [];
    for (let i = 0; i < original.height; i++) {
        for (let j = 0; j < original.width; j++) {
            filtered.push(filter(bitmap, i, j, LOW_PASS));
        }
    }

    let i = 18;
    for (let filteredPixel of filtered) {
        for (let color of filteredPixel.bgr()) {
            buffer[i++] = color;
        }
    }

    fs.writeFile(process.argv[3], buffer, () => {
        console.log('Done');
    });
});