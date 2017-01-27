var fs = require('fs'),
    hasher = require('./../app/hasher');

var configFile =
    "exports.base = '';\nexports.port = 3001;\nexports.salt = 12;\n\n" +
    "var secrets = {\n" +
    "    api: '" + hasher(40) + "',\n" +
    "    jwt: '" + hasher(40) + "',\n" +
    "    aes: '" + hasher(40) + "',\n" +
    "    sha: '" + hasher(40) + "',\n" +
    "    dbp: '" + hasher(40) + "',\n" +
    "    sus: '" + hasher(40) + "'\n" +
    "};\n\n" +
    "var pool = {\n" +
    "    host: '',\n" +
    "    user: '',\n" +
    "    database: '',\n" +
    "    connectionLimit: 100,\n" +
    "    waitForConnections: true,\n" +
    "    queueLimit: 0,\n" +
    "    password: secrets.dbp,\n" +
    "    debug: false,\n" +
    "    wait_timeout: 28800,\n" +
    "    connect_timeout: 10\n" +
    "};\n\n" +
    "var superuser = {\n" +
    "    username: 'admin',\n" +
    "    firstname: 'admin',\n" +
    "    surname: 'admin',\n" +
    "    password: secrets.sus,\n" +
    "    email: 'noreply@email.com'\n" +
    "};\n\n" +
    "var smtp = {\n" +
    "    host: '',\n" +
    "    port: 2525,\n" +
    "    secure: true,\n" +
    "    auth: {\n" +
    "        user: '',\n" +
    "        pass: ''\n" +
    "    }\n" +
    "};\n\n" +
    "var links = {\n" +
    "    user_verification: '',\n" +
    "    user_recovery: ''\n" +
    "};\n\n" +
    "module.exports.secrets = secrets;\n" +
    "module.exports.pool = pool;\n" +
    "module.exports.superuser = superuser;\n" +
    "module.exports.smtp = smtp;\n" +
    "module.exports.links = links;";

fs.writeFile("./../app/config.js", configFile, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file has been created");
});