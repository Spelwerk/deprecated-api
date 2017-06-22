var secret = require('./config/secret.json'),
    database = require('./config/database.json'),
    superuser = require('./config/superuser.json'),
    mailgun = require('./config/mailgun.json'),
    defaults = require('./config/defaults.json'),
    timeout = require('./config/timeout.json');

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

var basePage = 'http://localhost/';

var links = {
    user: {
        create: basePage + 'user/create/verify/',
        password: basePage + 'user/password/verify/',
        email: basePage + 'user/password/verify/',
        login: basePage + 'post/login?s='
    }
};

exports.port = 3003;
exports.salt = 12;
exports.timeoutTTL = 60;
exports.baseBase = 52;
exports.baseBrew = 12000;
exports.debugMode = true;
exports.noreply = superuser.noreply;

module.exports.secret = secret;
module.exports.superuser = superuser;
module.exports.mailgun = mailgun;
module.exports.timeout = timeout;

module.exports.pool = pool;
module.exports.basePage = basePage;
module.exports.links = links;
module.exports.defaults = defaults;
