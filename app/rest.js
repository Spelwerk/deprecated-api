var mysql = require('mysql'),
    config = require('./config');

function DEBUG(call, error, key, restName) {
    if(key == config.keys.debug) {
        if(error) {
            console.log('\nmethod: ' + restName);
            console.log('call:   ' + call);
            console.log('error:  ' + error);
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
                res.status(404).send({error: 'not found'});
            } else {
                res.status(200).send({success: rows});
            }
        }
    });
};

exports.QUERY = function(pool, req, res, call, params) {
    if(params) {
        call = mysql.format(call, params);
    }

    pool.query(call, function(error, rows) {
        DEBUG(call, error, req.headers.debug, 'QUERY');

        if(error) {
            res.status(500).send({error: error});
        } else {
            if(!rows || !rows[0]) {
                res.status(404).send({error: 'not found'});
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