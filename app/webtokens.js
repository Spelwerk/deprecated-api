var jwt = require('jwt-simple'),
    secret = require('./config').keys.secret;

function generate(req, jsonData) {
    var moment = require('moment'),
        hasher = require('./hasher'),
        start = moment.utc(),
        end = moment.utc().add(30, 'days');

    var payload = {
        iat: start,
        exp: end,
        jti: hasher(16),
        iss: 'http://spelwerk.se/',
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