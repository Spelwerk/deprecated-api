var mysql = require('mysql'),
    pool = mysql.createPool(require('./../app/config').pool),
    bcrypt = require('bcrypt'),
    superuser = require('./../app/config').superuser,
    onion = require('./../app/onion');

var username = superuser.username,
    password = superuser.password,
    email = superuser.email,
    first = superuser.firstname,
    last = superuser.surname;

bcrypt.hash(onion.hash(password), require('./../app/config').salt, function(error, hash) {
    if(error) {
        console.log(error);
        process.exit(1);
    } else {
        var pass = onion.encrypt(hash);

        var call = mysql.format('INSERT INTO user (id, username, password, email, admin, firstname, surname, verify) VALUES ' +
            '(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE username = ?, password = ?, email = ?, admin = ?, firstname = ?, surname = ?, verify = ?',
            [1, username, pass, email, 1, first, last, 1, username, pass, email, 1, first, last, 1]);

        pool.query(call, function(error, result) {
            if(error) {
                console.log(error);
                process.exit(1);
            } else {
                console.log("Created Super User account with ID: " + result.insertId + ". Login: " + username + " // " + password);
                process.exit(0);
            }
        });
    }
});