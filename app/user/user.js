var rest = require('./../rest'),
    async = require('async'),
    moment = require('moment'),
    logger = require('./../logger'),
    config = require('./../config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    tokens = require('./../tokens'),
    onion = require('./../onion'),
    hasher = require('./../hasher');

module.exports = function(router, tableName, path) {
    path = '/user';

    var query = 'SELECT ' +
        'id, ' +
        'displayname, ' +
        'email, ' +
        'verify, ' +
        'admin, ' +
        'firstname, ' +
        'surname, ' +
        'created, ' +
        'updated, ' +
        'deleted ' +
        'FROM user';

    function loginToken(req, userId, callback) {
        var user = {};

        user.id = userId;

        async.series([
            function(callback) {
                rest.query('SELECT email FROM user WHERE id = ? AND deleted IS NULL', [user.id], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback({status: 404, code: 0, message: 'User not found.'});

                    user.email = result[0].email;

                    callback();
                });
            },
            function(callback) {
                user.token = tokens.generate(req, user.email);

                callback();
            },
            function(callback) {
                rest.query('INSERT INTO usertoken (user_id,token) VALUES (?,?) ON DUPLICATE KEY UPDATE token = VALUES (token)', [user.id, user.token], callback);
            },
            function(callback) {
                rest.query('UPDATE user SET login_secret = NULL, login_timeout = NULL WHERE id = ?', [user.id], callback);
            }
        ],function(err) {
            callback(err, user.token);
        });
    }

    // GET

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE deleted is NULL';
        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE deleted is NOT NULL';
        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE user.id = ?';
        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/validate', function(req, res, next) {
        if(!req.user) return next('Forbidden');

        res.status(200).send({user: req.user.select});
    });

    router.get(path + '/tokens', function(req, res, next) {
        rest.query('SELECT token FROM usertoken WHERE user_id = ?', [req.user.id], function(err, result) {
            if(err) return next(err);

            res.status(200).send({data: result});
        });
    });

    // USER

    router.post(path, function(req, res, next) {
        var user = {},
            insert = {};

        insert.email = req.body.email;
        insert.password = req.body.password || hasher(128);
        insert.displayname = req.body.displayname || req.body.email;

        async.series([
            function(callback) {
                onion.encrypt(insert.password, function(err, result) {
                    insert.encrypted = result;

                    callback(err);
                });
            },
            function(callback) {
                insert.verify = {};
                insert.verify.secret = hasher(128);
                insert.verify.timeout = moment().add(config.timeoutTTL, 'm').format("YYYY-MM-DD HH:mm:ss");

                rest.query('INSERT INTO user (email,password,displayname,verify_secret,verify_timeout) VALUES (?,?,?,?,?)', [insert.email, insert.encrypted, insert.displayname, insert.verify.secret, insert.verify.timeout], function(err, result) {
                    user.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                var subject = 'User Verification';
                var text =
                    '<b>Hello!</b>' +
                    '<br/>' +
                    'Use the following verification code to verify your account creation: <a href="' + config.links.user.verify.new + insert.verify.secret + '">' + insert.verify.secret + '</a>' +
                    '<br/>'
                ;

                rest.sendMail(insert.email, subject, text, callback);
            },
            function(callback) {
                loginToken(req, user.id, function(err, result) {
                    if(err) return callback(err);

                    user.token = result;

                    callback();
                });
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: user.id, token: user.token});
        });
    });

    router.put(path + '/id/:id', function(req, res, next) {
        var insert = {};

        insert.id = req.params.id;
        insert.displayname = req.body.displayname;
        insert.firstname = req.body.firstname;
        insert.surname = req.body.surname;

        if(!req.user.token || (!req.user.admin && req.user.id !== insert.id)) return next({status: 403, message: 'Forbidden.'});

        rest.query('INSERT INTO user (displayname,firstname,surname) VALUES (?,?,?) WHERE id = ?', [insert.displayname, insert.firstname, insert.surname, insert.id], function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/admin', function(req, res, next) {
        var insert = {};

        insert.id = req.params.id;
        insert.admin = req.body.admin;

        if(!req.user.admin) return next({status: 403, message: 'Forbidden.'});

        rest.query('UPDATE user SET admin = ? WHERE id = ?', [insert.admin, insert.id], function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        var insert = {};

        insert.id = req.params.id;

        if(!req.user.admin && req.user.id !== insert.id) return next({status: 403, message: 'Forbidden'});

        rest.query('UPDATE user SET deleted = CURRENT_TIMESTAMP WHERE id = ?', [insert.id], function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    // VERIFY

    router.post(path + '/verify/email', function(req, res, next) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.verify = {};
        insert.verify.secret = hasher(128);
        //insert.verify.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);
        insert.verify.timeout = moment().add(config.timeoutTTL, 'm').format("YYYY-MM-DD HH:mm:ss");

        async.series([
            function(callback) {
                rest.query('UPDATE user SET verify_secret = ?, verify_timeout = ? WHERE email = ?', [insert.verify.secret, insert.verify.timeout, insert.email], callback);
            },
            function(callback) {
                var subject = 'User Verification';
                var text =
                    '<b>Hello!</b>' +
                    '<br/>' +
                    'Use the following verification code to verify your account creation: <a href="' + config.links.user.verify.new + insert.verify.secret + '">' + insert.verify.secret + '</a>' +
                    '<br/>'
                ;

                rest.sendMail(insert.email, subject, text, callback);
            }
        ],function(err) {
            if(err) return next({status: 500, message: err});

            res.status(200).send();
        });
    });

    router.post(path + '/verify/verify', function(req, res, next) {
        var user = {},
            insert = {};

        insert.secret = req.body.secret;
        insert.displayname = req.body.displayname;
        insert.firstname = req.body.firstname;
        insert.surname = req.body.surname;
        insert.password = req.body.password;

        async.series([
            function(callback) {
                rest.query('SELECT id,verify_timeout,created AS timeout FROM user WHERE verify_secret = ?', [insert.secret], function(err,result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback('Wrong Secret.');

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(moment().isBefore(moment(user.timeout).format("YYYY-MM-DD HH:mm:ss"))) return callback('Timeout Expired.');

                callback();
            },
            function(callback) {
                onion.encrypt(insert.password, function(err, result) {
                    insert.encrypted = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('UPDATE user SET password = ?, displayname = ?, firstname = ?, surname = ?, verify = 1, verify_secret = NULL, verify_timeout = NULL WHERE id = ?', [insert.encrypted, insert.displayname, insert.firstname, insert.surname, user.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    // LOGIN

    router.post(path + '/login/password', function(req, res, next) {
        var user = {},
            insert = {};

        insert.email = req.body.email;
        insert.password = req.body.password;

        async.series([
            function(callback) {
                rest.query('SELECT id,password FROM user WHERE email = ? AND deleted IS NULL', [insert.email], function(err, result) {
                    if(!result[0]) return callback('Missing Email.');

                    user.id = result[0].id;
                    user.password = result[0].password;

                    callback(err);
                });
            },
            function(callback) {
                onion.verify(insert.password, user.password, function(err, result) {
                    if(!result) return callback('Wrong Password.');

                    callback(err);
                });
            },
            function(callback) {
                loginToken(req, user.id, function(err, result) {
                    user.token = result;

                    callback(err);
                });
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: user.id, token: user.token});
        });
    });

    router.post(path + '/login/email', function(req, res, next) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.login = {};
        insert.login.secret = hasher(128);
        insert.login.timeout = moment().add(config.timeoutTTL, 'm').format("YYYY-MM-DD HH:mm:ss");

        async.series([
            function(callback) {
                rest.query('UPDATE user SET login_secret = ?, login_timeout = ? WHERE email = ? AND deleted IS NULL', [insert.login.secret, insert.login.timeout, insert.email], callback);
            },
            function (callback) {
                var subject = 'User Verification';
                var text =
                    '<b>Hello!</b>' +
                    '<br/>' +
                    'Use the following verification code to login to your account: <a href="' + config.links.user.verify.login + insert.login.secret + '">' + insert.login.secret + '</a>' +
                    '<br/>'
                ;

                rest.sendMail(insert.email, subject, text, callback);
            }
        ],function(err) {
            if(err) return next({status: 500, message: err});

            res.status(200).send();
        });
    });

    router.post(path + '/login/verify', function(req, res, next) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;

        async.series([
            function(callback) {
                rest.query('SELECT id, login_timeout AS timeout FROM user WHERE login_secret = ?', [insert.secret], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback('Wrong Secret.');

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(moment().isBefore(moment(user.timeout).format("YYYY-MM-DD HH:mm:ss"))) return callback('Timeout Expired.');

                callback();
            },
            function(callback) {
                rest.query('UPDATE user SET login_secret = NULL, login_timeout = NULL WHERE id = ?', [user.id], callback);
            },
            function(callback) {
                loginToken(req, user.id, function(err, result) {
                    if(err) return callback(err);

                    user.token = result;

                    callback();
                });
            }
        ],function(err) {
            if(err) return next({status: 500, message: err});

            res.status(200).send({id: user.id, token: user.token});
        });
    });

    // EMAIL

    router.post(path + '/mail/email', function(req, res, next) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.reset = {};
        insert.reset.secret = hasher(128);
        insert.reset.timeout = moment().add(config.timeoutTTL, 'm').format("YYYY-MM-DD HH:mm:ss");

        async.series([
            function(callback) {
                rest.query('UPDATE user SET reset_secret = ?, reset_timeout = ? WHERE email = ? AND deleted IS NULL', [insert.reset.secret, insert.reset.timeout, insert.email], callback);
            },
            function(callback) {
                var subject = 'Email Change';
                var text =
                    '<b>Hello!</b>' +
                    '<br/>' +
                    'Use the following verification code to change your email: <a href="' + config.links.user.verify.reset + insert.reset.secret + '">' + insert.reset.secret + '</a>' +
                    '<br/>'
                ;

                rest.sendMail(insert.email, subject, text, callback);
            }
        ],function(err) {
            if(err) return next({status: 500, message: err});

            res.status(200).send();
        });
    });

    router.post(path + '/mail/verify', function(req, res, next) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;
        insert.email = req.body.email;

        async.series([
            function(callback) {
                rest.query('SELECT id, reset_timeout AS timeout FROM user WHERE reset_secret = ?', [insert.secret], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback('Wrong Secret.');

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(moment().isBefore(moment(user.timeout).format("YYYY-MM-DD HH:mm:ss"))) return callback('Timeout Expired.');

                callback();
            },
            function(callback) {
                rest.query('UPDATE user SET email = ?, reset_secret = NULL, reset_timeout = NULL WHERE id = ?', [insert.email, user.id], callback);
            }
        ],function(err) {
            if(err) return next({status: 500, message: err});

            res.status(200).send();
        });
    });

    // PASSWORD

    router.post(path + '/reset/email', function(req, res, next) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.reset = {};
        insert.reset.secret = hasher(128);
        insert.reset.timeout = moment().add(config.timeoutTTL, 'm').format("YYYY-MM-DD HH:mm:ss");

        async.series([
            function(callback) {
                rest.query('UPDATE user SET reset_secret = ?, reset_timeout = ? WHERE email = ? AND deleted IS NULL', [insert.reset.secret, insert.reset.timeout, insert.email], callback);
            },
            function(callback) {
                var subject = 'Password Reset';
                var text =
                    '<b>Hello!</b>' +
                    '<br/>' +
                    'Use the following verification code to reset your password: <a href="' + config.links.user.verify.reset + insert.reset.secret + '">' + insert.reset.secret + '</a>' +
                    '<br/>'
                ;

                rest.sendMail(insert.email, subject, text, callback);
            }
        ],function(err) {
            if(err) return next({status: 500, message: err});

            res.status(200).send();
        });
    });

    router.post(path + '/reset/verify', function(req, res, next) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;
        insert.password = req.body.password;

        async.series([
            function(callback) {
                rest.query('SELECT id, reset_timeout AS timeout FROM user WHERE reset_secret = ?', [insert.secret], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback('Wrong Secret.');

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(moment().isBefore(moment(user.timeout).format("YYYY-MM-DD HH:mm:ss"))) return callback('Timeout Expired.');

                callback();
            },
            function(callback) {
                onion.encrypt(insert.password, function(err, result) {
                    insert.encrypted = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('UPDATE user SET password = ?, reset_secret = NULL, reset_timeout = NULL WHERE id = ?', [insert.encrypted, user.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    // RELATIONSHIPS

    require('./user_has_augmentation')(router, path);

    require('./user_has_background')(router, path);

    require('./user_has_bionic')(router, path);

    require('./user_has_doctrine')(router, path);

    require('./user_has_expertise')(router, path);

    require('./user_has_focus')(router, path);

    require('./user_has_friend')(router, path);

    require('./user_has_gift')(router, path);

    require('./user_has_imperfection')(router, path);

    require('./user_has_location')(router, path);

    require('./user_has_manifestation')(router, path);

    require('./user_has_milestone')(router, path);

    require('./user_has_person')(router, path);

    require('./user_has_protection')(router, path);

    require('./user_has_skill')(router, path);

    require('./user_has_species')(router, path);

    require('./user_has_story')(router, path);

    require('./user_has_weapon')(router, path);

    require('./user_has_world')(router, path);
};