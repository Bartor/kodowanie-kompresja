module.exports = {
    createCodebook
};

function DefaultDict(fn) {
    this.dict = {};
    this.get = function (key) {
        return this.dict[key] ? this.dict[key] : this.dict[key] = fn();
    }
}

function createCodebook(image, codebookSize, eps = 0.0001) {
    const c0 = averageVectors(image);
    let codebook = [c0];

    let averageDistortion = elementDistortion(c0, image);
    while (codebook.length < codebookSize) {
        [codebook, averageDistortion] = splitCodeblock(image, codebook, eps, averageDistortion);
    }

    return codebook;
}

function splitCodeblock(data, codebook, eps, initialaverageDistortion) {
    codebook = codebook
        .reduce((acc, e) => [...acc, createCodevector(e, eps), createCodevector(e, -eps)], []);

    let averageDistortion = 0;
    let error = 1 + eps;
    while (error > eps) {
        const closestsArray = Array(data.length).fill(null);
        const nearVectors = new DefaultDict(() => []);
        const nearIndices = new DefaultDict(() => []);

        for (let [id, d] of data.entries()) {
            let minimalDistance = Infinity;
            let closestIndex;

            for (let [ic, c] of codebook.entries()) {
                const distance = vectorDistance(d, c);
                if (distance < minimalDistance) {
                    minimalDistance = distance;
                    closestIndex = ic;
                    closestsArray[ic] = c;
                }
            }

            nearVectors.get(closestIndex).push(d);
            nearIndices.get(closestIndex).push(id);
        }

        for (let ic = 0; ic < codebook.length; ic++) {
            const vectors = nearVectors.get(ic);
            if (vectors) {
                const newC = averageVectors(vectors);
                codebook[ic] = newC;
                for (let index of nearIndices.get(ic)) {
                    closestsArray[index] = newC;
                }
            }
        }

        let previousAverageDistortion = averageDistortion > 0 ? averageDistortion : initialaverageDistortion;
        averageDistortion = listDistortion(closestsArray, data);

        error = (previousAverageDistortion - averageDistortion) / previousAverageDistortion;
    }

    return [
        codebook,
        averageDistortion
    ];
}

function vectorDistance(a, b) {
    return a.reduce((acc, e, i) => acc + (e - b[i]) ** 2, 0);
}

function createCodevector(codeBlock, eps) {
    return codeBlock.map(e => e * (eps + 1));
}

function averageVectors(vectors) {
    return vectors
        .reduce((acc, vector) => acc.map((e, i) => e + vector[i] / vectors.length), [0, 0, 0]);
}

function elementDistortion(element, data) {
    return data
        .reduce((acc, e) => acc + vectorDistance(e, element) / data.length, 0);
}

function listDistortion(input, data) {
    return input
        .reduce((acc, e, i) => acc + vectorDistance(e, data[i]) / data.length, 0);
}