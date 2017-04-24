var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'augmentation.id, ' +
        'augmentation.canon, ' +
        'augmentation.name, ' +
        'augmentation.description, ' +
        'augmentation.price, ' +
        'augmentation.energy, ' +
        'augmentation.legal, ' +
        'augmentation.weapon_id, ' +
        'weapon.name AS weapon_name, ' +
        'person_has_augmentation.augmentationquality_id AS quality_id, ' +
        'augmentationquality.name AS quality_name, ' +
        'augmentationquality.price AS quality_price, ' +
        'augmentationquality.energy AS quality_energy ' +
        'FROM person_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = person_has_augmentation.augmentation_id ' +
        'LEFT JOIN weapon ON weapon.id = augmentation.weapon_id ' +
        'LEFT JOIN augmentationquality ON augmentationquality.id = person_has_augmentation.augmentationquality_id';

    router.get(path + '/id/:id/augmentation', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"bionic_id":"ASC"});
    });

    router.get(path + '/id/:id/augmentation/bionic/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ? AND ' +
            'person_has_augmentation.bionic_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id,req.params.id2]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.augmentation_id;
        insert.bionic = req.body.bionic_id;

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
                        pool.query(mysql.format('SELECT attribute_id, value FROM augmentation_has_attribute WHERE augmentation_id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT weapon_id FROM augmentation WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];
                    insert.wpn = results[3][0][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_augmentation (person_id,bionic_id,augmentation_id) VALUES (?,?,?)',[person.id,insert.bionic,insert.id]),callback);
                        },
                        function(callback) {
                            if(insert.attribute[0] !== undefined) {
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
                        },
                        function(callback) {
                            if(insert.wpn !== undefined) {
                                var weapon = insert.wpn.weapon_id;

                                pool.query(mysql.format('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)',[person.id,weapon]),callback);
                            } else { callback(); }
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback('wrong secret'); }
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        })
    });
};