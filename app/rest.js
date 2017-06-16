var async = require('async'),
    mysql = require('mysql'),
    pool = require('./pooler'),
    config = require('./config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    logger = require('./logger'),
    tokens = require('./tokens'),
    base = require('./base');

function query(call, params, callback, logCall) {
    logCall = logCall || true;

    if(params) {
        call = mysql.format(call, params);
    }

    pool.query(call, function(err, result) {
        if(logCall) logger.logCall('rest.js', call, err);

        callback(err, result);
    });
}

function userAuth(req, adminRequired, tableName, tableId, callback) {
    if(!req.user.id) return callback('Forbidden.');

    if(adminRequired && !req.user.admin) return callback('Forbidden.');

    if(req.user.admin) return callback();

    query('SELECT owner FROM user_has_' + tableName + ' WHERE user_id = ? AND ' + tableName + '_id = ?', [req.user.id, tableId], function(err, result) {
        req.user.owner = !!result[0];

        if(!req.user.owner) return callback('Forbidden.');

        callback(err);
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
module.exports.sendMail = sendMail;

// GET

exports.QUERY = function(req, res, next, call, params, order) {
    params = params || null;
    order = order || null;

    var order_by = req.headers['x-order-by'] !== undefined
        ? JSON.parse(req.headers['x-order-by'])
        : order;

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
    }

    if(pagination_limit !== null) {
        call += ' LIMIT ' + pagination_limit;
    }

    if(pagination_amount !== null) {
        call += ',' + pagination_amount;
    }

    query(call, params, function(err, result) {
        if(err) return next(err);

        if(!result[0]) {
            res.status(204).send();
        } else {
            res.status(200).send({data: result});
        }
    });
};

// POST / PUT

exports.POST = function(req, res, next, adminRequired, userSave, tableName) {
    if(!req.user.id) return next('Forbidden.');

    if(adminRequired && !req.user.admin) return next('Forbidden.');

    var insert = {};

    async.series([
        function(callback) {
            var body = req.body,
                call = 'INSERT INTO ' + tableName + ' (',
                vals = ' VALUES (',
                varr = [];

            for(var key in body) {
                if(body.hasOwnProperty(key) && body[key] !== '') {
                    call += key + ',';
                    vals += '?,';
                    varr.push(body[key]);
                }
            }

            call = call.slice(0, -1) + ')';
            vals = vals.slice(0, -1) + ')';

            call += vals;

            query(call, varr, function(err, result) {
                insert.id = parseInt(result.insertId);
                insert.cs = base.encode(insert.id);

                callback(err);
            });
        },
        function(callback) {
            if(!userSave) return callback();

            query('INSERT INTO user_has_' + tableName + ' (user_id,' + tableName + '_id,owner) VALUES (?,?,1)', [req.user.id, insert.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send({id: insert.id, cs: insert.cs});
    });
};

exports.PUT = function(req, res, next, adminRequired, tableName, tableId) {
    async.series([
        function(callback) {
            userAuth(req, adminRequired, tableName, tableId, callback);
        },
        function(callback) {
            var body = req.body,
                call = 'UPDATE ' + tableName + ' SET ',
                varr = [];

            for(var key in body) {
                if(body.hasOwnProperty(key) && body[key] !== '') {
                    call += key + ' = ?,';
                    varr.push(body[key]);
                }
            }

            call = call.slice(0, -1) + ' WHERE id = ?';

            varr.push(tableId);

            query(call, varr, callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.CANON = function(req, res, next, tableName, tableId) {
    async.series([
        function(callback) {
            userAuth(req, true, tableName, tableId, callback);
        },
        function(callback) {
            query('UPDATE ' + tableName + ' SET canon = 1 WHERE id = ?', [tableId], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

// DELETE / REVIVE

exports.DELETE = function(req, res, next, adminRequired, tableName, tableId) {
    async.series([
        function(callback) {
            userAuth(req, adminRequired, tableName, tableId, callback);
        },
        function(callback) {
            query('UPDATE ' + tableName + ' SET deleted = CURRENT_TIMESTAMP WHERE id = ?', [tableId], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.REVIVE = function(req, res, next, tableName, tableId) {
    async.series([
        function(callback) {
            userAuth(req, true, tableName, tableId, callback);
        },
        function(callback) {
            query('UPDATE ' + tableName + ' SET deleted = NULL WHERE id = ?', [tableId], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

// RELATIONS

exports.relationPost = function(req, res, next, tableName, tableId, relationName, relationId) {
    async.series([
        function (callback) {
            userAuth(req, false, tableName, tableId, callback);
        },
        function (callback) {
            query('INSERT INTO ' + tableName + '_has_' + relationName + ' (' + tableName + '_id,' + relationName + '_id) VALUES (?,?)', [parseInt(tableId), parseInt(relationId)], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.relationPostWithValue = function(req, res, next, tableName, tableId, relationName, relationId, relationValue) {
    async.series([
        function (callback) {
            userAuth(req, false, tableName, tableId, callback);
        },
        function (callback) {
            query('INSERT INTO ' + tableName + '_has_' + relationName + ' (' + tableName + '_id,' + relationName + '_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [parseInt(tableId), parseInt(relationId), parseInt(relationValue)], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.relationPutValue = function(req, res, next, tableName, tableId, relationName, relationId, relationValue) {
    async.series([
        function(callback) {
            userAuth(req, false, tableName, tableId, callback);
        },
        function(callback) {
            query('UPDATE ' + tableName + '_has_' + relationName + ' SET value = ? WHERE ' + tableName + '_id = ? AND ' + relationName + '_id = ?', [parseInt(relationValue), parseInt(tableId), parseInt(relationId)], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.relationDelete = function(req, res, next, tableName, tableId, relationName, relationId) {
    async.series([
        function(callback) {
            userAuth(req, false, tableName, tableId, callback);
        },
        function(callback) {
            query('DELETE FROM ' + tableName + '_has_' + relationName + ' WHERE ' + tableName + '_id = ? AND ' + relationName + '_id = ?', [parseInt(tableId), parseInt(relationId)], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

// PERSON

exports.personInsertAttribute = function(person, insert, current, callback) {
    if(!person.attribute || !person.attribute[0] || !insert.attribute || !insert.attribute[0]) return callback();

    var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

    // Loop through attribute list from person
    for(var i in person.attribute) {

        // Loop through attribute list from relation
        for(var j in insert.attribute) {

            // If person has attribute in list = update values positively
            if(person.attribute[i].attribute_id === insert.attribute[j].attribute_id) {
                person.attribute[i].value += insert.attribute[j].value;
                person.attribute[i].changed = true;
                insert.attribute[j].updated = true;
            }
        }

        // If there is a previous (single) relation that has an attribute
        if(current.attribute !== undefined && current.attribute[0] !== undefined) {

            // Loop through the attribute list from previous relation
            for(var k in current.attribute) {

                // If person has attribute in the list = update values negatively
                if(person.attribute[i].attribute_id === current.attribute[k].attribute_id) {
                    person.attribute[i].value -= current.attribute[k].value;
                    person.attribute[i].changed = true;
                }
            }
        }

        // If the attribute has changed = add it to the call
        if(person.attribute[i].changed === true) {
            call += '(' + person.id + ',' + person.attribute[i].attribute_id + ',' + person.attribute[i].value + '),';
        }
    }

    // If the value in the relation attribute has not been updated (ie: person does not have it) = add it to the call
    /*

     This is currently hidden because I am not sure we want to add attributes to players if they are missing them.
     The world sets a list of attributes, and then manifestation. That should be it.

     for(var m in insert.attribute) {
        if(insert.attribute[m].updated !== true) {
            call += '(' + person.id + ',' + insert.attribute[m].attribute_id + ',' + insert.attribute[m].value + '),';
        }
    }
     */

    call = call.slice(0, -1);

    call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

    query(call, null, callback);
};

exports.personInsertSkill = function(person, insert, current, callback) {
    if(!person.skill || !person.skill[0] || !insert.skill || !insert.skill[0]) return callback();

    var call = 'INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ';

    // Loop through skill list from person
    for(var i in person.skill) {

        // Loop through skill list from relation
        for(var j in insert.skill) {

            // If person has the skill in list = update values positively
            if(person.skill[i].skill_id === insert.skill[j].skill_id) {
                person.skill[i].value += insert.skill[j].value;
                person.skill[i].changed = true;
                insert.skill[j].updated = true;
            }
        }

        // If there is a previous (single) relation that has a skill
        if(current.skill !== undefined && current.skill[0] !== undefined) {

            // Loop through the skill list from previous relation
            for(var k in current.skill) {

                // If person has skill in list = update values negatively
                if(person.skill[i].skill_id === current.skill[k].skill_id) {
                    person.skill[i].value -= current.skill[k].value;
                    person.skill[i].changed = true;
                }
            }
        }

        // If the skill has changed = add it to the call
        if(person.skill[i].changed === true) {
            call += '(' + person.id + ',' + person.skill[i].skill_id + ',' + person.skill[i].value + '),';
        }
    }

    // If the value in the relation skill has not been updated (ie: person does not have it) = add it to the call
    /*

    This is currently hidden because I am not sure we want to add skills to players if they are missing them.
    The world sets a list of skills, and then species. That should be it.

    for(var m in insert.skill) {
        if(insert.skill[m].updated !== true) {
            call += '(' + person.id + ',' + insert.skill[m].skill_id + ',' + insert.skill[m].value + '),';
        }
    }
    */

    call = call.slice(0, -1);

    call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

    query(call, null, callback);
};

exports.personCustomDescription = function(req, res, next, personId, tableName, tableId, tableCustom) {
    if(!parseInt(personId)) return next('Parsing Error. Expected personId. Actual: ' + personId);

    if(!parseInt(tableId)) return next('Parsing Error. Expected tableId. Actual: ' + tableId);

    async.series([
        function(callback) {
            userAuth(req, false, 'person', personId, callback);
        },
        function(callback) {
            query('UPDATE person_has_' + tableName + ' SET custom = ? WHERE person_id = ? AND ' + tableName + '_id = ?', [tableCustom, personId, tableId], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.personEquip = function(req, res, next, personId, tableName, tableId, tableEquip) {
    if(!parseInt(personId)) return next('Parsing Error. Expected personId. Actual: ' + personId);

    if(!parseInt(tableId)) return next('Parsing Error. Expected tableId. Actual: ' + tableId);

    async.series([
        function(callback) {
            userAuth(req, false, 'person', personId, callback);
        },
        function(callback) {
            query('UPDATE person_has_' + tableName + ' SET equipped = ? WHERE person_id = ? AND ' + tableName + '_id = ?', [tableEquip, personId, tableId], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

// USER

exports.userRelationPost = function(req, res, next, userId, relationName, relationId) {
    if(!req.user.id) return next('Forbidden.');

    if(req.user.id !== userId && !req.user.admin) return next('Forbidden.');

    if(!parseInt(userId)) return next('Parsing Error. Expected userId. Actual: ' + userId);

    if(!parseInt(relationId)) return next('Parsing Error. Expected relationId. Actual: ' + relationId);

    query('INSERT INTO user_has_' + relationName + ' (user_id,' + relationName + '_id) VALUES (?,?)', [parseInt(userId), parseInt(relationId)], function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.userRelationDelete = function(req, res, next, userId, relationName, relationId) {
    if(!req.user.id) return next('Forbidden.');

    if(req.user.id !== userId && !req.user.admin) return next('Forbidden.');

    if(!parseInt(userId)) return next('Parsing Error. Expected userId. Actual: ' + userId);

    if(!parseInt(relationId)) return next('Parsing Error. Expected relationId. Actual: ' + relationId);

    query('DELETE FROM user_has_' + relationName + ' WHERE user_id = ? AND ' + relationName + '_id = ?', [parseInt(userId), parseInt(relationId)], function(err) {
        if(err) return next(err);

        res.status(202).send();
    });
};