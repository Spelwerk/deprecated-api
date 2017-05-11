var async = require('async'),
    mysql = require('mysql'),
    pool = require('./pooler'),
    config = require('./config'),
    mailgun = require('mailgun-js')({apiKey: config.mailgun.apikey, domain: config.mailgun.domain}),
    mailcomposer = require('mailcomposer'),
    logger = require('./logger'),
    tokens = require('./tokens');

var file = 'rest.js';

function query(call, params, callback) {
    if(params) {
        call = mysql.format(call, params);
    }

    pool.query(call, function(err, result) {
        logger.logCall(file, call, err);

        callback(err, result);
    });
}

function personAuth(person, callback) {
    query('SELECT secret FROM person WHERE id = ? AND secret = ?', [person.id, person.secret], function(err, result) {
        person.auth = !!result[0];

        if(!person.auth) return callback('Forbidden.');

        callback(err);
    });
}

function userAuth(req, callback) {
    if(req.table.user && !req.user.id) return callback('Forbidden.');

    if(req.table.admin && !req.user.admin) return callback('Forbidden.');

    if(req.user.admin) return callback();

    query('SELECT owner FROM user_has_' + req.table.name + ' WHERE user_id = ? AND ' + req.table.name + '_id = ?',[req.user.id, req.table.id], function(err, result) {
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
module.exports.personAuth = personAuth;
module.exports.sendMail = sendMail;

// IMPROVED DEFAULT

exports.POST = function(req, res, next) {
    if(req.table.admin && !req.user.admin) return next('Forbidden.');

    if(req.table.user && !req.user.id) return next('Forbidden.');

    var insert = {};

    async.series([
        function(callback) {
            var body = req.body,
                call = 'INSERT INTO ' + req.table.name + ' (',
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

                callback(err);
            });
        },
        function(callback) {
            if(req.user.admin) return callback();

            query('INSERT INTO user_has_' + req.table.name + ' (user_id,' + req.table.name + '_id,owner) VALUES (?,?,1)', [req.user.id, insert.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send({id: insert.id});
    });
};

exports.PUT = function(req, res, next) {
    req.table.id = parseInt(req.params.id);

    async.series([
        function(callback) {
            userAuth(req, callback);
        },
        function(callback) {
            var body = req.body,
                call = 'UPDATE ' + req.table.name + ' SET ',
                varr = [];

            for(var key in body) {
                if(body.hasOwnProperty(key) && body[key] !== '') {
                    call += key + ' = ?,';
                    varr.push(body[key]);
                }
            }

            call = call.slice(0, -1) + ' WHERE id = ?';

            varr.push(req.table.id);

            query(call, varr, callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.DELETE = function(req, res, next) {
    req.table.id = parseInt(req.params.id);

    async.series([
        function(callback) {
            userAuth(req, callback);
        },
        function(callback) {
            query('UPDATE ' + req.table.name + ' SET deleted = CURRENT_TIMESTAMP WHERE id = ?', [req.table.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.REVIVE = function(req, res, next) {
    req.table.id = parseInt(req.params.id);

    async.series([
        function(callback) {
            userAuth(req, callback);
        },
        function(callback) {
            query('UPDATE ' + req.table.name + ' SET deleted = NULL WHERE id = ?', [req.table.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.CANON = function(req, res, next) {
    req.table.id = parseInt(req.params.id);

    async.series([
        function(callback) {
            userAuth(req, callback);
        },
        function(callback) {
            query('UPDATE ' + req.table.name + ' SET canon = 1 WHERE id = ?', [req.table.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

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

// RELATIONS

exports.relationPost = function(req, res, next) {
    req.table.id = parseInt(req.params.id);
    req.relation.id = parseInt(req.body.insert_id);

    async.series([
        function (callback) {
            userAuth(req, callback);
        },
        function (callback) {
            query('INSERT INTO ' + req.table.name + '_has_' + req.relation.name + ' (' + req.table.name + '_id,' + req.relation.name + '_id) VALUES (?,?)', [req.table.id, req.relation.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.relationPostWithValue = function(req, res, next) {
    req.table.id = parseInt(req.params.id);
    req.relation.id = parseInt(req.body.insert_id);
    req.relation.value = parseInt(req.body.value);

    async.series([
        function (callback) {
            userAuth(req, callback);
        },
        function (callback) {
            query('INSERT INTO ' + req.table.name + '_has_' + req.relation.name + ' (' + req.table.name + '_id,' + req.relation.name + '_id,value) VALUES (?,?,?)', [req.table.id, req.relation.id, req.relation.value], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.relationPutValue = function(req, res, next) {
    req.table.id = parseInt(req.params.id);
    req.relation.id = parseInt(req.body.insert_id);
    req.relation.value = parseInt(req.body.value);

    async.series([
        function(callback) {
            userAuth(req, callback);
        },
        function(callback) {
            query('UPDATE ' + req.table.name + '_has_' + req.relation.name + ' SET value = ? WHERE ' + req.table.name + '_id = ? AND ' + req.relation.name + '_id = ?', [req.relation.value, req.table.id, req.relation.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.relationDelete = function(req, res, next) {
    req.table.id = parseInt(req.params.id);
    req.relation.id = parseInt(req.params.id2);

    async.series([
        function(callback) {
            userAuth(req, callback);
        },
        function(callback) {
            query('DELETE FROM ' + req.table.name + '_has_' + req.relation.name + ' WHERE ' + req.table.name + '_id = ? AND ' + req.relation.name + '_id = ?', [req.table.id, req.relation.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

// PERSON

exports.personInsertAttribute = function(person, insert, current, callback) {
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

    query(call, null, callback);
};

exports.personInsertSkill = function(person, insert, current, callback) {
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

    query(call, null, callback);
};

exports.personCustomDescription = function(req, res, next) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);
    insert.custom = req.body.custom;

    async.series([
        function(callback) {
            personAuth(person, callback);
        },
        function(callback) {
            query('UPDATE person_has_' + req.table.name + ' SET custom = ? WHERE person_id = ? AND ' + req.table.name + '_id = ?', [insert.custom, person.id, insert.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.personEquip = function(req, res, next) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);
    insert.equip = parseInt(req.params.equip);

    async.series([
        function(callback) {
            personAuth(person, callback);
        },
        function(callback) {
            query('UPDATE person_has_' + req.table.name + ' SET equipped = ? WHERE person_id = ? AND ' + req.table.name + '_id = ?', [insert.equip, person.id, insert.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.personDeleteRelation = function(req, res, next) {
    var person = {},
        insert = {};

    person.id = parseInt(req.params.id);
    person.secret = req.body.secret;

    insert.id = parseInt(req.params.id2);

    async.series([
        function(callback) {
            personAuth(person, callback);
        },
        function(callback) {
            query('DELETE FROM person_has_' + req.table.name + ' WHERE person_id = ? AND ' + req.table.name + '_id = ?', [person.id, insert.id], callback);
        }
    ],function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

// USER

exports.userRelationPost = function(req, res, next) {
    if(!req.user.id) return next('Forbidden.');

    req.relation.id = parseInt(req.params.id2);

    query('INSERT INTO user_has_' + req.relation.name + ' (user_id,' + req.relation.name + '_id) VALUES (?,?)', [req.user.id, req.relation.id], function(err) {
        if(err) return next(err);

        res.status(200).send();
    });
};

exports.userRelationDelete = function(req, res, next) {
    if(!req.user.id) return next('Forbidden.');

    req.relation.id = parseInt(req.params.id2);

    query('DELETE FROM user_has_' + req.relation.name + ' WHERE user_id = ? AND ' + req.relation.name + '_id = ?', [req.user.id, req.relation.id], function(err) {
        if(err) return next(err);

        res.status(202).send();
    });
};