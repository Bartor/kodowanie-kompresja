const fs = require('fs');

if (process.argv.length !== 4) {
    console.error('Usage: node compare.js <file1> <file2>');
    process.exit(1);
}

fs.readFile(process.argv[2], (e1, buff1) => {
    fs.readFile(process.argv[3], (e2, buff2) => {
        if (e1 || e2) {
            console.error(e1, e2);
            process.exit(1);
        }

        if (buff1.length !== buff2.length) {
            console.error('Files are not the same size');
            process.exit(2);
        }

        let errors = 0;
        for (let b = 0; b < buff1.length; b++) {
            errors += (buff1[b] & 0b11110000) !== (buff2[b] & 0b11110000);
            errors += (buff1[b] & 0b1111) !== (buff2[b] & 0b1111);
        }

        console.log(`Different blocks: ${errors}`);
    });
});