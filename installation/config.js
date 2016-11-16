var secrets = {
    api: '',
    jwt: '',
    aes: '',
    sha: '',
    dbp: ''
};

var pool = {
    host: 'localhost',
    user: 'spelwerk',
    database: 'spelwerk',
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

exports.base = '';
exports.port = 3001;
exports.salt = 10;