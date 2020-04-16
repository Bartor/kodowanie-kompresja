function joinUint8Arrays(a, b) {
    let result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);

    return result;
}

function compress(buffer) {
    let currentDictSize = 256;

    const dict = {};
    for (let i = 0; i < currentDictSize; i++) {
        dict[String.fromCharCode(i)] = i;
    }

    let word = '';
    let result = [];

    for (let char of buffer) {
        let expandedWord = word + String.fromCharCode(char);

        if (dict.hasOwnProperty(expandedWord)) {
            word = expandedWord;
        } else {
            result.push(dict[word]);
            dict[expandedWord] = currentDictSize++;
            word = String.fromCharCode(char);
        }
    }

    if (word) {
        result.push(dict[word]);
    }

    return result;
}

function decompress(numberArray) {
    let currentDictSize = 256;

    const dict = {};
    for (let i = 0; i < currentDictSize; i++) {
        dict[i] = Uint8Array.of(i);
    }

    let word = Uint8Array.of(numberArray[0]);
    let result = word;
    let entry = new Uint8Array();

    for (let num of numberArray.slice(1)) {
        if (dict.hasOwnProperty(num)) {
            entry = dict[num];
        } else {
            if (num === currentDictSize) {
                entry = Uint8Array.of(word, word[0]);
            } else {
                throw 'Compression error';
            }
        }

        result = joinUint8Arrays(result, entry);
        dict[currentDictSize++] = Uint8Array.of(word, entry[0]);
        word = entry;
    }

    return Buffer.from(result);
}

module.exports = {
    compress: compress,
    decompress: decompress
};