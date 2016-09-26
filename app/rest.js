var mysql = require('mysql'),
    bcrypt = require('bcrypt'),
    moment = require('moment'),
    config = require('./config'),
    tokens = require('./tokens'),
    onion = require('./onion');

const saltRounds = config.salt;

function DEBUG(call, error, key, restName) {
    if(key == config.keys.debug) {
        if(error) {
            console.log('\nmethod: ' + restName);
            console.log('\ncall:   ' + call);
            console.log('\nerror:  ' + error);
            console.log('\n------\n');
        }
    }
}

// DEFAULT

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

exports.POST = function(pool, req, res, table) {
    var body = req.body,
        rows = {},
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

exports.PUT = function(pool, req, res, table, jsonObject) {
    var body = req.body,
        rows = {},
        call = 'UPDATE ' + table + ' SET ';

    for (var key in body) {
        if (body.hasOwnProperty(key)) {
            call += key + ' = \'' + body[key] + '\', ';
            rows[key] = body[key];
        }
    }

    call = call.slice(0, -2);
    call += ' WHERE ';

    jsonObject = jsonObject || {id: req.params.id};
    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND ';
    }
    call = call.slice(0, -5);

    var id = parseInt(req.params.id) || 0;

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'PUT');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(200).send({success: rows, id: id});
        }
    });
};

exports.INSERT = function(pool, req, res, table) {
    var body = req.body,
        rows = {},
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

exports.DELETE = function(pool, req, res, table, jsonObject) {
    var call = 'UPDATE ' + table + ' SET deleted = CURRENT_TIMESTAMP WHERE ';

    jsonObject = jsonObject || {id: req.params.id};

    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'DELETE');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(202).send({success: 'deleted'});
        }
    });
};

exports.REVIVE = function(pool, req, res, table, jsonObject) {
    var call = 'UPDATE ' + table + ' SET deleted = \'null\' WHERE ';

    jsonObject = jsonObject || {id: req.params.id};

    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    pool.query(call, function(error) {
        DEBUG(call, error, req.headers.debug, 'REVIVE');

        if(error) {
            res.status(500).send({error: error});
        } else {
            res.status(200).send({success: 'revived'});
        }
    });
};

exports.REMOVE = function(pool, req, res, table, jsonObject) {
    var call = 'DELETE from ' + table + ' WHERE ';

    jsonObject = jsonObject || {id: req.params.id};

    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND ';
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

// USER SPECIFIC

exports.USERADD = function(pool, req, res) {
    var user = req.body.username,
        firstname = req.body.firstname,
        surname = req.body.surname,
        email = req.body.email;

    bcrypt.hash(onion.hash(req.body.password), saltRounds, function(error, hash) {
        if(error) {
            console.log(error);
            res.status(500).send({error: error});
        } else {
            var call = 'INSERT INTO user (username,password,firstname,surname,email,admin) VALUES (\'' + user + '\',\'' + onion.encrypt(hash) + '\',\'' + firstname + '\',\'' + surname + '\',\'' + email + '\',\'0\')';

            pool.query(call, function(error, result) {
                if(error) {
                    DEBUG(call, error, req.headers.debug, 'USERADD');

                    res.status(500).send({error: error});
                } else {
                    var token = tokens.generate(req,{
                        id: result.insertId,
                        username: user,
                        firstname: firstname,
                        surname: surname,
                        admin: 0,
                        permissions: null
                    });
                    res.status(201).send({success: token});
                }
            });
        }
    });
};

exports.USERAUTH = function(pool, req, res) {
    var call = 'SELECT * FROM user WHERE user.username = \'' + req.body.username + '\'';

    pool.query(call, function(error, rows) {
        if(error) {
            DEBUG(call, error, req.headers.debug, 'USERAUTH');

            res.status(500).send({error: error});
        } else {
            if(!rows) {
                res.status(404).send({error: 'user not found'});
            } else {
                var row = rows[0];

                bcrypt.compare(onion.hash(req.body.password), onion.decrypt(row.password), function(error, response) {
                    if(error) {
                        res.status(500).send({error: error});
                    } else {
                        if(!response) {
                            res.status(403).send({forbidden: 'wrong password'});
                        } else {
                            var token = tokens.generate(req,{
                                id: row.id,
                                username: row.username,
                                firstname: row.firstname,
                                surname: row.surname,
                                admin: row.admin,
                                permissions: row.permissions
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
    var token = tokens.validate(req);

    if(!token) {
        res.status(404).send({error: 'missing token'});
    } else {
        var now = moment.utc(),
            exp = moment.utc(token.exp);

        var valid_token = false,
            valid_ip = false;

        var ip = req.headers['x-forwarded-for'] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;

        if (!token.sub.id || now > exp) {
            valid_token = true;
        }

        if(token.oip == ip) {
            valid_ip = true;
        }

        if(valid_token) {
            res.status(400).send({error: 'invalid token'});
        } else {
            res.status(200).send({success: token.sub, validity: valid_ip});
        }
    }
};