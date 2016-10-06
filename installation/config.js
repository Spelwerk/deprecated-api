exports.keys = {
    api:    ''
};

exports.secrets = {
    jwt: '',
    aes: '',
    sha: ''
};

exports.pool = {
    connectionLimit: 100,
    waitForConnections: true,
    queueLimit: 0,
    host: '',
    user: '',
    password: '',
    database: '',
    debug: false,
    wait_timeout: 28800,
    connect_timeout: 10
};

exports.port = 3000;

exports.salt = 10;