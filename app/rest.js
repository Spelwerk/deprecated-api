var mysql = require('mysql'),
    logger = require('./logger'),
    config = require('./config');

var file = 'rest.js';

function queryDefault(pool, res, call) {
    pool.query(call, function(err, result) {
        logger.logCall(file, call, err);

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else {
            if(!result[0]) {
                res.status(204).send();
            } else {
                res.status(200).send({data: result});
            }
        }
    });
}

function queryMessage(pool, res, call, status, message) {
    status = status || 200;
    message = message || 'success';

    pool.query(call, function(err, result) {
        logger.logCall(file, call, err);

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
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

    var order_by = req.headers['x-order-by'] !== undefined
        ? JSON.parse(req.headers['x-order-by'])
        : null;

    var pagination_limit = req.headers['x-pagination-limit'] !== undefined
        ? req.headers['x-pagination-limit']
        : null;

    var pagination_amount = req.headers['x-pagination-amount'] !== undefined
        ? req.headers['x-pagination-amount']
        : null;

    var filter_by = req.headers['x-filter-by'] !== undefined
        ? JSON.parse(req.headers['x-filter-by'])
        : null;

    if(params) {
        call = mysql.format(call, params);
    }

    if(order_by !== null) {
        call += ' ORDER BY ';

        for (var key in order_by) {
            call += key + ' ' + order_by[key] + ', ';
        }

        call = call.slice(0, -2);
    } else {
        if(order) {
            call += ' ORDER BY ';

            for (var key in order) {
                call += key + ' ' + order[key] + ', ';
            }

            call = call.slice(0, -2);
        }
    }

    if(pagination_limit !== null) {
        call += ' LIMIT ' + pagination_limit;
    }

    if(pagination_amount !== null) {
        call += ',' + pagination_amount;
    }

    queryDefault(pool, res, call);
};

exports.INSERT = function(pool, req, res, table) {
    var body = req.body,
        into = 'INSERT INTO ' + table + '(',
        vals = ' VALUES (',
        updt = '',
        varr = [],
        call;

    for (var key in body) {
        if(body.hasOwnProperty(key)) {
            into += key + ', ';
            vals += '?, ';
            updt += key + ' = ?, ';
            varr.push(body[key]);
        }
    }

    into = into.slice(0, -2) + ')';
    vals = vals.slice(0, -2) + ')';
    updt = updt.slice(0, -2);

    call = into + vals + ' ON DUPLICATE KEY UPDATE ' + updt;

    call = mysql.format(call, varr); // format to fix vals
    call = mysql.format(call, varr); // format to fix updt

    pool.query(call, function(err, result) {
        logger.logCall(file, call, err);

        if(!result || err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else {
            var returnId = 0,
                returnHash = 0,
                returnSend = null;

            if(result.insertId != undefined) {
                returnId = result.insertId;
            } else if(req.body.id != undefined) {
                returnId = req.body.id;
            }

            if(req.body.hash != undefined) {
                returnHash = req.body.hash;
            }

            if(returnId != 0 && returnHash != 0) {
                returnSend = {id: returnId, hash: req.body.hash};
            } else if(returnId != 0 && returnHash == 0) {
                returnSend = {id: returnId}
            } else if(returnId == 0 && returnHash != 0) {
                returnSend = {hash: req.body.hash}
            }

            res.status(201).send(returnSend);
        }

    });
};

exports.PUT = function(pool, req, res, table, options) {
    options = options || {id: req.params.id };

    var body = req.body,
        call = 'UPDATE ' + table + ' SET ',
        varr = [];

    for (var key in body) {
        if (body.hasOwnProperty(key)) {
            call += key + ' = ?, ';
            varr.push(body[key]);
        }
    }

    call = call.slice(0, -2);
    call += ' WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    call = mysql.format(call, varr); // format to fix vals

    pool.query(call, function(err) {
        logger.logCall(file, call, err);

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: error});
        } else {
            res.status(200).send();
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

// PERSON

exports.personInsertAttribute = function(pool, person, insert, current, callback) {
    if(person.atr[0] !== undefined && insert.atr[0] !== undefined) {
        var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

        for(var i in person.atr) {
            for(var j in insert.atr) {
                if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                    person.atr[i].value += insert.atr[j].value;
                    person.atr[i].changed = true;
                    insert.atr[j].updated = true;
                }
            }

            if(current.atr !== undefined && current.atr[0] !== undefined) {
                for(var k in current.atr) {
                    if(person.atr[i].attribute_id === current.atr[k].attribute_id) {
                        person.atr[i].value -= current.atr[k].value;
                        person.atr[i].changed = true;
                    }
                }
            }

            if(person.atr[i].changed === true) {
                call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
            }
        }

        for(var m in insert.atr) {
            console.log(4);
            if(insert.atr[m].updated !== true) {
                call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
            }
        }

        call = call.slice(0, -1);

        call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

        pool.query(call,callback);
    } else { callback(); }
};

exports.personCustomDescription = function(req, res, tableName) {
    var person = {},
        insert = {};

    person.id = req.params.id;
    person.secret = req.body.secret;

    insert.id = req.params.id2;
    insert.custom = req.body.custom;

    pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
        person.auth = !!result[0];

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else if(!person.auth) {
            res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
        } else {
            pool.query(mysql.format('UPDATE person_has_'+tableName+' SET '+tableName+'_custom = ? WHERE person_id = ? AND '+tableName+'_id = ?',[insert.custom,person.id,insert.id]),function(err) {
                if (err) {
                    res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                } else {
                    res.status(200).send();
                }
            });
        }
    });
};

exports.personEquip = function(req, res, tableName) {
    var person = {},
        insert = {};

    person.id = req.params.id;
    person.secret = req.body.secret;

    insert.id = req.params.id2;
    insert.equip = req.params.equip;

    pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
        person.auth = !!result[0];

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else if(!person.auth) {
            res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
        } else {
            pool.query(mysql.format('UPDATE person_has_'+tableName+' SET equipped = ? WHERE person_id = ? AND '+tableName+'_id = ?',[insert.equip,person.id,insert.id]),function(err) {
                if (err) {
                    res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                } else {
                    res.status(200).send();
                }
            });
        }
    });
};

exports.personDeleteRelation = function(req, res, tableName) {
    var person = {},
        insert = {};

    person.id = req.params.id;
    person.secret = req.body.secret;

    insert.id = req.params.id2;

    pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
        person.auth = !!result[0];

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else if(!person.auth) {
            res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
        } else {
            var call = mysql.format('DELETE FROM person_has_'+tableName+' WHERE person_id = ? AND '+tableName+'_id = ?',[person.id,insert.id]);
            console.log(call);
            pool.query(call,function(err) {
                if (err) {
                    res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                } else {
                    res.status(200).send();
                }
            });
        }
    });
};
