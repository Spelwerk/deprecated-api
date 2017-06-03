var mysql = require('mysql'),
    async = require('async'),
    pool = mysql.createPool(require('./../app/config').pool),
    superuser = require('./../app/config').superuser,
    onion = require('./../app/onion');

var email = superuser.email,
    password = superuser.password,
    encrypted = null;

async.series([
    function(callback) {
        onion.encrypt(password, function(err, result) {
            encrypted = result;

            callback(err);
        });
    },
    function(callback) {
        var query = 'INSERT INTO user (id,email,password,displayname,admin,verify) VALUES (1,?,?,?,1,1) ON DUPLICATE KEY UPDATE id = 1, email = ?, password = ?, displayname = ?, admin = 1, verify = 1';
        var array = [email, encrypted, 'administrator'];

        query = mysql.format(query, array);
        query = mysql.format(query, array);

        pool.query(query, function(err) {
            callback(err, "Created Super User account with...\nemail: " + superuser.email + "\npassword: " + superuser.password);
        });
    }
],function(err, result) {
    if(err) console.log(err);

    console.log(result[1]);

    process.exit(1);
});