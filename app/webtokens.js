var jwt = require('jwt-simple');
var secret = require('./config').keys.secret;

function generate(request) {
    var payload = {
        id: request.id,
        sub: request.sub,
        agent: request.agent,
        iss: 'http://spelwerk.se/',
        permissions: request.permissions,
        admin: request.admin,
        exp: Math.floor(new Date().getTime()/1000) + 7*24*60*60
    };

    return jwt.encode(payload, secret);
}

function validate(req) {
    return jwt.decode(req.headers.authorization, secret);
}

module.exports.generate = generate;
module.exports.validate = validate;