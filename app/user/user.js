var rest = require('./../rest'),
    mysql = require('mysql'),
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
        'username, ' +
        'admin, ' +
        'firstname, ' +
        'surname, ' +
        'created, ' +
        'updated, ' +
        'deleted ' +
        'FROM user';

    function loginToken(req, res, result) {
        var user = result[0];

        var perm_call = mysql.format(
            'SELECT permission.name FROM user_has_permission LEFT JOIN permission ON permission.id = user_has_permission.permission_id WHERE user_has_permission.user_id = ?',
            [user.id]);

        pool.query(perm_call, function(err, perm_result) {
            logger.logCall(file, perm_call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err});
            } else {
                var permissions = '';

                if(perm_result) {
                    for (var key in perm_result) {
                        permissions += perm_result[key].name + ',';
                    }

                    permissions = permissions.slice(0, -1);
                }

                var token = tokens.generate(req, user, permissions);

                var updt_call = mysql.format(
                    'UPDATE user SET login_hash = NULL, login_timeout = NULL WHERE id = ?',
                    [user.id]
                );

                pool.query(updt_call, function(err) {
                    logger.logCall(file, updt_call, err);

                    if(err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err});
                    } else {
                        res.status(200).send({token: token});
                    }
                });
            }
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
                    res.status(500).send({header: 'Email Error', message: err});
                } else {
                    res.status(200).send({message: 'Mail has been sent!'});
                }
            });
        });
    }

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call, null, {"username": "ASC"});
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
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/token', function(req, res) {
        if(!req.headers.token) {
            res.status(404).send({header: 'Missing Token', message: 'missing token'});
        } else {
            var token = tokens.decode(req),
                validity = tokens.validate(req, token);

            if(!validity) {
                res.status(400).send({header: 'Invalid Token', message: 'invalid token'});
            } else {
                res.status(200).send({user: token.sub});
            }
        }
    });

    router.post(path, function(req, res) {
        var username = req.body.username,
            password = req.body.password,
            email = req.body.email,
            admin = 0,
            firstname = req.body.firstname,
            surname = req.body.surname,
            verify = 0,
            verify_hash = hasher(64),
            verify_timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        bcrypt.hash(onion.hash(password), saltRounds, function(error, hash) {
            if(error) {
                logger.logError(file, error, 'BCRYPT');

                res.status(500).send({header: 'Internal Error', message: error});
            } else {
                var call = mysql.format(
                    'INSERT INTO user (username,password,email,admin,firstname,surname,verify,verify_hash,verify_timeout) VALUES (?,?,?,?,?,?,?,?,?)',
                    [username, onion.encrypt(hash), email, admin, firstname, surname, verify, verify_hash, verify_timeout]);

                pool.query(call, function(error, result) {
                    logger.logCall(file, call, error);

                    if(error) {
                        res.status(500).send({header: 'Internal SQL Error', message: error});
                    } else {
                        var mail = {
                            from: email,
                            to: 'serobnic@mail.ru',
                            subject: 'User Verification',
                            text: '',
                            html: '<b>Hello!</b><br><br>This is your verification code: <a href="' + config.links.user_new_verify + verify_hash + '">' + verify_hash + '</a><br><br>'
                        };

                        sendMail(res, mail);
                    }
                });
            }
        });
    });

    router.post(path + '/login/password', function(req, res) {
        var req_user = req.body.username,
            req_pass = req.body.password;

        var call = mysql.format(
            'SELECT * FROM user WHERE username = ? AND deleted IS NULL',
            [req_user]);

        pool.query(call, function(err, result) {
            logger.logCall(file, call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err});
            } else if(!result[0]) {
                res.status(404).send({header: 'Username Not Found', message: 'username not found'});
            } else {
                var user = result[0];

                bcrypt.compare(onion.hash(req_pass), onion.decrypt(user.password), function(err, response) {
                    if(err) {
                        logger.logError(file, err, 'BCRYPT');

                        res.status(500).send({header: 'Internal Server Error', message: err});
                    } else if(!response) {
                        res.status(403).send({header: 'Wrong Password', message: 'wrong password'});
                    } else {
                        loginToken(req, res, result)
                    }
                });
            }
        });
    });

    router.post(path + '/login/mail/start', function(req, res) {
        var email = req.body.email,
            login_hash = hasher(64),
            login_timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        var call = mysql.format(
            'UPDATE user SET login_hash = ?, login_timeout = ? WHERE email = ? AND deleted IS NULL',
            [login_hash, login_timeout, email]
        );

        pool.query(call, function(err) {
            logger.logCall(file, call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                var mail = {
                    from: config.superuser.email,
                    to: email,
                    subject: 'Login Request',
                    text: '',
                    html: '<b>Hello!</b><br><br>Use <a href="' + config.links.user_login_with_hash + login_hash + '">THIS LINK</a> to login to your account<br><br>'
                };

                sendMail(res, mail);
            }
        });
    });

    router.post(path + '/login/mail/verify', function(req, res) {
        var login_hash = req.body.login_hash,
            now = Math.floor(Date.now() / 1000);

        var call = mysql.format(
            'SELECT * FROM user WHERE login_hash = ? AND deleted IS NULL',
            [login_hash]);

        pool.query(call, function(err, result) {
            logger.logCall(file, call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err});
            } else if(!result[0]) {
                res.status(404).send({header: 'User Not Found', message: 'user not found'});
            } else if(result[0].login_timeout > now) {
                res.status(403).send({header: 'Forbidden', message: 'timeout reached.'});
            } else {
                loginToken(req, res, result)
            }
        });
    });

    router.post(path + '/verify', function(req, res) {
        var verify_hash = req.body.verify_hash,
            now = Math.floor(Date.now() / 1000);

        var user_call = mysql.format(
            'SELECT id, verify_timeout FROM user WHERE verify_hash = ?',
            [verify_hash]
        );

        pool.query(user_call, function(err, user_result) {
            logger.logCall(file, user_call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!user_result[0]) {
                res.status(404).send({header: 'User not found', message: 'User not found'});
            } else if (user_result[0].login_timeout > now) {
                res.status(403).send({header: 'Forbidden', message: 'timeout reached.'});
            } else {
                var user_id = user_result[0].id;

                var updt_call = mysql.format(
                    'UPDATE user SET verify = ?, verify_hash = NULL, verify_timeout = NULL WHERE id = ?',
                    [1, user_id]
                );

                rest.queryMessage(pool, res, updt_call, 200, 'success');
            }
        });
    });

    router.put(path + '/password', function(req, res) {
        var orig_password = req.body.original_password,
            new_password = req.body.new_password;

        if(!req.headers.token) {
            res.status(404).send({header: 'Missing Token', message: 'missing token'});
        } else {
            var token = tokens.decode(req),
                validity = tokens.validate(req, token),
                user_id = token.sub.id;

            if(!validity) {
                res.status(400).send({header: 'Invalid Token', message: 'invalid token'});
            } else {
                var user_call = mysql.format(
                    'SELECT * FROM user WHERE user.id = ? AND user.deleted IS NULL',
                    [user_id]);

                pool.query(user_call, function(error, user_result) {
                    logger.logCall(file, user_call, error);

                    if(error) {
                        res.status(500).send({header: 'Internal SQL Error', message: error});
                    } else {
                        if(!user_result[0]) {
                            res.status(404).send({header: 'User ID Not Found', message: 'user ID not found'});
                        } else {
                            var user_password = user_result[0].password;

                            bcrypt.compare(onion.hash(orig_password), onion.decrypt(user_password), function(error, response) {
                                if (error) {
                                    logger.logError(file, error, 'BCRYPT');

                                    res.status(500).send({header: 'Internal Server Error', message: error});
                                } else {
                                    if (!response) {
                                        res.status(403).send({header: 'Wrong Password', message: 'wrong password'});
                                    } else {
                                        bcrypt.hash(onion.hash(new_password), saltRounds, function(error, hash) {
                                            if(error) {
                                                logger.logError(file, error, 'BCRYPT');

                                                res.status(500).send({header: 'Internal Server Error', message: error});
                                            } else {
                                                var call = mysql.format(
                                                    'UPDATE user SET password = ? WHERE user.id = ?',
                                                    [onion.encrypt(hash),user_id]);

                                                rest.queryMessage(pool, res, call);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });

    router.put(path + '/password/start', function(req, res) {
        var email = req.body.email,
            reset_hash = hasher(64),
            reset_timeout = Math.floor(Date.now() / 1000) + (config.timeoutTTL * 60);

        var call = mysql.format(
            'UPDATE user SET reset_hash = ?, reset_timeout = ? WHERE user.email = ?',
            [reset_hash, reset_timeout, email]
        );

        pool.query(call, function(err, result) {
            logger.logCall(file, call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                var transporter = nodemailer.createTransport(config.smtp);

                var mail = {
                    from: config.superuser.email,
                    to: email,
                    subject: 'Password Reset',
                    text: '',
                    html: '<b>Hello!</b><br><br>Use <a href="' + config.links.user_password_reset + reset_hash + '">THIS LINK</a> to reset your password<br><br>'
                };

                transporter.sendMail(mail, function(error, info){
                    if(error){
                        logger.logError(file, error, 'MAILER');

                        res.status(500).send({header: 'Email Error', message: error});
                    } else {
                        res.status(201).send({data: result, mail: info.response});
                    }
                });
            }
        });
    });

    router.put(path + '/password/set', function(req, res) {
        var reset_hash = req.body.reset_hash,
            password = req.body.password,
            now = Math.floor(Date.now() / 1000);

        var user_call = mysql.format(
            'SELECT id, reset_timeout FROM user WHERE reset_hash = ?',
            [reset_hash]);

        pool.query(user_call, function(err, user_result) {
            logger.logCall(file, user_call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if (!user_result[0]) {
                res.status(404).send({header: 'User Not Found', message: 'user not found'});
            } else if (user_result[0].reset_timeout > now) {
                res.status(403).send({header: 'Forbidden', message: 'timeout reached.'});
            } else {
                var user_id = user_result[0].id;

                bcrypt.hash(onion.hash(password), saltRounds, function(err, hash) {
                    if(err) {
                        logger.logError(file, err, 'BCRYPT');

                        res.status(500).send({header: 'Internal Server Error', message: err});
                    } else {
                        var updt_call = mysql.format(
                            'UPDATE user SET password = ?, reset_hash = NULL, reset_timeout = NULL WHERE id = ?',
                            [onion.encrypt(hash), user_id]);

                        rest.queryMessage(pool, res, updt_call, 200, 'success');
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id', function(req, res) {
        if(!req.headers.token) {
            res.status(403).send({header: 'Missing Token', message: 'missing token'});
        } else {
            var token = tokens.decode(req),
                validity = tokens.validate(req, token);

            if (!validity) {
                res.status(403).send({header: 'Invalid Token', message: 'An invalid token has been provided.'});
            } else {
                if(!token.sub.admin || token.sub.id == req.params.id) {
                    res.status(403).send({header: 'Not Allowed', message: 'you are not admin, nor are you the user editing this profile'});
                } else {
                    rest.PUT(pool, req, res, table);
                }
            }
        }
    });

    router.put(path + '/admin', function(req, res) {
        if(!req.headers.token) {
            res.status(403).send({header: 'Missing Token', message: 'missing token'});
        } else {
            var token = tokens.decode(req),
                validity = tokens.validate(req, token);

            if(!validity) {
                res.status(403).send({header: 'Invalid Token', message: 'An invalid token has been provided.'});
            } else {
                if(!token.sub.admin) {
                    res.status(403).send({header: 'Not Admin', message: 'you are not admin'});
                } else {
                    var admin = req.body.admin,
                        user = req.body.user;

                    var call = 'UPDATE user SET admin = \'' + admin + '\' WHERE user.id = \'' + user + '\'';

                    pool.query(call, function(error, result) {
                        logger.logCall(file, call, error);

                        if(error) {
                            res.status(500).send({header: 'Internal SQL Error', message: error});
                        } else {
                            res.status(200).send({message: 'success', data: result});
                        }
                    });
                }
            }
        }
    });

    router.delete(path + '/id/:id', function(req, res) {
        if(!req.headers.token) {
            res.status(403).send({header: 'Missing Token', message: 'missing token'});
        } else {
            var token = tokens.decode(req),
                validity = tokens.validate(req, token);

            if (!validity) {
                res.status(403).send({header: 'Invalid Token', message: 'An invalid token has been provided.'});
            } else {
                if(!token.sub.admin || token.sub.id == req.params.id) {
                    res.status(403).send({header: 'Not Allowed', message: 'you are not admin, nor are you the user deleting this profile'});
                } else {
                    rest.DELETE(pool, req, res, table);
                }
            }
        }
    });
};