const CODES = {
    GAMMA: '0000',
    DELTA: '0001',
    OMGEA: '0010',
    FIBONACCI: '0011'
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

function* bitBufferReader(buffer) {
    for (let byte of buffer) {
        for (let i = 0; i < 8; i++) {
            yield getBit(byte, i) !== 0 ? 1 : 0;
        }
    }
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
    for (let bit of bitBufferReader(buffer)) {
        if (!reading) {
            if (bit) {
                reading = true;
            } else {
                currLenght++;
            }
        }

        if (reading) {
            currLenght--;
            if (bit) {
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

    for (let bit of bitBufferReader(buffer)) {
        if (readingState === DELTA_READING_STATES.LOOKING) {
            if (bit) {
                readingState = DELTA_READING_STATES.LENGTH;
            } else {
                lengthLength++;
            }
        }

        if (readingState === DELTA_READING_STATES.LENGTH) {
            lengthLength--;
            if (bit) {
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
            if (bit) {
                currNumber += (1 << numberLength);
            }
            if (numberLength === 0) {
                resultArray.push(currNumber);
                numberLength = 0;

                readingState = DELTA_READING_STATES.LOOKING;
            }
        }

    }

    return resultArray;
}

function omegaEncode(numberArray) {
    let resultString = '';

    for (let num of numberArray) {
        let currentEncoding = '0';
        let k = num;

        while (k > 1) {
            const binary = k.toString(2);
            currentEncoding = binary + currentEncoding;
            k = binary.length - 1;
        }

        resultString += currentEncoding;
    }
    let padding = 8 - (resultString.length % 8);

    resultString = CODES.OMGEA + padding.toString(2).padStart(4, '0') + resultString.padEnd(resultString.length + padding, '0');

    const resultArray = new Uint8Array(resultString.length / 8);
    for (let i = 0; i < resultString.length; i += 8) {
        resultArray[i / 8] = parseInt(resultString.slice(i, i + 8), 2);
    }

    return resultArray;
}

function omegaDecode(buffer, padding) {
    let resultArray = [];

    const bitReader = bitBufferReader(buffer);
    let bitsRead = 0;

    while (bitsRead < buffer.length * 8 - padding) {
        let number = 1;

        bitsRead++;
        let nextVal = bitReader.next().value;

        while (nextVal) {
            let len = number;
            number = 1;
            for (let i = 0; i < len; i++) {
                number <<= 1;
                bitsRead++;
                if (bitReader.next().value) {
                    number |= 1;
                }
            }

            bitsRead++;
            nextVal = bitReader.next().value;
        }
        resultArray.push(number);
    }

    return resultArray;
}

function fibEncode(numberArray) {
    let resultString = '';
    let fib = [1, 2]; // F[2], F[3] 

    function largestFibBefore(n) {
        let i = 2;
        while (fib[i - 1] <= n) {
            if (i + 1 > fib.length) fib[i] = fib[i - 1] + fib[i - 2];
            i++;
        }

        return i - 2;
    }

    for (let num of numberArray) {
        let code = '1';
        let index = largestFibBefore(num);

        while (num) {
            code += '1';
            num -= fib[index];
            index--;
            while (index >= 0 && fib[index] > num) {
                code += '0';
                index--;
            }
        }

        resultString += code.split('').reverse().join('');
    }
    let padding = 8 - (resultString.length % 8);

    resultString = CODES.FIBONACCI + padding.toString(2).padStart(4, '0') + resultString.padEnd(resultString.length + padding, '0');

    const resultArray = new Uint8Array(resultString.length / 8);
    for (let i = 0; i < resultString.length; i += 8) {
        resultArray[i / 8] = parseInt(resultString.slice(i, i + 8), 2);
    }

    return resultArray;
}

function fibDecode(buffer) {
    let fib = [0, 1];

    function getFib(i) {
        while (i + 1 > fib.length) {
            fib[fib.length] = fib[fib.length - 1] + fib[fib.length - 2];
        }

        return fib[i];
    }

    let resultArray = [];

    let skip = false;
    let lastBit = 0;
    let accumulatedFibs = [];
    for (let bit of bitBufferReader(buffer)) {
        if (lastBit && bit) {
            resultArray.push(
                accumulatedFibs.reduce((acc, v, i) => acc + (v ? getFib(i + 2) : 0), 0)
            );
            accumulatedFibs = [];
            lastBit = 0;
            continue;
        } else {
            accumulatedFibs.push(bit);
        }

        lastBit = bit;
    }

    return resultArray;
}

function decode(buffer) {
    const codingType = ((buffer[0] & 0b1111000) >> 4).toString(2).padStart(4, '0');
    const padding = buffer[0] & 0b00001111;

    switch (codingType) {
        case CODES.DELTA:
            return deltaDecode(buffer.slice(1));
        case CODES.OMGEA:
            return omegaDecode(buffer.slice(1), padding);
        case CODES.GAMMA:
            return gammaDecode(buffer.slice(1));
        case CODES.FIBONACCI:
            return fibDecode(buffer.slice(1));
    }
}

module.exports = {
    omega: omegaEncode,
    gamma: gammaEncode,
    delta: deltaEncode,
    fibonacci: fibEncode,
    decode: decode
};