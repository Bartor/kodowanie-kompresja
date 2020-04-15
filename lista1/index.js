const fs = require('fs');
const entropyAnalyzer = require('../shared/entropyAnalyzer');

if (process.argv.length !== 3) {
    console.error('Usage: node index.js [file to analyze]');
    process.exit(1);
}

fs.readFile(process.argv[2], (error, buffer) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    const stats = entropyAnalyzer(buffer);

    console.log(`Entropy: ${stats.entropy}`);
    console.log(`Conditional entropy: ${stats.conditionalEntropy}`);
});