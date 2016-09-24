var aes = require('nodejs-aes256'),
    crypto = require('crypto'),
    secrets = config = require('./config').secrets;

function hash(password) {
    var passHash = crypto.createHmac('sha256', secrets.sha);
    passHash.update(password);
    return passHash.digest('hex');
}

function encrypt(password) {
    return aes.encrypt(secrets.aes, password)
}

function decrypt(password) {
    return aes.decrypt(secrets.aes, password)
}

module.exports.hash = hash;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;