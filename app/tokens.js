var jwt = require('jsonwebtoken'),
    secret = require('./config').secret.jwt,
    base = require('./config').base;

function generate(req, email) {
    var now = Math.floor(Date.now() / 1000),
        end = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    var payload = {
        iat: now,
        exp: end,
        iss: base,
        email: email,
        agent: req.headers['user-agent']
    };

    return jwt.sign(payload, secret);
}

function decode(req) {
    var validity = true,
        decoded = null;

    if(req.headers.token) {
        var token = jwt.verify(req.headers.token, secret);

        var iat = token.iat,
            exp = token.exp,
            now = Math.floor(Date.now() / 1000);

        if(now < iat) validity = false;

        if(now > exp) validity = false;

        if(!token.email) validity = false;

        if(validity) {
            decoded = token;
        }
    }

    return decoded;
}

module.exports.generate = generate;
module.exports.decode = decode;