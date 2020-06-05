const { Pixel } = require('../shared/imageUtils');

const findNearest = (array, value) =>
    array.reduce((minIndex, _, i, arr) =>
        minIndex = Math.abs(value - arr[i]) < Math.abs(value - arr[minIndex]) ? i : minIndex, 0);

const roundAndLimit = (array, min = 0, max = 256) =>
    array.map(e =>
        Math.min(256, Math.max(Math.round(e), 0)));

class CustomQuantizer {
    constructor(levels) {
        this.levels = levels;
        this.rQuantizer = Array(2 ** levels).fill(0).map((_, i) => 256 / (2 ** levels) * (i + 0.5));
        this.gQuantizer = Array(2 ** levels).fill(0).map((_, i) => 256 / (2 ** levels) * (i + 0.5));
        this.bQuantizer = Array(2 ** levels).fill(0).map((_, i) => 256 / (2 ** levels) * (i + 0.5));
    }

    updateWith(pixelArray) {
        const rChange = Array(2 ** this.levels).fill(0);
        const gChange = Array(2 ** this.levels).fill(0);
        const bChange = Array(2 ** this.levels).fill(0);
        for (let pixel of pixelArray) {
            const rNearest = findNearest(this.rQuantizer, pixel.r);
            const gNearest = findNearest(this.gQuantizer, pixel.g);
            const bNearest = findNearest(this.bQuantizer, pixel.b);

            rChange[rNearest] += (pixel.r - this.rQuantizer[rNearest]) / pixelArray.length * 2 ** this.levels;
            gChange[gNearest] += (pixel.g - this.gQuantizer[gNearest]) / pixelArray.length * 2 ** this.levels;
            bChange[bNearest] += (pixel.b - this.bQuantizer[bNearest]) / pixelArray.length * 2 ** this.levels;
        }
        this.rQuantizer = this.rQuantizer.map((e, i) => e + rChange[i]);
        this.gQuantizer = this.gQuantizer.map((e, i) => e + gChange[i]);
        this.bQuantizer = this.bQuantizer.map((e, i) => e + bChange[i]);
    }

    quantizePixels(pixelArray) {
        const [rQ, gQ, bQ] = this.getQuntizerArrays();
        return pixelArray.map(pixel => new Pixel(findNearest(rQ, pixel.r), findNearest(gQ, pixel.g), findNearest(bQ, pixel.b)));
    }

    getQuntizerArrays() {
        return [
            roundAndLimit(this.rQuantizer),
            roundAndLimit(this.gQuantizer),
            roundAndLimit(this.bQuantizer)
        ];
    }
}

module.exports = CustomQuantizer;