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

module.exports.secrets = secrets;
module.exports.pool = pool;
module.exports.superuser = superuser;

exports.base = '';
exports.port = 3001;
exports.salt = 12;