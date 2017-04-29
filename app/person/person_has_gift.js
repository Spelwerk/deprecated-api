var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'gift.id, ' +
        'gift.canon, ' +
        'gift.name, ' +
        'gift.description, ' +
        'person_has_gift.custom, ' +
        'gift.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'gift.attribute_value ' +
        'FROM person_has_gift ' +
        'LEFT JOIN gift ON gift.id = person_has_gift.gift_id ' +
        'LEFT JOIN attribute ON attribute.id = gift.attribute_id';

    router.get(path + '/id/:id/gift', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_gift.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/gift', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.gift_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM gift WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_gift (person_id,gift_id) VALUES (?,?)',[person.id,insert.id]),callback);
                        },
                        function(callback) {
                            if(insert.attribute[0].attribute_id !== null) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.attribute) {
                                    for(var j in insert.attribute) {
                                        if(person.attribute[i].attribute_id === insert.attribute[j].attribute_id) {
                                            person.attribute[i].value += insert.attribute[j].value;
                                            person.attribute[i].changed = true;
                                            insert.attribute[j].updated = true;
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
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback('wrong secret'); }
            }
        ],function(err) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/gift/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'gift');
    });

    router.delete(path + '/id/:id/gift/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'gift');
    });
};