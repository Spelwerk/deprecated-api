var jwt = require('jsonwebtoken'),
    secret = require('./config').secrets.jwt,
    base = require('./config').base;

function generate(req, user, permissions) {
    permissions = permissions || null;

    var now = Math.floor(Date.now() / 1000),
        end = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    var payload = {
        iat: now,
        exp: end,
        iss: base,
        sub: {
            id: user.id,
            email: user.email,
            displayname: user.displayname,
            admin: user.admin,
            verified: user.verify,
            permissions: permissions
        },
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

        if(!token.sub.id) validity = false;

        if(validity) {
            decoded = token;
        }
    }

    return decoded;
}

module.exports.generate = generate;
module.exports.decode = decode;