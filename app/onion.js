var aes = require('nodejs-aes256'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    config = require('./config');

var secret = config.secret,
    salt = config.salt;

function hash(password) {
    var passHash = crypto.createHmac('sha256', secret.sha);
    passHash.update(password);
    return passHash.digest('hex');
}

function encrypt(password, callback) {
    var hashedPassword = hash(password);

    bcrypt.hash(hashedPassword, salt, function(err, result) {
        var encryptedPassword = aes.encrypt(secret.aes, result);

        callback(err, encryptedPassword);
    });
}

function verify(insertPassword, dbPassword, callback) {
    var encryptedInsertPassword = hash(insertPassword),
        encryptedDBPassword = aes.decrypt(secret.aes, dbPassword);

    bcrypt.compare(encryptedInsertPassword, encryptedDBPassword, callback);
}


module.exports.hash = hash;
module.exports.encrypt = encrypt;
module.exports.verify = verify;