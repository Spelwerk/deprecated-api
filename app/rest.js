var async = require('async'),
    mysql = require('mysql'),
    logger = require('./logger'),
    config = require('./config'),
    tokens = require('./tokens');

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

function query(pool, call, params, callback) {
    var query = mysql.format(call,params);

    pool.query(query,function(err,result) {
        logger.logCall(file,query,err);

        callback(err,result);
    });
}

module.exports.queryDefault = queryDefault;
module.exports.queryMessage = queryMessage;
module.exports.query = query;

// IMPROVED DEFAULT

exports.POST = function(pool, req, res, tableName, allowedKeys, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        insert = {},
        user = {};

    table.name = tableName;

    user.token = tokens.decode(req);

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.sub.admin) {
        res.status(400).send('User not admin and not allowed to post to this table.');
    } else {
        async.series([
            function(callback) {
                var body = req.body,
                    call = 'INSERT INTO ' + table.name + ' (',
                    vals = ' VALUES (',
                    varr = [];

                for(var key in body) {
                    if(allowedKeys.includes(key) && body.hasOwnProperty(key)) {
                        call += key + ',';
                        vals += '?,';
                        varr.push(body[key]);
                    }
                }

                call = call.slice(0, -1) + ')';
                vals = vals.slice(0, -1) + ')';

                call += vals;

                query(pool,call,varr,function(err,result) {
                    insert.id = parseInt(result.insertId);

                    callback(err);
                });
            },
            function(callback) {
                if(allowsUser) {
                    user.id = user.token.sub.id;

                    var user_has_table = 'user_has_' + table.name,
                        table_id = table.name + '_id';

                    query(pool,'INSERT INTO ' + user_has_table + ' (user_id,' + table_id + ',owner) VALUES (?,?,1)',[user.id,insert.id],callback);
                } else { callback(); }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(200).send({id: insert.id});
            }
        });
    }
};

exports.PUT = function(pool, req, res, tableName, allowedKeys, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        user = {};

    table.id = req.params.id;
    table.name = tableName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.sub.admin) {
        res.status(400).send('User not admin and not allowed to put to this table.');
    } else {
        async.series([
            function(callback) {
                if(allowsUser) {
                    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id,table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(!user.admin && !user.owner) {
                    res.status(400).send('User not allowed to delete from this table row.');
                } else {
                    var insert = req.body,
                        call = 'UPDATE ' + table.name + ' SET ',
                        valuesArray = [];

                    for(var key in insert) {
                        if(allowedKeys.includes(key) && insert.hasOwnProperty(key)) {
                            call += key + ' = ?,';
                            valuesArray.push(insert[key]);
                        }
                    }

                    call = call.slice(0, -1) + ' WHERE id = ?';

                    valuesArray.push(table.id);

                    query(pool,call,valuesArray,callback);
                }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(200).send();
            }
        });
    }
};

