var rest = require('./../rest'),
    mysql = require('mysql'),
    async = require('async'),
    bcrypt = require('bcrypt'),
    nodemailer = require('nodemailer'),
    logger = require('./../logger'),
    config = require('./../config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    tokens = require('./../tokens'),
    onion = require('./../onion'),
    hasher = require('./../hasher');

const saltRounds = config.salt;

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var file = 'user.js';

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
                var call = mysql.format('SELECT * FROM user WHERE id = ? AND deleted IS NULL',[user.id]);

                pool.query(call,callback);
            },
            function(callback) {
                var call = mysql.format('SELECT permission.name FROM user_has_permission LEFT JOIN permission ON permission.id = user_has_permission.permission_id WHERE user_has_permission.user_id = ?',
                    [user.id]);

                pool.query(call,callback);
            },
            function(callback) {
                var call = mysql.format('UPDATE user SET login_secret = NULL, login_timeout = NULL WHERE id = ?',[user.id]);

                pool.query(call,callback);
            }
        ],function(err,results) {
            user.select = results[0][0][0];
            user.permissions = results[1][0];

            user.token = tokens.generate(req, user.select, user.permissions);

            callback(err, user.token);
        });
    }

    function sendMail(res, mail) {
        var composer = mailcomposer(mail);

        composer.build(function(err, message) {
            var dataToSend = {
                to: mail.to,
                message: message.toString('ascii')
            };

            mailgun.messages().sendMime(dataToSend, function(err) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send();
                }
            });
        });
    }

    // GET

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call, null, {"displayname": "ASC"});
    });

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
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

        insert.verify = {};
        insert.verify.secret = hasher(128);
        insert.verify.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        insert.hashed = onion.hash(insert.password);

        async.series([
            function(callback) {
                bcrypt.hash(insert.hashed, config.salt, function(err,result) {
                    insert.encrypted = onion.encrypt(result);

                    callback(err);
                });
            },
            function(callback) {
                var call = mysql.format('INSERT INTO user (email,password,displayname,firstname,surname,verify_secret,verify_timeout) VALUES (?,?,?,?,?,?,?)',
                    [insert.email,insert.encrypted,insert.displayname,insert.firstname,insert.surname,insert.verify.secret,insert.verify.timeout]);

                pool.query(call,function(err,result) {
                    user.id = result.insertId;

                    console.log(err);

                    callback(err);
                });
            },
            function(callback) {
                var mail = {
                    from: config.superuser.email,
                    to: insert.email,
                    subject: 'User Verification',
                    text: '',
                    html: '<b>Hello!</b><br><br>Use the following verification code to verify your account creation: <a href="' + config.links.user.verify.new + insert.verify.secret + '">' + insert.verify.secret + '</a><br><br>'
                };

                var composer = mailcomposer(mail);

                composer.build(function(err,message) {
                    var dataToSend = {
                        to: mail.to,
                        message: message.toString('ascii')
                    };

                    mailgun.messages().sendMime(dataToSend,function(err,result) {
                        console.log(err);
                        console.log(result);
                        callback(err,result);
                    });
                });
            },
            function(callback) {
                loginToken(req, user.id, function(err,result) {
                    user.token = result;

                    console.log(err);
                    console.log(result);

                    callback(err);
                });
            }
        ],function(err) {
            if(!err) {
                res.status(200).send({token: user.token});
            } else {
                res.status(500).send(err);
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

        if(user.token && (user.token.sub.admin || user.token.sub.id === insert.id)) {
            var call = mysql.format('INSERT INTO user (displayname,firstname,surname) VALUES (?,?,?) WHERE id = ?'
                [insert.displayname,insert.firstname,insert.surname,insert.id]);

            pool.query(call,function(err) {
                if(!err) {
                    res.status(200).send();
                } else {
                    res.status(500).send(err);
                }
            });
        } else {
            res.status(403).send({header: 'Not Allowed', message: 'You are either not an administrator, or the current user deleting this profile.'});
        }
    });

    router.put(path + '/id/:id/admin', function(req, res) {
        var admin = {},
            insert = {};

        insert.id = req.params.id;
        insert.admin = req.body.admin;

        admin.token = tokens.decode(req);

        if(admin.token) {
            var call = mysql.format('UPDATE user SET admin = ? WHERE id = ?',[insert.admin,insert.id]);

            pool.query(call,function(err) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send();
                }
            });
        } else {
            res.status(400).send('Invalid Administrator Token');
        }
    });

    router.delete(path + '/id/:id', function(req, res) {
        var user = {},
            insert = {};

        insert.id = req.params.id;

        user.token = tokens.decode(req);

        if(user.token && (user.token.sub.admin || user.token.sub.id === insert.id)) {
            rest.OLD_DELETE(pool, req, res, table);
        } else {
            res.status(403).send({header: 'Not Allowed', message: 'You are either not an administrator, or the current user deleting this profile.'});
        }
    });

    // VERIFY

    router.post(path + '/verify', function(req, res) {
        var user = {},
            insert = {};

        user.now = Math.floor(Date.now() / 1000);

        insert.secret = req.body.secret;

        async.series([
            function(callback) {
                var call = mysql.format('SELECT id, verify_timeout AS timeout FROM user WHERE verify_secret = ?',
                    [insert.secret]);

                pool.query(call,function(err,result) {
                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback(err);
                });
            },
            function(callback) {
                user.accepted = user.now < user.timeout;

                if(user.accepted) {
                    callback();
                } else { callback('Timeout Expired'); }
            },
            function(callback) {
                if(user.accepted) {
                    var call = mysql.format('UPDATE user SET verify = ?, verify_secret = NULL, verify_timeout = NULL WHERE id = ?',
                        [1, user.id]);

                    pool.query(call,callback);
                } else { callback('Timeout Expired'); }
            },
            function(callback) {
                loginToken(req, user.id, function(err,result) {
                    user.token = result;

                    callback(err);
                });
            }
        ],function(err) {
            if(!err) {
                res.status(200).send({token: user.token});
            } else {
                res.status(500).send(err);
            }
        });
    });

    router.post(path + '/verify/again', function(req, res) {
        var user = {},
            insert = {};

        insert.email = req.body.email;

        insert.verify = {};
        insert.verify.secret = hasher(128);
        insert.verify.timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        var call = mysql.format('UPDATE user SET verify_secret = ?, verify_timeout = ? WHERE email = ?',
            [insert.verify.secret,insert.verify.timeout,insert.email]);

        pool.query(call,function(err) {
            if(!err) {
                var mail = {
                    from: config.superuser.email,
                    to: insert.email,
                    subject: 'User Verification',
                    text: '',
                    html: '<b>Hello!</b><br><br>Use the following verification code to verify your account creation: <a href="' + config.links.user.verify.new + insert.verify.secret + '">' + insert.verify.secret + '</a><br><br>'
                };

                sendMail(res, mail);
            } else {
                res.status(500).send({header: 'Internal SQL Error', message: error});
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
                var call = mysql.format('SELECT id,password FROM user WHERE email = ? AND deleted IS NULL',
                    [insert.email]);

                pool.query(call,function(err,result) {
                    if(err) {
                        res.status(400).send(err);
                    } else if(!result[0]) {
                        res.status(404).send('Email not found');
                    } else {
                        user.id = result[0].id;
                        user.password = result[0].password;

                        insert.encrypted = onion.hash(insert.password);
                        user.encrypted = onion.decrypt(user.password);
                    }

                    callback(err);
                });
            },
            function(callback) {
                bcrypt.compare(insert.encrypted, user.encrypted, function(err,result) {
                    if(err) {
                        res.status(500).send();
                    } else {
                        user.accepted = result;
                    }

                    callback(err);
                });
            },
            function(callback) {
                if(user.accepted) {
                    loginToken(req, user.id, function(err,result) {
                        if(err) {
                            res.status(500).send(err);
                        } else {
                            user.token = result;
                        }

                        callback(err);
                    });
                } else { callback('Wrong Password'); }
            }
        ],function(err) {
            if(!err) {
                res.status(200).send({token: user.token});
            } else {
                res.status(500).send(err);
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

        var call = mysql.format('UPDATE user SET login_secret = ?, login_timeout = ? WHERE email = ? AND deleted IS NULL',
            [insert.login.secret,insert.login.timeout,insert.email]);

        pool.query(call, function(err) {
            if(!err) {
                var mail = {
                    from: config.superuser.email,
                    to: insert.email,
                    subject: 'Login Request',
                    text: '',
                    html: '<b>Hello!</b><br><br>Use the following verification code to login to your account: <a href="' + config.links.user.verify.login + insert.login.secret + '">' + insert.login.secret + '</a><br><br>'
                };

                sendMail(res, mail);
            } else {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
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
                var call = mysql.format('SELECT id, login_timeout AS timeout FROM user WHERE login_secret = ?',
                    [insert.secret]);

                pool.query(call,function(err,result) {
                    if(err) {
                        res.status(400).send(err);
                    } else if(!result[0]) {
                        res.status(404).send('Wrong secret');
                    } else {
                        user.id = result[0].id;
                        user.timeout = result[0].timeout;
                    }

                    callback(err);
                });
            },
            function(callback) {
                if(user.accepted && user.now < user.timeout) {
                    var call = mysql.format('UPDATE user SET login_secret = NULL, login_timeout = NULL WHERE id = ?',
                        [user.id]);

                    pool.query(call,callback);
                } else { callback('Timeout expired'); }
            },
            function(callback) {
                loginToken(req, user.id, function(err,result) {
                    user.token = result;

                    callback(err);
                });
            }
        ],function(err) {
            if(!err) {
                res.status(200).send({token: user.token});
            } else {
                res.status(500).send(err);
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

        var call = mysql.format('UPDATE user SET reset_secret = ?, reset_timeout = ? WHERE email = ? AND deleted IS NULL',
            [insert.reset.secret,insert.reset.timeout,insert.email]);

        pool.query(call, function(err) {
            if(!err) {
                var mail = {
                    from: config.superuser.email,
                    to: insert.email,
                    subject: 'Password Reset',
                    text: '',
                    html: '<b>Hello!</b><br><br>Use the following verification code to reset your password: <a href="' + config.links.user.verify.reset + insert.reset.secret + '">' + insert.reset.secret + '</a><br><br>'
                };

                sendMail(res, mail);
            } else {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
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
                var call = mysql.format('SELECT id, reset_timeout AS timeout FROM user WHERE reset_secret = ?',
                    [insert.secret]);

                pool.query(call,function(err,result) {
                    user.id = result[0].id;
                    user.timeout = result[0].timeout;

                    callback(err);
                });
            },
            function(callback) {
                user.accepted = user.now < user.timeout;

                if(user.accepted) {
                    callback();
                } else { callback('Timeout Expired'); }
            },
            function(callback) {
                if(user.accepted) {
                    bcrypt.hash(insert.hashed, config.salt, function(err,result) {
                        insert.encrypted = onion.encrypt(result);

                        callback(err);
                    });
                } else { callback('Timeout Expired'); }
            },
            function(callback) {
                if(user.accepted) {
                    var call = mysql.format('UPDATE user SET password = ?, reset_secret = NULL, reset_timeout = NULL WHERE id = ?',
                        [insert.encrypted,user.id]);

                    pool.query(call,callback);
                } else { callback('Timeout Expired'); }
            },
            function(callback) {
                loginToken(req, user.id, function(err,result) {
                    user.token = result;

                    callback(err);
                });
            }
        ],function(err) {
            if(!err) {
                res.status(200).send({token: user.token});
            } else {
                res.status(500).send(err);
            }
        });
    });
};