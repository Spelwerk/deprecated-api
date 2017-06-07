var secrets = require('./config/secret.json'),
    database = require('./config/database.json'),
    superuser = require('./config/superuser.json'),
    mailgun = require('./config/mailgun.json'),
    defaults = require('./config/defaults.json');

module.exports.secret = secret;
module.exports.superuser = superuser;
module.exports.mailgun = mailgun;

exports.port = 0;
exports.salt = 0;
exports.timeoutTTL = 0;

exports.baseBase = 0;
exports.baseBrew = 0;

exports.debugMode = true;
exports.noreply = superuser.noreply;

var pool = {
    host: database.host,
    database: database.name,
    user: database.username,
    password: database.password,
    connectionLimit: 100,
    waitForConnections: true,
    queueLimit: 0,
    debug: false,
    wait_timeout: 28800,
    connect_timeout: 10
};

var basePage = '';

var links = {
    user: {
        create: basePage + 'user/create/verify/',
        password: basePage + 'user/password/verify/',
        email: basePage + 'user/password/verify/',
        login: basePage + 'post/login?s='
    }
};

module.exports.pool = pool;
module.exports.basePage = basePage;
module.exports.links = links;
module.exports.defaults = defaults;
