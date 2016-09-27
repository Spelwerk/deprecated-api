var jwt = require('jwt-simple'),
    secret = require('./config').secrets.jwt;

function generate(req, jsonData) {
    var moment = require('moment'),
        hasher = require('./hasher'),
        start = moment.utc(),
        end = moment.utc().add(30, 'days');

        var ip = req.headers['x-forwarded-for'] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;

    var payload = {
        iat: start,
        exp: end,
        jti: hasher(16),
        iss: 'http://spelwerk.se/',
        oip: ip,
        sub: {
            id: jsonData.id,
            username: jsonData.username,
            admin: jsonData.admin,
            permissions: jsonData.permissions
        },
        agent: req.headers['user-agent']
    };

    return jwt.encode(payload, secret);
}

function validate(req) {
    return jwt.decode(req.headers.authorization, secret);
}

module.exports.generate = generate;
module.exports.validate = validate;