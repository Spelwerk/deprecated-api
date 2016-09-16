var config = require('./../app/config');

module.exports.server = {
    url: 'http://localhost:3000/api'
};

module.exports.keys = {
    user: config.keys.user,
    pass: config.keys.pass,
    debug: config.keys.debug
};

