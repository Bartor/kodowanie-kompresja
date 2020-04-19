const CODES = {
    GAMMA: '0000',
    DELTA: '0001',
    OMGEA: '0010'
};

const DELTA_READING_STATES = {
    LOOKING: 0,
    LENGTH: 1,
    NUMBER: 2
};

function getBit(byte, bit) {
    return byte & [
        0b10000000, // 0..
        0b01000000,
        0b00100000,
        0b00010000,
        0b00001000,
        0b00000100,
        0b00000010,
        0b00000001, // ..7
    ][bit];
}

function gammaEncode(numberArray) {
    let resultString = '';
    for (let num of numberArray) {
        let binary = num.toString(2);
        for (let i = 1; i < binary.length; i++) resultString += '0';
        resultString += binary;
    }
    let padding = 8 - (resultString.length % 8);

    resultString = CODES.GAMMA + padding.toString(2).padStart(4, '0') + resultString.padEnd(resultString.length + padding, '0');

    const resultArray = new Uint8Array(resultString.length / 8);
    let i = 0;
    for (let i = 0; i < resultString.length; i += 8) {
        resultArray[i / 8] = parseInt(resultString.slice(i, i + 8), 2);
    }

    return resultArray;
}

function gammaDecode(buffer) {
    let resultArray = [];

    let reading = false;
    let currLenght = 1;
    let currNumber = 0;
    for (let byte of buffer) {
        for (let bit = 0; bit < 8; bit++) {
            if (!reading) {
                if (getBit(byte, bit)) {
                    reading = true;
                } else {
                    currLenght++;
                }
            }

            if (reading) {
                currLenght--;
                if (getBit(byte, bit)) {
                    currNumber += (1 << currLenght);
                }
                if (currLenght === 0) {
                    resultArray.push(currNumber);

                    currNumber = 0;
                    currLenght = 1;
                    reading = false;
                }
            }
        }
    }

    return resultArray;
}

function deltaEncode(numberArray) {
    let resultString = '';
    for (let num of numberArray) {
        let binary = num.toString(2);
        let binaryLength = binary.length.toString(2);
        for (let i = 1; i < binaryLength.length; i++) resultString += '0';
        resultString += binaryLength;
        resultString += binary.slice(1);
    }
    let padding = 8 - (resultString.length % 8);

    resultString = CODES.DELTA + padding.toString(2).padStart(4, '0') + resultString.padEnd(resultString.length + padding, '0');

    const resultArray = new Uint8Array(resultString.length / 8);
    for (let i = 0; i < resultString.length; i += 8) {
        resultArray[i / 8] = parseInt(resultString.slice(i, i + 8), 2);
    }

    return resultArray;
}

function deltaDecode(buffer) {
    let resultArray = [];

    let readingState = DELTA_READING_STATES.LOOKING;

    let lengthLength = 1;
    let numberLength = 0;
    let currNumber = 0;

    for (let byte of buffer) {
        for (let bit = 0; bit < 8; bit++) {
            if (readingState === DELTA_READING_STATES.LOOKING) {
                if (getBit(byte, bit)) {
                    readingState = DELTA_READING_STATES.LENGTH;
                } else {
                    lengthLength++;
                }
            }

            if (readingState === DELTA_READING_STATES.LENGTH) {
                lengthLength--;
                if (getBit(byte, bit)) {
                    numberLength += (1 << lengthLength);
                }
                if (lengthLength === 0) {
                    readingState = DELTA_READING_STATES.NUMBER;

                    currNumber = (1 << --numberLength);

                    if (numberLength === 0) {
                        resultArray.push(currNumber);
                        numberLength = 0;

                        readingState = DELTA_READING_STATES.LOOKING;
                    }
                    lengthLength = 1;
                }
            } else if (readingState === DELTA_READING_STATES.NUMBER) {
                numberLength--;
                if (getBit(byte, bit)) {
                    currNumber += (1 << numberLength);
                }
                if (numberLength === 0) {
                    resultArray.push(currNumber);
                    numberLength = 0;

                    readingState = DELTA_READING_STATES.LOOKING;
                }
            }
        }
    }

    return resultArray;
}

const toEncode = [2, 1, 3, 7, 2137, 222, 333, 7698];
const encoded = deltaEncode(toEncode);
const decoded = deltaDecode(encoded.slice(1)); // drop first byte

console.log(decoded);