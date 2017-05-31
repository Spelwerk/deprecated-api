var bases = require('bases');

var brew = 10000,
    base = 52;

function encode(int) {
    return bases.toBase(parseInt(int) + brew, base);
}

function decode(string) {
    var int = bases.fromBase(string, base);

    return parseInt(parseInt(int) - brew);
}

function unique(unique) {
    if(!parseInt(unique)) {
        unique = decode(unique);
    }

    return unique(unique);
}

module.exports.encode = encode;
module.exports.decode = decode;
module.exports.unique = unique;