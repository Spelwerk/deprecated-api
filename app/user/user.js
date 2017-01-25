var rest = require('./../rest'),
    mysql = require('mysql'),
    bcrypt = require('bcrypt'),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
    logger = require('./../logger'),
    config = require('./../config'),
    tokens = require('./../tokens'),
    onion = require('./../onion'),
    hasher = require('./../hasher');

const saltRounds = config.salt;

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var file = 'user.js';

    var query = 'SELECT ' +
        'user.id, ' +
        'user.username, ' +
        'user.admin, ' +
        'user.firstname, ' +
        'user.surname, ' +
        'user.created, ' +
        'user.deleted ' +
        'FROM user';

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call);
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
            verified = 0,
            verified_hash = hasher(32);

        bcrypt.hash(onion.hash(password), saltRounds, function(error, hash) {
            if(error) {
                logger.logError(file, error, 'BCRYPT');

                res.status(500).send({header: 'Internal Error', message: error});
            } else {
                var call = 'INSERT INTO user (username,password,email,admin,firstname,surname,verified,verified_hash) VALUES (\'' + username + '\',\'' + onion.encrypt(hash) + '\',\'' + email + '\',\'' + admin + '\',\'' + firstname + '\',\'' + surname + '\',\'' + verified + '\',\'' + verified_hash + '\')';

                pool.query(call, function(error, result) {
                    logger.logCall(file, call, error);

                    if(error) {
                        res.status(500).send({header: 'Internal SQL Error', message: error});
                    } else {
                        var transporter = nodemailer.createTransport(config.smtp);

                        var mailOptions = {
                            from: config.superuser.email,
                            to: email,
                            subject: 'User Verification',
                            text: '',
                            html: '<b>Hello!</b><br><br>This is your verification code: <a href="' + config.links.user_verification + verified_hash + '">' + verified_hash + '</a><br><br>'
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                logger.logError(file, error, 'MAILER');

                                res.status(500).send({header: 'Email Error', message: error});
                            } else {
                                res.status(201).send({data: result, mail: info.response});
                            }
                        });
                    }
                });
            }
        });
    });

    router.post(path + '/login', function(req, res) {
        var req_user = req.body.username,
            req_pass = req.body.password;

        var user_call = 'SELECT * FROM user WHERE user.username = \'' + req_user + '\' AND user.deleted IS NULL';

        pool.query(user_call, function(error, user_result) {
            logger.logCall(file, user_call, error);

            if(error) {
                res.status(500).send({header: 'Internal SQL Error', message: error});
            } else {
                if(!user_result[0]) {
                    res.status(404).send({header: 'Username Not Found', message: 'username not found'});
                } else {
                    var res_id = user_result[0].id,
                        res_pass = user_result[0].password;

                    bcrypt.compare(onion.hash(req_pass), onion.decrypt(res_pass), function(error, response) {
                        if(error) {
                            logger.logError(file, error, 'BCRYPT');

                            res.status(500).send({header: 'Internal Server Error', message: error});
                        } else {
                            if(!response) {
                                res.status(403).send({header: 'Wrong Password', message: 'wrong password'});
                            } else {
                                var perm_call = 'SELECT ' +
                                    'permission.name ' +
                                    'FROM user_has_permission ' +
                                    'LEFT JOIN permission ON permission.id = user_has_permission.permission_id ' +
                                    'WHERE user_has_permission.user_id = \'' + res_id + '\'';

                                pool.query(perm_call, function(error, perm_result) {
                                    logger.logCall(file, perm_call, error);

                                    if(error) {
                                        res.status(500).send({header: 'Internal SQL Error', message: error});
                                    } else {
                                        var permissions = '';

                                        if(perm_result) {
                                            for (var key in perm_result) {
                                                permissions += perm_result[key].name + ',';
                                            }

                                            permissions = permissions.slice(0, -1);
                                        }

                                        var token = tokens.generate(req, user_result[0], permissions);

                                        res.status(200).send({token: token});
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    router.post(path + '/recovery/set', function(req, res) {
        var email = req.body.email,
            recovery_hash = hasher(32);

        var call = 'UPDATE user SET recovery = \'' + recovery_hash + '\' WHERE user.email = \'' + email + '\'';

        pool.query(call, function(err, result) {
            logger.logCall(file, call, err);

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                var transporter = nodemailer.createTransport(config.smtp);

                var mailOptions = {
                    from: config.superuser.email,
                    to: email,
                    subject: 'User Recovery',
                    text: '',
                    html: '<b>Hello!</b><br><br>This is your recovery code: <a href="' + config.links.user_recovery + recovery_hash + '">' + recovery_hash + '</a><br><br>'
                };

                transporter.sendMail(mailOptions, function(error, info){
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

    router.post(path + '/recovery/pass', function(req, res) {
        var email = req.body.email,
            recovery = req.body.recovery,
            password = req.body.password;

        if(!recovery) {
            res.status(404).send({header: 'Recovery Missing', message: 'Recovery code is missing from request.'});
        } else {
            bcrypt.hash(onion.hash(password), saltRounds, function(error, hash) {
                if(error) {
                    logger.logError(file, error, 'BCRYPT');
                    res.status(500).send({header: 'Internal Server Error', message: error});
                } else {
                    var call = 'UPDATE user SET password = \'' + onion.encrypt(hash) + '\', recovery = NULL WHERE user.email = \'' + email + '\' AND user.recovery = \'' + recovery + '\'';

                    rest.queryMessage(pool, res, call);
                }
            });
        }
    });

    router.post(path + '/verify', function(req, res) {
        var email = req.body.email,
            verified_hash = req.body.verified_hash;

        var call = 'UPDATE user SET verified = \'1\', verified_hash = NULL WHERE user.email = \'' + email + '\' AND user.verified_hash = \'' + verified_hash + '\'';

        rest.queryMessage(pool, res, call);
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
                var user_call = 'SELECT * FROM user WHERE user.id = \'' + user_id + '\' AND user.deleted IS NULL';

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
                                                var call = 'UPDATE user SET password = \'' + onion.encrypt(hash) + '\' WHERE user.id = ' + user_id;

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