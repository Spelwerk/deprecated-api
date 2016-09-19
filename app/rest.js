var mysql = require('mysql'),
    bcrypt = require('bcrypt'),
    config = require('./config'),
    webtokens = require('./webtokens');

const saltRounds = 16;

function DEBUG(call, error, key, restName) {
    if(key == config.keys.debug) {
        console.log('\nmethod: ' + restName);
        console.log('\ncall:   ' + call);
        if(error) {
            console.log('\nerror:  ' + error);
            console.log('\n------\n');
        }
    }
}

exports.HELP = function(pool, req, res, table) {
    var call = 'SHOW FULL COLUMNS FROM ' + table;

    pool.query(call, function(error, rows) {
        DEBUG(call, error, req.headers.debug, 'HELP');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(200).send(rows);
        }
    });
};

exports.GET = function(pool, req, res, table) {
    var call = 'SELECT * FROM ' + table;

    if(req.params.id) { call += ' WHERE id = ' + req.params.id; }

    pool.query(call, function(error, rows) {
        DEBUG(call, error, req.headers.debug, 'GET');

        if(error) {
            res.status(500).send({error: error});
        } else {
            if(!rows || !rows[0]) {
                res.status(204).send({error: 'no content'});
            } else {
                res.status(200).send({success: rows});
            }
        }
    });
};

exports.QUERY = function(pool, req, res, call, params) {
    params = params || null;
    if(params) {
        call = mysql.format(call, params);
    }

    pool.query(call, function(error, rows) {
        DEBUG(call, error, req.headers.debug, 'QUERY');

        if(error) {
            res.status(500).send({error: error});
        } else {
            if(!rows || !rows[0]) {
                res.status(204).send({error: 'no content'});
            } else {
                res.status(200).send({success: rows});
            }
        }
    });
};

exports.POST = function(pool, req, res, table, body) {
    var rows = {},
        into = 'INSERT INTO ' + table + '(',
        vals = ' VALUES (',
        call;

    for (var key in body) {
        if(body.hasOwnProperty(key)) {
            into += key + ',';
            vals += '\'' + body[key] + '\',';
            rows[key] = body[key];
        }
    }

    into = into.slice(0, -1) + ')';
    vals = vals.slice(0, -1) + ')';
    call = into + vals;

    pool.query(call, function(error, result) {
        DEBUG(call, error, req.headers.debug, 'POST');

        if(error) {
            res.status(500).send({error: 'error'});
        } else {
            if(req.body.hash) {
                res.status(201).send({success: rows, id: result.insertId, hash: req.body.hash});
            } else {
                res.status(201).send({success: rows, id: result.insertId});
            }
        }
    });
};

exports.PUT = function(pool, req, res, table, body, identifier) {
    var rows = {},
        call = 'UPDATE ' + table + ' SET ';

    for (var key in body) {
        if (body.hasOwnProperty(key)) {
            call += key + ' = \'' + body[key] + '\', ';
            rows[key] = body[key];
        }
    }

    call = call.slice(0, -2);

    call += ' WHERE ' + identifier + ' = \'' + req.params.id + '\'';

    var id = parseInt(req.params.id);

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'PUT');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(200).send({success: rows, id: id});
        }
    });
};

exports.INSERT = function(pool, req, res, table, body) {
    var rows = {},
        into = 'INSERT INTO ' + table + '(',
        vals = ' VALUES (',
        updt = '',
        call;

    for (var key in body) {
        if(body.hasOwnProperty(key)) {
            into += key + ',';
            vals += '\'' + body[key] + '\',';
            updt += key + ' = \'' + body[key] + '\', ';
            rows[key] = body[key];
        }
    }

    into = into.slice(0, -1) + ')';
    vals = vals.slice(0, -1) + ')';
    updt = updt.slice(0, -2);
    call = into + vals + ' ON DUPLICATE KEY UPDATE ' + updt;

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'INSERT');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(201).send({success: rows, id: res.insertId});
        }
    });
};

exports.DELETE = function(pool, req, res, table, identifier) {
    var call = 'UPDATE ' + table + ' SET deleted = CURRENT_TIMESTAMP WHERE ' + identifier + ' = \'' + req.params.id + '\'';

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'DELETE');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(202).send({success: 'deleted'});
        }
    });
};

exports.REVIVE = function(pool, req, res, table, identifier) {
    var call = 'UPDATE ' + table + ' SET deleted = \'null\' WHERE ' + identifier + ' = \'' + req.params.id + '\'';

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'REVIVE');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(205).send({success: 'revived'});
        }
    });
};

exports.REMOVE = function(pool, req, res, table, jsonObject) {
    var call = 'DELETE from ' + table + ' WHERE ';

    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND '
    }

    call = call.slice(0, -5);

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'REMOVE');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(202).send({success: 'removed'});
        }
    });
};

exports.USERADD = function(pool, req, res) {
    var user = req.body.username,
        pass = req.body.password,
        email = req.body.email,
        admin = req.body.admin,
        permissions = req.body.permissions;

    bcrypt.hash(pass, saltRounds, function(error, hash) {
        if(error) {
            DEBUG(null, error, req.headers.debug, 'USERAUTH');
            res.status(500).send({error: error});
        } else {
            var call = 'INSERT INTO user (username,password,email,admin,permissions) VALUES (\'' + user + '\',\'' + hash + '\',\'' + email + '\',\'' + admin + '\',\'' + permissions + '\')';

            pool.query(call, function(error, result) {
                if(error) {
                    DEBUG(call, error, req.headers.debug, 'USERAUTH');
                    res.status(500).send({error: error});
                } else {
                    var token = webtokens.generate({
                        id: result.insertId,
                        sub: result.username,
                        agent: req.headers['user-agent'],
                        permissions: '',
                        admin: false
                    });
                    res.status(201).send({success: token});
                }
            });
        }
    });
};

exports.USERAUTH = function(pool, req, res) {
    var reqUser = req.body.username,
        reqPass = req.body.password;

    var call = 'SELECT user.id, user.name, user.admin, user.permissions FROM user WHERE user.username = \'' + reqUser + '\'';

    pool.query(call, function(error, rows) {
        if(error) {
            DEBUG(call, error, req.headers.debug, 'USERAUTH');
            res.status(500).send({error: error});
        } else {
            if(!rows) {
                res.status(404).send({error: 'user not found'});
            } else {
                var row = rows[0],
                    rowID = row.id,
                    rowUser = row.username,
                    rowPass = row.password,
                    rowAdmin = row.admin,
                    rowPermissions = row.permissions;

                bcrypt.compare(reqPass, rowPass, function(error, response) {
                    if(error) {
                        DEBUG(call, error, req.headers.debug, 'USERAUTH');
                        res.status(500).send({error: error});
                    } else {
                        if(!response) {
                            res.status(403).send({forbidden: 'wrong password'});
                        } else {
                            var token = webtokens.generate({
                                id: rowID,
                                sub: rowUser,
                                agent: req.headers['user-agent'],
                                admin: rowAdmin,
                                permissions: rowPermissions
                            });
                            res.status(202).send({success: token});
                        }
                    }
                });
            }
        }
    });
};

exports.USERINFO = function(req, res) {
    var token = webtokens.validate(req);

    if(!token) {
        res.status(404).send({error: 'missing token'});
    } else {
        if(!token.id) {
            res.status(400).send({error: 'invalid token'});
        } else {
            res.status(200).send({id: token.id, username: token.sub, admin: token.admin, permissions: token.permissions});
        }
    }
};