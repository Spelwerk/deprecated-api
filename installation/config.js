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

module.exports.secrets = secrets;
module.exports.pool = pool;

exports.port = 3000;
exports.salt = 13;

if(!secrets.api) console.log('api: ' + hasher(40));
if(!secrets.jwt) console.log('jwt: ' + hasher(40));
if(!secrets.aes) console.log('aes: ' + hasher(40));
if(!secrets.sha) console.log('sha: ' + hasher(40));
if(!secrets.dbp) console.log('dbp: ' + hasher(40));