var secrets = {
    api: '',
    jwt: '',
    aes: '',
    sha: '',
    dbp: ''
};

var pool = {
    host: '',
    user: '',
    database: '',
    connectionLimit: 100,
    waitForConnections: true,
    queueLimit: 0,
    password: secrets.dbp,
    debug: false,
    wait_timeout: 28800,
    connect_timeout: 10
};

var superuser = {
    username: '',
    password: '',
    email: '',
    firstname: '',
    surname: ''
};

var smtp = {
    host: '',
    port: 2525,
    username: '',
    password: ''
};

module.exports.secrets = secrets;
module.exports.pool = pool;
module.exports.superuser = superuser;
module.exports.smtp = smtp;

exports.base = '';
exports.port = 3001;
exports.salt = 12;

if(!secrets.api) { console.log('api key suggestion: ' + require('./hasher')(40)); }
if(!secrets.jwt) { console.log('jwt key suggestion: ' + require('./hasher')(40)); }
if(!secrets.aes) { console.log('aes key suggestion: ' + require('./hasher')(40)); }
if(!secrets.sha) { console.log('sha key suggestion: ' + require('./hasher')(40)); }
if(!secrets.dbp) { console.log('dbp key suggestion: ' + require('./hasher')(40)); }
if(!superuser.password) { console.log('superuser password suggestion: ' + require('./hasher')(40)); }