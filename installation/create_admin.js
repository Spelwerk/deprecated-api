var mysql = require('mysql'),
    pool = mysql.createPool(require('./../app/config').pool),
    bcrypt = require('bcrypt'),
    superuser = require('./../app/config').superuser,
    onion = require('./../app/onion');

var email = superuser.email,
    password = superuser.password,
    displayname = superuser.displayname,
    first = superuser.firstname,
    last = superuser.surname;

bcrypt.hash(onion.hash(password), require('./../app/config').salt, function(error, hash) {
    if(error) {
        console.log(error);
        process.exit(1);
    } else {
        var pass = onion.encrypt(hash);

        var query = 'INSERT INTO user (id, displayname, password, email, admin, firstname, surname, verify, twofactor) VALUES ' +
            '(?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id = ?, displayname = ?, password = ?, email = ?, admin = ?, firstname = ?, surname = ?, verify = ?, twofactor = ?';

        var array = [1, displayname, pass, email, 1, first, last, 1, 0];

        var call = mysql.format(query,array);
            call = mysql.format(call,array);

        pool.query(call, function(error, result) {
            if(error) {
                console.log(error);
                process.exit(1);
            } else {
                console.log("Created Super User account with ID: " + result.insertId + ". Login: " + displayname + " // " + password);
                process.exit(0);
            }
        });
    }
});