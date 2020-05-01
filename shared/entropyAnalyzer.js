/**
 * @argument buffer - Input buffer to analyze the entropy
 * @argument byteCallback - Optional callback which is called for every read byte 
 */
module.exports = (buffer, byteCallback) => {
    const byteStats = {};
    const conditionalByteStats = {};

    let entropy = 0;
    let conditionalEntropy = 0;

    for (let [index, byte] of buffer.entries()) {
        if (byteCallback) byteCallback(index, byte);

        byteStats[byte] = byteStats[byte] + 1 || 1;

        if (conditionalByteStats[byte]) { // yeah I love writing self-documenting, readable code, how did you know
            conditionalByteStats[byte][buffer[(index || 1) - 1]] = conditionalByteStats[byte][buffer[(index || 1) - 1]] + 1 || 1;
        } else {
            conditionalByteStats[byte] = {
                [buffer[(index || 1) - 1]]: 1
            };
        }
    }

    for (let [byte, byteCount] of Object.entries(byteStats)) {
        entropy += (Math.log2(buffer.length) - Math.log2(byteCount)) * byteCount;
        for (let conditionalByteCount of Object.values(conditionalByteStats[byte] || {})) {
            conditionalEntropy += (Math.log2(byteCount) - Math.log2(conditionalByteCount)) * conditionalByteCount;
        }
    }

    return {
        entropy: entropy / buffer.length,
        conditionalEntropy: conditionalEntropy / buffer.length
    };
}