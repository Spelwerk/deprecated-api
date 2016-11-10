var mysql = require('mysql'),
    logger = require('./logger'),
    config = require('./config');

var file = 'rest.js';

function queryDefault(pool, res, call) {
    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            if(!result[0] || !result) {
                res.status(204).send({header: 'No Content', message: error});
            } else {
                res.status(200).send({data: result});
            }
        }
    });
}

function queryMessage(pool, res, call, status, message) {
    status = status || 200;
    message = message || 'success';

    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            res.status(status).send({data: result, message: message});
        }
    });
}

module.exports.queryDefault = queryDefault;
module.exports.queryMessage = queryMessage;

// DEFAULT

exports.HELP = function(pool, req, res, table) {
    queryDefault(pool, res, 'SHOW FULL COLUMNS FROM ' + table)
};

exports.GET = function(pool, req, res, table) {
    var call = 'SELECT * FROM ' + table;

    if(req.params.id) { call += ' WHERE id = ' + req.params.id; }

    queryDefault(pool, res, call);
};

exports.QUERY = function(pool, req, res, call, params) {
    params = params || null;

    if(params) {
        call = mysql.format(call, params);
    }

    queryDefault(pool, res, call);
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
        logger.logCall(file, call, error);

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            if(req.body.hash) {
                res.status(201).send({data: result, id: result.insertId, hash: req.body.hash});
            } else {
                res.status(201).send({data: result, id: result.insertId});
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
        call += table + '.' + key + ' = \'' + jsonObject[key] + '\' AND ';
    }
    call = call.slice(0, -5);

    var id = parseInt(req.params.id) || 0;

    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            res.status(200).send({data: result, id: id});
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

    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            res.status(201).send({data: result, id: result.insertId});
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

    queryMessage(pool, res, call, 202, 'deleted');
};

exports.REVIVE = function(pool, req, res, table, jsonObject) {
    var call = 'UPDATE ' + table + ' SET deleted = \'null\' WHERE ';

    jsonObject = jsonObject || {id: req.params.id};

    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    queryMessage(pool, res, call, 200, 'revived');
};

exports.REMOVE = function(pool, req, res, table, jsonObject) {
    var call = 'DELETE from ' + table + ' WHERE ';

    jsonObject = jsonObject || {id: req.params.id};

    for (var key in jsonObject) {
        call += key + ' = \'' + jsonObject[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    queryMessage(pool, res, call, 202, 'removed');
};