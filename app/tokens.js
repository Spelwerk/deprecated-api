var jwt = require('jsonwebtoken'),
    secret = require('./config').secrets.jwt,
    base = require('./config').base;

function generate(req, user, permissions) {
    permissions = permissions || null;

    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var now = Math.floor(Date.now() / 1000),
        end = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    var payload = {
        iat: now,
        exp: end,
        iss: base,
        oip: ip,
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
    return jwt.verify(req.headers.token, secret);
}

function validate(req, token) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var now = Math.floor(Date.now() / 1000),
        exp = token.exp;

    var validity = true;

    if(now > exp) validity = false;

    if(token.oip != ip) validity = false;

    if(!token.sub.id) validity = false;

    return validity;
}

module.exports.generate = generate;
module.exports.decode = decode;
module.exports.validate = validate;