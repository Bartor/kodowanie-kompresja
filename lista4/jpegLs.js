Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
};

const predictionSchemes = [
    (n, w, nw) => w,
    (n, w, nw) => n,
    (n, w, nw) => nw,
    (n, w, nw) => n.add(w).sub(nw).mod(256),
    (n, w, nw) => n.add(w.sub(nw).div(2)).mod(256),
    (n, w, nw) => w.add(n.sub(nw).div(2)).mod(256),
    (n, w, nw) => n.add(w).div(2).mod(256),
    (n, w, nw) => {
        const r = nw.r >= Math.max(n.r, w.r) ? Math.min(n.r, w.r) : (nw.r <= Math.min(n.r, w.r) ? Math.max(n.r, w.r) : w.r + n.r - nw.r);
        const g = nw.g >= Math.max(n.g, w.g) ? Math.min(n.g, w.g) : (nw.g <= Math.min(n.g, w.g) ? Math.max(n.g, w.g) : w.g + n.g - nw.g);
        const b = nw.b >= Math.max(n.b, w.b) ? Math.min(n.b, w.b) : (nw.b <= Math.min(n.b, w.b) ? Math.max(n.b, w.b) : w.b + n.b - nw.b);

        return new Pixel(r, g, b).mod(256);
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

            currentRow.push(colors[row][column].sub(scheme(n, w, nw)).mod(256));
        }
        result.push(currentRow);
    }
    return result;
}

module.exports = {
    predictionSchemes,
    jpegLs
};