var rest = require('./../rest'),
    bcrypt = require('bcrypt'),
    webtokens = require('./../webtokens');

const saltRounds = 10;

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user.id, ' +
        'user.username, ' +
        'user.email, ' +
        'user.created, ' +
        'user.deleted ' +
        'FROM user';

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE user.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/create', function(req, res) {
        var user = req.body.username,
            pass = req.body.password,
            email = req.body.email;

        bcrypt.hash(pass, saltRounds, function(error, hash) {
            if(error) {
                res.status(500).send({error: error});
            } else {
                var call = 'INSERT INTO user (username,password,email) VALUES (\'' + user + '\',\'' + hash + '\',\'' + email + '\')';

                pool.query(call, function(error, result) {
                    if(error) {
                        res.status(500).send({error: error});
                    } else {
                        var token = webtokens.generate({
                            id: result.insertId,
                            sub: result.username,
                            agent: req.headers['user-agent'],
                            permissions: '',
                            admin: false
                        });
                        res.status(201).send({success: {id: result.insertId, user: result.username, token: token}});
                    }
                });
            }
        });
    });

    router.post(path + '/auth', function(req, res) {
        var reqUser = req.body.username,
            reqPass = req.body.password;

        var call = 'SELECT * FROM user WHERE user.username = \'' + reqUser + '\'';

        pool.query(call, function(error, rows) {
            if(error) {
                res.status(500).send({error: error});
            } else {
                if(!rows) {
                    res.status(404).send({error: 'user not found'});
                } else {
                    var dbUser = rows[0].username;
                    var dbPass = rows[0].password;
                    var dbID = rows[0].id;

                    bcrypt.compare(reqPass, dbPass, function(error, response) {
                        if(error) {
                            res.status(500).send({error: error});
                        } else {
                            if(!response) {
                                res.status(403).send({forbidden: 'wrong password'});
                            } else {
                                var token = webtokens.generate({
                                    id: dbID,
                                    sub: dbUser,
                                    agent: req.headers['user-agent'],
                                    permissions: '',
                                    admin: false
                                });
                                res.status(202).send({success: {id: dbID, user: dbUser, token: token}});
                            }
                        }
                    });
                }
            }
        });
    });
};