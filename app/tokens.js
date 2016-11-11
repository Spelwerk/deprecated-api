var jwt = require('jwt-simple'),
    moment = require('moment'),
    hasher = require('./hasher'),
    secrets = require('./config').secrets,
    base = require('./config').base;

function generate(req, jsonData, permissions) {
    permissions = permissions || null;

    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var now = moment.utc(),
        end = moment.utc().add(30, 'days');

    var payload = {
        iat: now,
        exp: end,
        jti: hasher(16),
        iss: base,
        oip: ip,
        sub: {
            id: jsonData.id,
            username: jsonData.username,
            firstname: jsonData.firstname,
            surname: jsonData.surname,
            admin: jsonData.admin,
            verified: jsonData.verified,
            permissions: permissions
        },
        agent: req.headers['user-agent']
    };

    return jwt.encode(payload, secrets.jwt);
}

function decode(req) {
    return jwt.decode(req.headers.token, secrets.jwt);
}

function validate(req, token) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var now = moment.utc(),
        exp = moment.utc(token.exp);

    var validity = true;

    if(now > exp) validity = false;

    if(token.oip != ip) validity = false;

    if(!token.sub.id) validity = false;

    return validity;
}

module.exports.generate = generate;
module.exports.decode = decode;
module.exports.validate = validate;