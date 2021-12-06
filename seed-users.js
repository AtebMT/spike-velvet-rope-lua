const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const numberOfKeys = 1000000;
const stream = fs.createWriteStream("tests/user-keys.csv", { flags: 'a' });

[...Array(numberOfKeys)].forEach(function (item, index) {
    const generated = uuidv4();
    stream.write(generated + "\n");
});
stream.end();