var async = require('async'),
    mysql = require('mysql'),
    pool = require('./pooler'),
    config = require('./config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    logger = require('./logger'),
    tokens = require('./tokens'),
    base = require('./base');

function query(call, params, callback) {
    if(params) {
        call = mysql.format(call, params);
    }

    pool.query(call, function(err, result) {
        logger.logCall('rest.js', call, err);

        callback(err, result);
    });
}

function userAuth(req, adminRequired, tableName, tableId, callback) {
    if(!req.user.token) return callback('User not logged in.');

    if(!req.user.id) return callback('User token invalid.');

    if(adminRequired && !req.user.admin) return callback('User not admin.');

    if(req.user.admin) return callback();

    query('SELECT owner FROM user_has_' + tableName + ' WHERE user_id = ? AND ' + tableName + '_id = ?', [req.user.id, tableId], function(err, result) {
        req.user.owner = !!result[0];

        if(!req.user.owner) return callback('User forbidden.');

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

function personInsert(call, personId, personList, relationList, currentList, callback) {
    console.log('person');
    console.log(personList);
    console.log('relation');
    console.log(relationList);
    console.log('current');
    console.log(currentList);

    if(!personList[0]) return callback();

    if((relationList === undefined || relationList === null || !relationList[0]) && (currentList === undefined || currentList === null || !currentList[0])) return callback();

    // Begin by looping through personList, as we want to change existing relations, not add new
    for(var p in personList) {

        // If the Relation List exists and has at least one value
        if(relationList && relationList[0]) {

            // Loop through relationList
            for(var r in relationList) {

                // If person has the relation-col we wish to update = add the value
                if(personList[p].id === relationList[r].id) {
                    personList[p].value += relationList[r].value;
                    personList[p].changed = true;
                }
            }
        }

        // If the Current List exists and has at least one value
        if(currentList && currentList[0]) {

            // Loop through currentList
            for(var c in currentList) {

                // If person has the relation-col we wish to update = remove the value
                if(personList[p].id === currentList[c].id) {
                    personList[p].value -= currentList[c].value;
                    personList[p].changed = true;
                }
            }
        }

        // If the attribute has changed = add it to the call
        if(personList[p].changed === true) {
            call += '(' + personId + ',' + personList[p].id + ',' + personList[p].value + '),';
        }
    }

    call = call.slice(0, -1);

    call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

    query(call, null, callback);
}

module.exports.query = query;
module.exports.userAuth = userAuth;
module.exports.sendMail = sendMail;
module.exports.personInsert = personInsert;

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

exports.CLONE = function(req, res, next, adminRequired, tableName, tableId) {
    var call = 'INSERT INTO ' + tableName + ' (',
        valsArray = [],
        copy = {};

    async.series([
        function(callback) {
            query('SELECT * FROM ' + tableName + ' WHERE id = ?', [tableId], function(err, result) {
                var select = result[0],
                    vals = ' VALUES (';

                for(var key in select) {
                    if(select.hasOwnProperty(key)) {
                        if(key === 'id') continue;
                        if(key === 'canon') continue;
                        if(key === 'popularity') continue;
                        if(key === 'created') continue;
                        if(key === 'deleted') continue;
                        if(key === 'updated') continue;

                        call += key + ',';
                        vals += '?,';
                        valsArray.push(select[key]);
                    }
                }

                call = call.slice(0, -1) + ')';
                vals = vals.slice(0, -1) + ')';

                call += vals;

                console.log(call);
                console.log(valsArray);

                callback();
            });
        },
        function(callback) {
            query(call, valsArray, function(err, result) {
                copy.id = result.insertId;

                callback(err);
            });
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send({id: copy.id});
    })
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

// USER

exports.userVerifyOwner = function(req, res, next, tableName, tableId) {
    var owner = false;

    async.series([
        function(callback) {
            if(!req.user) return callback();

            if(req.user.admin) return callback();

            query('SELECT owner FROM user_has_' + tableName + ' WHERE user_id = ? AND ' + tableName + '_id = ?', [req.user.id, tableId], callback);
        }
    ],function(err, result) {
        if(err) return next(err);

        if(req.user.admin) owner = true;

        if(result[0]) owner = !!result[0][0].owner;

        res.status(200).send({owner: owner});
    });

};

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

// COMMENT

exports.getComments = function(req, res, next, tableName, tableId) {
    var tName = tableName + '_has_comment',
        tId = tableName + '_id';

    var call = 'SELECT ' +
        'comment.id, ' +
        'comment.content, ' +
        'comment.user_id, ' +
        'user.displayname, ' +
        'comment.created, ' +
        'comment.updated ' +
        'FROM ' + tName + ' ' +
        'LEFT JOIN comment ON comment.id = ' + tName + '.comment_id ' +
        'LEFT JOIN user ON user.id = comment.user_id ' +
        'WHERE ' + tableName + '.' + tId + ' = ?';

    query(call, [tableId], function(err, result) {
        if(err) return next(err);

        if(!result[0]) {
            res.status(204).send();
        } else {
            res.status(200).send({data: result});
        }
    });
};

exports.postComment = function(req, res, next, tableName, tableId) {
    var tName = tableName + '_has_comment',
        tId = tableName + '_id';

    var insert = {};

    insert.content = req.body.content;

    async.series([
        function(callback) {
            query('INSERT INTO comment (content,user_id) VALUES (?,?)',[insert.content, req.user.id], function(err, result) {
                insert.id = result.insertId;

                callback(err);
            });
        },
        function(callback) {
            query('INSERT INTO ' + tName + ' (' + tId + ',comment_id) VALUES (?,?)', [tableId, insert.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        if(!result[0]) {
            res.status(204).send();
        } else {
            res.status(200).send();
        }
    })
};
