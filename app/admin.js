var mysql = require('mysql'),
    pool = mysql.createPool(require('./config').pool),
    bcrypt = require('bcrypt'),
    superuser = require('./config').superuser,
    onion = require('./onion');

bcrypt.hash(onion.hash(superuser.password), require('./config').salt, function(error, hash) {
    if(error) {
        console.log(error);
    } else {
        var call = 'INSERT INTO user ' +
            '(id, username, password, email, admin, firstname, surname, verified)' +
            ' VALUES ' +
            '(\'1\', \'' + superuser.username + '\', \'' + onion.encrypt(hash) + '\', \'' + superuser.email + '\', \'1\', \'' + superuser.firstname + '\', \'' + superuser.surname + '\', \'1\')';

        pool.query(call, function(error, result) {
            if(error) {
                console.log(error);
            } else {
                console.log(result);
            }
        });
    }
});