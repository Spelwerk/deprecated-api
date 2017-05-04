var mysql = require('mysql'),
    pool = mysql.createPool(require('./../app/config').pool),
    bcrypt = require('bcrypt'),
    superuser = require('./../app/config').superuser,
    onion = require('./../app/onion');

var email = superuser.email,
    password = superuser.password;

bcrypt.hash(onion.hash(password), require('./../app/config').salt, function(error, hash) {
    if(error) {
        console.log(error);
        process.exit(1);
    } else {
        password = onion.encrypt(hash);

        var query = 'INSERT INTO user (id,email,password,displayname,admin,verify) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id = ?, email = ?, password = ?, displayname = ?, admin = ?, verify = ?';
        var array = [1, email, password, 'administrator', 1, 1];

        query = mysql.format(query,array);
        query = mysql.format(query,array);

        pool.query(query, function(err) {
            if(err) {
                console.log(err);
                process.exit(1);
            } else {
                console.log("Created Super User account with...\nemail: " + superuser.email + "\npassword: " + superuser.password);
                process.exit(0);
            }
        });
    }
});