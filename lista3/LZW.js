function appendUint8(a, b) {
    let aLength = a instanceof Uint8Array ? a.length : 1;
    let bLength = b instanceof Uint8Array ? b.length : 1;
    let result = new Uint8Array(aLength + bLength);

    if (a instanceof Uint8Array) {
        result.set(a);
    } else {
        result[0] = a;
    }

    if (b instanceof Uint8Array) {
        result.set(b, aLength);
    } else {
        result[aLength] = b;
    }

    return result;
}

function compress(buffer) {
    let result = [];

    const dict = {};
    let size = 256;
    for (let i = 0; i < size; i++) {
        dict[String.fromCharCode(i)] = i;
    }

    let previous = String.fromCharCode(buffer[0]);
    for (let char of buffer.slice(1)) {
        if (dict.hasOwnProperty(previous + String.fromCharCode(char))) {
            previous += String.fromCharCode(char);
        } else {
            result.push(dict[previous]);

            dict[previous + String.fromCharCode(char)] = size++;

            previous = String.fromCharCode(char);
        }
    }
    result.push(dict[previous]);

    return result.map(e => e + 1);
}

// decompression is really slow and unoptimized
function decompress(numberArray) {
    numberArray = numberArray.map(e => e - 1);

    let result = Uint8Array.of(numberArray[0]);

    const dict = {};
    let size = 256;

    for (let i = 0; i < size; i++) {
        dict[i] = Uint8Array.of(i);
    }

    let old = numberArray[0];
    let c = new Uint8Array();
    let s = new Uint8Array();
    for (let num of numberArray.slice(1)) {
        if (dict.hasOwnProperty(num)) {
            s = dict[num];
        } else {
            s = dict[old];
            s = appendUint8(s, c);
        }

        result = appendUint8(result, s);

        c = s[0];
        dict[size++] = appendUint8(dict[old], c);

        old = num;
    }

    return Buffer.from(result);
}

module.exports = {
    compress: compress,
    decompress: decompress
};