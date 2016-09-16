var crypto = require('crypto');

exports.randomHex = function(len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex')
        .slice(0,len);
};

exports.randomInt = function(low,high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

exports.randomDate = function() {
    var ryear = Math.floor(Math.random() * (2015 - 2005) + 1999);
    var rmonth = Math.floor(Math.random() * (12 - 1) + 1);
    var rday = Math.floor(Math.random() * (28 - 1) + 1);
    var rhour = Math.floor(Math.random() * (23 - 1) + 1);
    var rminute = Math.floor(Math.random() * (59 - 1) + 1);
    var rsecond = Math.floor(Math.random() * (59 - 1) + 1);

    return ryear + "-" + rmonth + "-" + rday + " " + rhour + ":" + rminute + ":" + rsecond;
};