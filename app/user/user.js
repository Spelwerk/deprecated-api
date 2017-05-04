var rest = require('./../rest'),
    mysql = require('mysql'),
    async = require('async'),
    bcrypt = require('bcrypt'),
    logger = require('./../logger'),
    config = require('./../config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    tokens = require('./../tokens'),
    onion = require('./../onion'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

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
                rest.query(pool, 'SELECT * FROM user WHERE id = ? AND deleted IS NULL', [user.id], callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT permission.name FROM user_has_permission LEFT JOIN permission ON permission.id = user_has_permission.permission_id WHERE user_has_permission.user_id = ?', [user.id], callback);
            },
            function(callback) {
                rest.query(pool, 'UPDATE user SET login_secret = NULL, login_timeout = NULL WHERE id = ?', [user.id], callback);
            }
        ],function(err,results) {
            user.select = results[0][0];
            user.permissions = results[1];

            user.token = tokens.generate(req, user.select, user.permissions);

            callback(err, user.token);
        });
    }

    // GET

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call, null, {"displayname": "ASC"});
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(pool, req, res, query);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE user.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id], {"displayname": "ASC"});
    });

    router.get(path + '/token', function(req, res) {
        if(!req.headers.token) {
            res.status(404).send({header: 'Missing Token', message: 'missing token'});
        } else {
            var token = tokens.decode(req);

            if(!token) {
                res.status(400).send({header: 'Invalid Token', message: 'invalid token'});
            } else {
                res.status(200).send({user: token.sub});
            }
        }
    });

    // GET RELATIONS

    router.get(path + '/id/:id/person', function(req, res) {
        var call = 'SELECT ' +
            'user_has_person.person_id AS id, ' +
            'user_has_person.secret, ' +
            'user_has_person.owner, ' +
            'user_has_person.favorite, ' +
            'person.nickname AS nickname, ' +
            'person.occupation AS occupation ' +
            'FROM user_has_person ' +
            'LEFT JOIN person ON person.id = user_has_person.person_id ' +
            'WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'person.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"id":"DESC"});
    });

    router.get(path + '/id/:id/world', function(req, res) {
        var call = 'SELECT ' +
            'user_has_world.world_id AS id, ' +
            'user_has_world.owner, ' +
            'world.name ' +
            'FROM user_has_world ' +
            'LEFT JOIN world ON world.id = user_has_world.world_id ' +
            'WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"id":"DESC"});
    });

    router.get(path + '/id/:id/world/calculated', function(req, res) {
        var call = 'SELECT ' +
            'user_has_world.world_id AS id, ' +
            'user_has_world.owner, ' +
            'world.name ' +
            'FROM user_has_world ' +
            'LEFT JOIN world ON world.id = user_has_world.world_id ' +
            'WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.calculated = 1 AND ' +
            'world.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"id":"DESC"});
    });

    // USER

    router.post(path, function(req, res) {
        var user = {},
            insert = {};

        insert.email = req.body.email;
        insert.password = req.body.password;
        insert.displayname = req.body.displayname;
        insert.firstname = req.body.firstname;
        insert.surname = req.body.surname;

        insert.hashed = onion.hash(insert.password);

        async.series([
            function(callback) {
                bcrypt.hash(insert.hashed, config.salt, function(err, result) {
                    if(err) return callback(err);

                    insert.encrypted = onion.encrypt(result);

                    callback();
                });
            },
            function(callback) {
                insert.verify = {};
                insert.verify.secret = hasher(128);
                insert.verify.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

                rest.query(pool, 'INSERT INTO user (email,password,displayname,firstname,surname,verify_secret,verify_timeout) VALUES (?,?,?,?,?,?,?)', [insert.email, insert.encrypted, insert.displayname, insert.firstname, insert.surname, insert.verify.secret, insert.verify.timeout], function(err, result) {
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
            if(err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({token: user.token});
            }
        });
    });

    router.put(path + '/id/:id', function(req, res) {
        var user = {},
            insert = {};

        user.token = tokens.decode(req);

        insert.id = req.params.id;
        insert.displayname = req.body.displayname;
        insert.firstname = req.body.firstname;
        insert.surname = req.body.surname;

        if(!user.token) {
            res.status(400).send({code: 0, message: 'User not logged in.'});
        } else if(!user.token.sub.admin && user.token.sub.id !== insert.id) {
            res.status(403).send({code: 0, message: 'Forbidden.'});
        } else {
            rest.query(pool, 'INSERT INTO user (displayname,firstname,surname) VALUES (?,?,?) WHERE id = ?', [insert.displayname, insert.firstname, insert.surname, insert.id], function(err) {
                if (err) {
                    res.status(500).send({code: err.code, message: err.message});
                } else {
                    res.status(200).send();
                }
            });
        }
    });

    router.put(path + '/id/:id/admin', function(req, res) {
        var admin = {},
            insert = {};

        insert.id = req.params.id;
        insert.admin = req.body.admin;

        admin.token = tokens.decode(req);

        if(!admin.token) {
            res.status(400).send({code: 0, message: 'User not logged in.'});
        } else if(!admin.token.sub.admin) {
            res.status(403).send({code: 0, message: 'Forbidden.'});
        } else {
            rest.query(pool, 'UPDATE user SET admin = ? WHERE id = ?', [insert.admin, insert.id], function(err) {
                if (err) {
                    res.status(500).send({code: err.code, message: err.message});
                } else {
                    res.status(200).send();
                }
            });
        }
    });

    router.delete(path + '/id/:id', function(req, res) {
        var user = {},
            insert = {};

        insert.id = req.params.id;

        user.token = tokens.decode(req);

        if(!user.token) {
            res.status(400).send({code: 0, message: 'User not logged in.'});
        } else if(!user.token.sub.admin && user.token.sub.id !== insert.id) {
            res.status(403).send({code: 0, message: 'Forbidden.'});
        } else {
            rest.query(pool, 'UPDATE user SET deleted = CURRENT_TIMESTAMP WHERE id = ?', [insert.id], function(err) {
                if (err) {
                    res.status(500).send({code: err.code, message: err.message});
                } else {
                    res.status(200).send();
                }
            });
        }
    });

    // VERIFY

    router.post(path + '/verify/email', function(req, res) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.verify = {};
        insert.verify.secret = hasher(128);
        insert.verify.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        async.series([
            function(callback) {
                rest.query(pool, 'UPDATE user SET verify_secret = ?, verify_timeout = ? WHERE email = ?', [insert.verify.secret, insert.verify.timeout, insert.email], callback);
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
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.post(path + '/verify/verify', function(req, res) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;

        async.series([
            function(callback) {
                rest.query(pool, 'SELECT id, verify_timeout AS timeout FROM user WHERE verify_secret = ?', [insert.secret], function(err,result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback({status: 403, code: 0, message: 'Wrong Secret.'});

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(user.now < user.timeout) return callback({status: 400, code: 0, message: 'Timeout Expired.'});

                callback();
            },
            function(callback) {
                rest.query(pool, 'UPDATE user SET verify = 1, verify_secret = NULL, verify_timeout = NULL WHERE id = ?', [user.id], callback);
            },
            function(callback) {
                loginToken(req, user.id, function(err, result) {
                    if(err) return callback(err);

                    user.token = result;

                    callback();
                });
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({token: user.token});
            }
        });
    });

    // LOGIN

    router.post(path + '/login/password', function(req, res) {
        var user = {},
            insert = {};

        insert.email = req.body.email;
        insert.password = req.body.password;

        async.series([
            function(callback) {
                rest.query(pool, 'SELECT id,password,twofactor FROM user WHERE email = ? AND deleted IS NULL', [insert.email], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback({status: 404, code: 0, message: 'Missing Email.'});

                    user.id = result[0].id;
                    user.password = result[0].password;

                    insert.encrypted = onion.hash(insert.password);
                    user.encrypted = onion.decrypt(user.password);

                    callback(err);
                });
            },
            function(callback) {
                bcrypt.compare(insert.encrypted, user.encrypted, function(err,result) {
                    if(err) return callback(err);

                    user.accepted = result;

                    if(!user.accepted) return callback({status: 401, code: 0, message: 'Wrong Password.'});

                    callback(err);
                });
            },
            function(callback) {
                loginToken(req, user.id, function(err, result) {
                    if(err) return callback(err);

                    user.token = result;

                    callback(err);
                });
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({token: user.token});
            }
        });
    });

    router.post(path + '/login/email', function(req, res) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.login = {};
        insert.login.secret = hasher(128);
        insert.login.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        async.series([
            function(callback) {
                rest.query(pool, 'UPDATE user SET login_secret = ?, login_timeout = ? WHERE email = ? AND deleted IS NULL', [insert.login.secret, insert.login.timeout, insert.email], callback);
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
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.post(path + '/login/verify', function(req, res) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;

        async.series([
            function(callback) {
                rest.query(pool, 'SELECT id, login_timeout AS timeout FROM user WHERE login_secret = ?', [insert.secret], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback({status: 403, code: 0, message: 'Wrong Secret.'});

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(user.now > user.timeout) return callback({status: 403, code: 0, message: 'Timeout Expired.'});

                callback();
            },
            function(callback) {
                rest.query(pool, 'UPDATE user SET login_secret = NULL, login_timeout = NULL WHERE id = ?', [user.id], callback);
            },
            function(callback) {
                loginToken(req, user.id, function(err, result) {
                    if(err) return callback(err);

                    user.token = result;

                    callback();
                });
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({token: user.token});
            }
        });
    });

    // PASSWORD

    router.post(path + '/reset/email', function(req, res) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.reset = {};
        insert.reset.secret = hasher(128);
        insert.reset.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        async.series([
            function(callback) {
                rest.query(pool, 'UPDATE user SET reset_secret = ?, reset_timeout = ? WHERE email = ? AND deleted IS NULL', [insert.reset.secret, insert.reset.timeout, insert.email], callback);
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
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.post(path + '/reset/verify', function(req, res) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;
        insert.password = req.body.password;

        insert.hashed = onion.hash(insert.password);

        async.series([
            function(callback) {
                rest.query(pool, 'SELECT id, reset_timeout AS timeout FROM user WHERE reset_secret = ?', [insert.secret], function(err, result) {
                    if(err) return callback(err);

                    if(!result[0]) return callback({status: 403, code: 0, message: 'Wrong Secret.'});

                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback();
                });
            },
            function(callback) {
                if(user.now > user.timeout) return callback({status: 403, code: 0, message: 'Timeout Expired.'});

                callback();
            },
            function(callback) {
                bcrypt.hash(insert.hashed, config.salt, function(err,result) {
                    if(err) return callback(err);

                    insert.encrypted = onion.encrypt(result);

                    callback();
                });
            },
            function(callback) {
                rest.query(pool, 'UPDATE user SET password = ?, reset_secret = NULL, reset_timeout = NULL WHERE id = ?', [insert.encrypted, user.id], callback);
            },
            function(callback) {
                loginToken(req, user.id, function(err,result) {
                    if(err) return callback(err);

                    user.token = result;

                    callback();
                });
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({token: user.token});
            }
        });
    });

    // RELATIONSHIPS

    require('./user_has_friend')(pool, router, table, path);

    require('./user_has_person')(pool, router, table, path);

    require('./user_has_story')(pool, router, table, path);

    require('./user_has_world')(pool, router, table, path);
};