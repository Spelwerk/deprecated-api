var async = require('async'),
    fs = require('fs'),
    hasher = require('./../app/hasher');

var secretsFile = './../app/config/secret.json',
    databaseFile = './../app/config/database.json',
    superuserFile = './../app/config/superuser.json',
    mailgunFile = './../app/config/mailgun.json';

var apiKey = hasher(20);

async.series([
    function(callback) {
        console.log('Creating secrets file...');

        fs.writeFile(secretsFile, '{\n  "api": "' + apiKey + '",\n  "jwt": "' + hasher(32) + '",\n  "aes": "' + hasher(32) + '",\n  "sha": "' + hasher(32) + '"\n}', function(err) {
            if(err) return callback(err);

            callback();
        });
    },
    function(callback) {
        console.log('Creating the database file...');

        fs.writeFile(databaseFile, '{\n  "host": "localhost",\n  "name": "spelwerk",\n  "username": "spelwerk",\n  "password": "' + hasher(32) + '"\n}', function(err) {
            if(err) return callback(err);

            callback();
        })
    },
    function(callback) {
        console.log('Creating superuser file...');

        fs.writeFile(superuserFile, '{\n  "email": "admin@admin",\n  "password": "' + hasher(32) + '",\n  "noreply": "noreply@spelwerk.se"\n}', function(err) {
            if(err) return callback(err);

            callback();
        })
    },
    function(callback) {
        console.log('Creating mailgun file...');

        fs.writeFile(mailgunFile, '{\n  "apikey": "",\n  "domain": ""\n}', function(err) {
            if(err) return callback(err);

            callback();
        });
    }
],function(err) {
    if(err) console.log(err);

    console.log("\nCreated secrets for the API.\nRemember the API Key: " + apiKey + '\n\nMake sure to fill the following files with the relevant information:');
    console.log(databaseFile);
    console.log(superuserFile);
    console.log(mailgunFile);
    console.log("\nWhen you have filled the information into the files, run the script: node install_admin.js");
    console.log("\nWhen the admin account has been created in the database, fill the remaining information into ./../app/config.js");

    process.exit(0);
});