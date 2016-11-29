var mysql = require('mysql'),
    logger = require('./logger'),
    config = require('./config');

var file = 'rest.js';

function queryDefault(pool, res, call) {
    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        if(error) {
            console.log(error);
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            if(!result[0]) {
                res.status(204).send({header: 'No Content', message: 'No Content'});
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

exports.QUERY = function(pool, req, res, call, params, order) {
    params = params || null;
    order = order || {"name": "ASC"};

    if(params) {
        call = mysql.format(call, params);
    }

    if(order) {
        call += ' ORDER BY ';

        for (var key in order) {
            call += key + ' ' + order[key] + ', ';
        }

        call = call.slice(0, -2);
    }

    queryDefault(pool, res, call);
};

exports.INSERT = function(pool, req, res, table) {
    var body = req.body,
        into = 'INSERT INTO ' + table + '(',
        vals = ' VALUES (',
        updt = '',
        call;

    for (var key in body) {
        if(body.hasOwnProperty(key)) {
            into += key + ', ';
            vals += '\'' + body[key] + '\', ';
            updt += key + ' = \'' + body[key] + '\', ';
        }
    }

    into = into.slice(0, -1) + ')';
    vals = vals.slice(0, -1) + ')';
    updt = updt.slice(0, -2);

    call = into + vals + ' ON DUPLICATE KEY UPDATE ' + updt;

    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        var id = result.insertId ? result.insertId : req.body.id;

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            res.status(201).send({data: result, id: id, hash: req.body.hash});
        }
    });
};

exports.PUT = function(pool, req, res, table, options) {
    options = options || {id: req.params.id };

    var body = req.body,
        call = 'UPDATE ' + table + ' SET ';

    for (var key in body) {
        if (body.hasOwnProperty(key)) {
            call += key + ' = \'' + body[key] + '\', ';
        }
    }

    call = call.slice(0, -2);
    call += ', updated = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    pool.query(call, function(error, result) {
        logger.logCall(file, call, error);

        var id = req.params.id || 0;

        if(error) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            res.status(200).send({data: result, id: id});
        }
    });
};

exports.DELETE = function(pool, req, res, table, options) {
    options = options || {id: req.params.id};

    var call = 'UPDATE ' + table + ' SET deleted = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    queryMessage(pool, res, call, 202, 'deleted');
};

exports.REVIVE = function(pool, req, res, table, options) {
    options = options || {id: req.params.id};

    var call = 'UPDATE ' + table + ' SET deleted = NULL, updated = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    queryMessage(pool, res, call, 200, 'revived');
};