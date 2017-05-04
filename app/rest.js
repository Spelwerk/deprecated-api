var async = require('async'),
    mysql = require('mysql'),
    config = require('./config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    logger = require('./logger'),
    config = require('./config'),
    tokens = require('./tokens');

var file = 'rest.js';

function query(pool, call, params, callback) {
    if(params) {
        call = mysql.format(call, params);
    }

    pool.query(call, function(err, result) {
        logger.logCall(file, call, err);

        callback(err, result);
    });
}

function personAuth(pool, person, callback) {
    query(pool, 'SELECT secret FROM person WHERE id = ? AND secret = ?', [person.id, person.secret], function(err, result) {
        person.auth = !!result[0];

        if(err) return callback(err);

        if(!person.auth) return callback({status: 403, code: 0, message: 'Forbidden'});

        callback();
    });
}

function userAuth(pool, req, table, adminOnly, callback) {
    var user = {};

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;
    user.admin = user.token.sub.admin;

    if(!user.token) return callback({status: 400, code: 0, message: 'User not logged in.'});

    if(user.admin) return callback(null, user.id);

    if(adminOnly && !user.admin) return callback({status: 403, code: 0, message: 'Forbidden.'});

    query(pool,'SELECT owner FROM user_has_' + table.name + ' WHERE user_id = ? AND ' + table.name + '_id = ?',[user.id, table.id],function(err,result) {
        user.owner = !!result[0];

        if(!user.owner) return callback({status: 403, code: 0, message: 'Forbidden.'});

        callback(err, user.id);
    });
}

function sendMail(email, subject, text, callback) {
    var mail = {
        from: config.superuser.email,
        to: email,
        subject: subject,
        text: '',
        html: text
    };

    var composer = mailcomposer(mail);

    composer.build(function(err, message) {
        var dataToSend = {
            to: mail.to,
            message: message.toString('ascii')
        };

        mailgun.messages().sendMime(dataToSend,function(err, result) {
            callback(err, result);
        });
    });
}

module.exports.query = query;
module.exports.userAuth = userAuth;
module.exports.personAuth = personAuth;
module.exports.sendMail = sendMail;

// IMPROVED DEFAULT

exports.POST = function(pool, req, res, tableName, allowedKeys, adminOnly) {
    adminOnly = adminOnly || false;
    allowedKeys = allowedKeys || null;

    var table = {},
        insert = {},
        user = {};

    table.name = tableName;

    user.token = tokens.decode(req);

    if(!user.token) {
        res.status(400).send({status: 400, code: 0, message: 'User not logged in.'});
    } else if(adminOnly && !user.sub.admin) {
        res.status(400).send({status: 403, code: 0, message: 'Forbidden.'});
    } else {
        async.series([
            function(callback) {
                var body = req.body,
                    keys = [],
                    call = 'INSERT INTO ' + table.name + ' (',
                    vals = ' VALUES (',
                    varr = [];

                if(allowedKeys[0]) {
                    for(var key in body) {
                        keys.push(body[key]);
                    }
                } else {
                    keys = body;
                }

                for(var key in keys) {
                    if(keys.hasOwnProperty(key)) {
                        call += key + ',';
                        vals += '?,';
                        varr.push(keys[key]);
                    }
                }

                call = call.slice(0, -1) + ')';
                vals = vals.slice(0, -1) + ')';

                call += vals;

                query(pool, call, varr, function(err, result) {
                    insert.id = parseInt(result.insertId);

                    callback(err);
                });
            },
            function(callback) {
                if(adminOnly || user.token.sub.admin) { callback(); } else {
                    query(pool, 'INSERT INTO user_has_' + table.name + ' (user_id,' + table.name + '_id,owner) VALUES (?,?,1)', [user.token.sub.id, insert.id], callback);
                }
            }
        ],function(err) {
            if(err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({id: insert.id});
            }
        });
    }
};

exports.PUT = function(pool, req, res, tableName, allowedKeys, adminOnly) {
    adminOnly = adminOnly || false;
    allowedKeys = allowedKeys || null;

    var table = {},
        user = {};

    table.id = req.params.id;
    table.name = tableName;

    async.series([
        function(callback) {
            userAuth(pool, req, table, adminOnly, function(err, result) {
                user.id = result;

                callback(err);
            });
        },
        function(callback) {
            var body = req.body,
                keys = [],
                call = 'UPDATE ' + table.name + ' SET ',
                varr = [];

            if(allowedKeys[0]) {
                for(var key in body) {
                    keys.push(body[key]);
                }
            } else {
                keys = body;
            }

            for(var key in keys) {
                if(keys.hasOwnProperty(key)) {
                    call += key + ' = ?,';
                    varr.push(keys[key]);
                }
            }

            call = call.slice(0, -1) + ' WHERE id = ?';

            varr.push(table.id);

            query(pool, call, varr, callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.DELETE = function(pool, req, res, tableName, adminOnly) {
    adminOnly = adminOnly || false;

    var table = {};

    table.id = req.params.id;
    table.name = tableName;

    async.series([
        function(callback) {
            userAuth(pool, req, table, adminOnly, callback);
        },
        function(callback) {
            query(pool, 'UPDATE ' + table.name + ' SET deleted = CURRENT_TIMESTAMP WHERE id = ?', [table.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.REVIVE = function(pool, req, res, tableName) {
    var table = {},
        user = {};

    table.id = req.params.id;
    table.name = tableName;

    user.token = tokens.decode(req);
    user.admin = user.token.sub.admin;

    async.series([
        function(callback) {
            userAuth(pool, req, table, true, callback);
        },
        function(callback) {
            query(pool, 'UPDATE ' + table.name + ' SET deleted = NULL WHERE id = ?', [table.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.CANON = function(pool, req, res, tableName) {
    var table = {};

    table.id = req.params.id;
    table.name = tableName;

    async.series([
        function(callback) {
            userAuth(pool, req, table, true, callback);
        },
        function(callback) {
            query(pool, 'UPDATE ' + table.name + ' SET canon = 1 WHERE id = ?', [table.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

// OLD DEFAULT

exports.HELP = function(pool, req, res, table) {
    query(pool, 'SHOW FULL COLUMNS FROM ' + table, null, function(err, result) {
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

    query(pool, call, params, function(err, result) {
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
};

exports.OLD_DELETE = function(pool, req, res, table, options) {
    options = options || {id: req.params.id};

    var call = 'UPDATE ' + table + ' SET deleted = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    query(pool, call, null, function(err) {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(202).send();
        }
    });
};

exports.OLD_REVIVE = function(pool, req, res, table, options) {
    options = options || {id: req.params.id};

    var call = 'UPDATE ' + table + ' SET deleted = NULL, updated = CURRENT_TIMESTAMP WHERE ';

    for (var key in options) {
        call += key + ' = \'' + options[key] + '\' AND ';
    }

    call = call.slice(0, -5);

    query(pool, call, null, function(err) {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(202).send();
        }
    });
};

// RELATIONS

exports.relationPost = function(pool, req, res, tableName, relationName, adminOnly) {
    adminOnly = adminOnly || false;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.body.insert_id);
    relation.name = relationName;

    async.series([
        function (callback) {
            userAuth(pool, req, table, adminOnly, function(err, result) {
                user.id = result;

                callback(err);
            });
        },
        function (callback) {
            query(pool, 'INSERT INTO ' + table.name + '_has_' + relation.name + ' (' + table.name + '_id,' + relation.name + '_id) VALUES (?,?)', [table.id, relation.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.relationPostWithValue = function(pool, req, res, tableName, relationName, adminOnly) {
    adminOnly = adminOnly || false;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.body.insert_id);
    relation.name = relationName;
    relation.value = parseInt(req.body.value);

    async.series([
        function (callback) {
            userAuth(pool, req, table, adminOnly, function(err, result) {
                user.id = result;

                callback(err);
            });
        },
        function (callback) {
            query(pool, 'INSERT INTO ' + table.name + '_has_' + relation.name + ' (' + table.name + '_id,' + relation.name + '_id,value) VALUES (?,?,?)', [table.id, relation.id, relation.value], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.relationPutValue = function(pool, req, res, tableName, relationName, adminOnly) {
    adminOnly = adminOnly || false;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.body.insert_id);
    relation.value = req.body.value;
    relation.name = relationName;

    async.series([
        function(callback) {
            userAuth(pool, req, table, adminOnly, function(err, result) {
                user.id = result;

                callback(err);
            });
        },
        function(callback) {
            query(pool, 'UPDATE ' + table.name + '_has_' + relation.name + ' SET value = ? WHERE ' + table.name + '_id = ? AND ' + relation.name + '_id = ?', [relation.value, table.id, relation.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.relationDelete = function(pool, req, res, tableName, relationName, adminOnly) {
    adminOnly = adminOnly || false;

    var table = {},
        relation = {},
        user = {};

    table.id = parseInt(req.params.id);
    table.name = tableName;

    relation.id = parseInt(req.params.id2);
    relation.name = relationName;

    async.series([
        function(callback) {
            userAuth(pool, req, table, adminOnly, function(err, result) {
                user.id = result;

                callback(err);
            });
        },
        function(callback) {
            query(pool, 'DELETE FROM ' + table.name + '_has_' + relation.name + ' WHERE ' + table.name + '_id = ? AND ' + relation.name + '_id = ?', [table.id, relation.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

// PERSON

exports.personInsertAttribute = function(pool, person, insert, current, callback) {
    if(!person.attribute || !insert.attribute) return callback();

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

    query(pool, call, null, callback);
};

exports.personInsertSkill = function(pool, person, insert, current, callback) {
    if(!person.skill || !insert.skill) return callback();

    var call = 'INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ';

    for(var i in person.skill) {
        for(var j in insert.skill) {
            if(person.skill[i].skill_id === insert.skill[j].skill_id) {
                person.skill[i].value += insert.skill[j].value;
                person.skill[i].changed = true;
                insert.skill[j].updated = true;
            }
        }

        if(current.skill !== undefined && current.skill[0] !== undefined) {
            for(var k in current.skill) {
                if(person.skill[i].skill_id === current.skill[k].skill_id) {
                    person.skill[i].value -= current.skill[k].value;
                    person.skill[i].changed = true;
                }
            }
        }

        if(person.skill[i].changed === true) {
            call += '(' + person.id + ',' + person.skill[i].skill_id + ',' + person.skill[i].value + '),';
        }
    }

    for(var m in insert.skill) {
        if(insert.skill[m].updated !== true) {
            call += '(' + person.id + ',' + insert.skill[m].skill_id + ',' + insert.skill[m].value + '),';
        }
    }

    call = call.slice(0, -1);

    call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

    query(pool, call, null, callback);
};

exports.personCustomDescription = function(pool, req, res, tableName) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);
    insert.custom = req.body.custom;

    async.series([
        function(callback) {
            personAuth(pool, person, callback);
        },
        function(callback) {
            query(pool, 'UPDATE person_has_' + tableName + ' SET custom = ? WHERE person_id = ? AND ' + tableName + '_id = ?', [insert.custom, person.id, insert.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.personEquip = function(pool, req, res, tableName) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);
    insert.equip = parseInt(req.params.equip);

    async.series([
        function(callback) {
            personAuth(pool, person, callback);
        },
        function(callback) {
            query(pool, 'UPDATE person_has_' + tableName + ' SET equipped = ? WHERE person_id = ? AND ' + tableName + '_id = ?', [insert.equip, person.id, insert.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

exports.personDeleteRelation = function(pool, req, res, tableName) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);

    async.series([
        function(callback) {
            personAuth(pool, person, callback);
        },
        function(callback) {
            query(pool, 'DELETE FROM person_has_' + tableName + ' WHERE person_id = ? AND ' + tableName + '_id = ?', [person.id, insert.id], callback);
        }
    ],function(err) {
        if (err) {
            var status = err.status ? err.status : 500;
            res.status(status).send({code: err.code, message: err.message});
        } else {
            res.status(200).send();
        }
    });
};

// USER

exports.userRelationPost = function(pool, req, res, relationName) {
    var relation = {},
        user = {};

    relation.id = parseInt(req.body.insert_id);
    relation.name = relationName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;

    if(!user.token) {
        res.status(400).send({code: 0, message: 'User not logged in.'});
    } else {
        query(pool, 'INSERT INTO user_has_' + relation.name + ' (user_id,' + relation.name + '_id) VALUES (?,?)', [user.id, relation.id], function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    }
};

exports.userRelationDelete = function(pool, req, res, relationName) {
    var relation = {},
        user = {};

    relation.id = parseInt(req.params.id2);
    relation.name = relationName;

    user.token = tokens.decode(req);
    user.id = user.token.sub.id;

    if(!user.token) {
        res.status(400).send({code: 0, message: 'User not logged in.'});
    } else {
        query(pool, 'DELETE FROM user_has_' + relation.name + ' WHERE user_id = ? AND ' + relation.name + '_id = ?', [user.id, relation.id], function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    }
};