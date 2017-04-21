var hasher = require('./../app/hasher');

var length = process.argv[2] || 32;
var amount = process.argv[3] || 6;

for(var i = 0; i < amount; i++) {
    console.log(hasher(length));
}