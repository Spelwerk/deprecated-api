var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'characteristic.id, ' +
        'characteristic.canon, ' +
        'characteristic.name, ' +
        'characteristic.description, ' +
        'person_has_characteristic.characteristic_custom, ' +
        'characteristic.gift, ' +
        'characteristic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'characteristic.attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_characteristic ' +
        'LEFT JOIN characteristic ON characteristic.id = person_has_characteristic.characteristic_id ' +
        'LEFT JOIN attribute ON attribute.id = characteristic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = characteristic.icon_id';

    router.get(path + '/id/:id/characteristic', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_characteristic.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"gift": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/characteristic/gift/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_characteristic.person_id = ? AND ' +
            'characteristic.gift = ?';

        rest.QUERY(pool, req, res, call, [req.params.id,req.params.id2], {"gift": "DESC", "name": "ASC"});
    });

    router.post(path + '/id/:id/characteristic', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.characteristic_id;

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
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM characteristic WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_characteristic (person_id,characteristic_id) VALUES (?,?)',[person.id,insert.id]),callback);
                        },
                        function(callback) {
                            if(insert.atr[0].attribute_id !== null) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.atr) {
                                    for(var j in insert.atr) {
                                        if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                                            person.atr[i].value += insert.atr[j].value;
                                            person.atr[i].changed = true;
                                            insert.atr[j].updated = true;
                                        }
                                    }

                                    if(person.atr[i].changed === true) {
                                        call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                                    }
                                }

                                for(var m in insert.atr) {
                                    if(insert.atr[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
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

    router.put(path + '/id/:id/characteristic/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'characteristic');
    });

    router.delete(path + '/id/:id/characteristic/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'characteristic');
    });
};