exports.DELETE = function(pool, req, res, tableName, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        user = {};

    table.id = req.params.id;
    table.name = tableName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        async.series([
            function(callback) {
                if(allowsUser) {
                    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id,table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(!user.admin && !user.owner) {
                    res.status(400).send('User not allowed to delete from this table row.');
                } else {
                    var call = 'UPDATE ' + table.name + ' SET deleted = CURRENT_TIMESTAMP WHERE id = ?';

                    query(pool,call,[table.id],callback);
                }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

exports.REVIVE = function(pool, req, res, tableName) {
    var table = {},
        user = {};

    table.id = req.params.id;
    table.name = tableName;

    user.token = tokens.decode(req);
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        var call = 'UPDATE ' + table.name + ' SET deleted = NULL WHERE id = ?';

        query(pool,call,[table.id],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

exports.CANON = function(pool, req, res, tableName) {
    var table = {},
        user = {};

    table.id = req.params.id;
    table.name = tableName;

    user.token = tokens.decode(req);
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        var call = 'UPDATE ' + table.name + ' SET canon = 1 WHERE id = ?';

        query(pool,call,[table.id],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

// OLD DEFAULT

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

exports.OLD_INSERT = function(pool, req, res, table) {
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

exports.OLD_PUT = function(pool, req, res, table, options) {
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

exports.OLD_DELETE = function(pool, req, res, table, options) {
    options = options || {id: req.params.id};

    var call = 'UPDATE ' + table + ' SET deleted = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    queryMessage(pool, res, call, 202, 'deleted');
};

exports.OLD_REVIVE = function(pool, req, res, table, options) {
    options = options || {id: req.params.id};

    var call = 'UPDATE ' + table + ' SET deleted = NULL, updated = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    queryMessage(pool, res, call, 200, 'revived');
};

// RELATIONS

exports.relationPost = function(pool, req, res, tableName, relationName, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.body.insert_id);
    relation.name = relationName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        async.series([
            function(callback) {
                if(allowsUser) {
                    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id, table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(!user.admin && !user.owner) {
                    res.status(400).send('User not allowed to post to this table row.');
                } else {
                    var call = 'INSERT INTO ' + table.name + '_has_' + relation.name + ' (' + table.name + '_id,' + relation.name + '_id) VALUES (?,?)';

                    query(pool,call,[table.id, relation.id],callback);
                }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

exports.relationPostWithValue = function(pool, req, res, tableName, relationName, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.body.insert_id);
    relation.value = req.body.value;
    relation.name = relationName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        async.series([
            function(callback) {
                if(allowsUser) {
                    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id, table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(!user.admin && !user.owner) {
                    res.status(400).send('User not allowed to post to this table row.');
                } else {
                    var call = 'INSERT INTO ' + table.name + '_has_' + relation.name + ' (' + table.name + '_id,' + relation.name + '_id,value) VALUES (?,?,?)';

                    query(pool,call,[table.id, relation.id, relation.value],callback);
                }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

exports.relationPutValue = function(pool, req, res, tableName, relationName, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.body.insert_id);
    relation.value = req.body.value;
    relation.name = relationName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        async.series([
            function(callback) {
                if(allowsUser) {
                    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id, table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(!user.admin && !user.owner) {
                    res.status(400).send('User not allowed to post to this table row.');
                } else {
                    var call = 'UPDATE ' + table.name + '_has_' + relation.name + ' SET value = ? WHERE ' + table.name + '_id = ? AND ' + relation.name + '_id = ?';

                    query(pool,call,[relation.value, table.id, relation.id],callback);
                }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

exports.relationDelete = function(pool, req, res, tableName, relationName, allowsUser) {
    allowsUser = allowsUser || true;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.params.id2);
    relation.name = relationName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;
    user.admin = user.token.sub.admin;

    if(!user.token) {
        res.status(400).send('User not logged in.');
    } else if(!allowsUser && !user.admin) {
        res.status(400).send('User not admin and not allowed to change this table.');
    } else {
        async.series([
            function(callback) {
                if(allowsUser) {
                    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id,table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(!user.admin && !user.owner) {
                    res.status(400).send('User not allowed to delete from this table row.');
                } else {
                    var call = 'DELETE FROM ' + table.name + '_has_' + relation.name + ' WHERE ' + table.name + '_id = ? AND ' + relation.name + '_id = ?';

                    query(pool,call,[table.id,relation.id],callback);
                }
            }
        ],function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    }
};

// PERSON

exports.personInsertAttribute = function(pool, person, insert, current, callback) {
    if(person.attribute[0] !== undefined && insert.attribute[0] !== undefined) {
        var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

        for(var i in person.attribute) {
            for(var j in insert.attribute) {
                if(person.attribute[i].attribute_id === insert.attribute[j].attribute_id) {
                    person.attribute[i].value += insert.attribute[j].value;
                    person.attribute[i].changed = true;
                    insert.attribute[j].updated = true;
                }
            }

            if(current.attribute !== undefined && current.attribute[0] !== undefined) {
                for(var k in current.attribute) {
                    if(person.attribute[i].attribute_id === current.attribute[k].attribute_id) {
                        person.attribute[i].value -= current.attribute[k].value;
                        person.attribute[i].changed = true;
                    }
                }
            }

            if(person.attribute[i].changed === true) {
                call += '(' + person.id + ',' + person.attribute[i].attribute_id + ',' + person.attribute[i].value + '),';
            }
        }

        for(var m in insert.attribute) {
            if(insert.attribute[m].updated !== true) {
                call += '(' + person.id + ',' + insert.attribute[m].attribute_id + ',' + insert.attribute[m].value + '),';
            }
        }

        call = call.slice(0, -1);

        call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

        pool.query(call,callback);
    } else { callback(); }
};

exports.personCustomDescription = function(pool, req, res, tableName) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);
    insert.custom = req.body.custom;

    pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
        person.auth = !!result[0];

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else if(!person.auth) {
            res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
        } else {
            pool.query(mysql.format('UPDATE person_has_'+tableName+' SET custom = ? WHERE person_id = ? AND '+tableName+'_id = ?',[insert.custom,person.id,insert.id]),function(err) {
                if (err) {
                    res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                } else {
                    res.status(200).send();
                }
            });
        }
    });
};

exports.personEquip = function(pool, req, res, tableName) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);
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

exports.personDeleteRelation = function(pool, req, res, tableName) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);

    pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
        person.auth = !!result[0];

        if(err) {
            res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
        } else if(!person.auth) {
            res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
        } else {
            var call = mysql.format('DELETE FROM person_has_'+tableName+' WHERE person_id = ? AND '+tableName+'_id = ?',[person.id,insert.id]);
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

// WORLD

exports.worldPostHas = function(pool, req, res, worldId, tableName) {
    tablePostHas(pool, req, res, 'world', worldId, tableName);
};

exports.worldDeleteHas = function(pool, req, res, worldId, hasId, tableName) {
    tableDeleteHas(pool, req, res, 'world', worldId, tableName, hasId);
};