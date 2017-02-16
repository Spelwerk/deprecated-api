exports.base = '';
exports.port = 3001;
exports.salt = 12;
exports.timeoutTTL = 60;

var secrets = {
    api: '',
    jwt: '',
    aes: '',
    sha: '',
    dbp: '',
    sus: ''
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
    username: 'admin',
    firstname: 'admin',
    surname: 'admin',
    password: secrets.sus,
    email: ''
};

var mailgun = {
    apikey: '',
    domain: ''
};

var links = {
    user_new_verify: '',
    user_password_reset: '',
    user_login_with_hash: ''
};

module.exports.secrets = secrets;
module.exports.pool = pool;
module.exports.superuser = superuser;
module.exports.mailgun = mailgun;
module.exports.links = links;