var async = require('async'),
    rest = require('./../rest');

function unequip(personId, protectionId, callback) {
    var person = {},
        protection = {};

    person.id = personId;
    protection.id = protectionId;
    protection.equip = 0;

    async.series([
        function(callback) {
            rest.query('UPDATE person_has_protection SET equipped = ? WHERE person_id = ? AND protection_id = ?', [protection.equip, person.id, protection.id], callback);
        },

        // ATTRIBUTE

        function(callback) {
            rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                person.attribute = result;

                callback(err);
            });
        },
        function(callback) {
            rest.query('SELECT attribute_id AS id, value FROM protection_has_attribute WHERE protection_id = ?', [protection.id], function(err, result) {
                protection.attribute = result;

                callback(err);
            });
        },
        function(callback) {
            rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, null, protection.attribute, callback);
        }
    ],function (err) {
        callback(err);
    });
}

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.canon, ' +
        'protection.popularity, ' +
        'protection.name, ' +
        'protection.description, ' +
        'protection.price, ' +
        'protection.bodypart_id, ' +
        'protection.icon, ' +
        'person_has_protection.protectionquality_id AS quality_id, ' +
        'protectionquality.price AS quality_price, ' +
        'protectionquality.bonus, ' +
        'person_has_protection.equipped, ' +
        'person_has_protection.custom ' +
        'FROM person_has_protection ' +
        'LEFT JOIN protection ON protection.id = person_has_protection.protection_id ' +
        'LEFT JOIN protectionquality ON protectionquality.id = person_has_protection.protectionquality_id';

    router.get(path + '/id/:id/protection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/protection/equipped/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ? AND ' +
            'person_has_protection.equipped = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/protection', function(req, res, next) {
        rest.relationPost(req, res, next, 'person', req.params.id, 'protection', req.body.insert_id);
    });

    router.put(path + '/id/:id/protection/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'protection', req.params.id2, req.body.custom);
    });

    router.put(path + '/id/:id/protection/:protection/equip', function(req, res, next) {
        var person = {},
            protection = {};

        protection.equip = 1;

        person.id = req.params.id;
        protection.id = req.params.protection;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', person.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_protection SET equipped = ? WHERE person_id = ? AND protection_id = ?', [protection.equip, person.id, protection.id], callback);
            },

            // ATTRIBUTE

            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM protection_has_attribute WHERE protection_id = ?', [protection.id], function(err, result) {
                    protection.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, protection.attribute, null, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/protection/:protection/unequip', function(req, res, next) {
        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                unequip(req.params.id, req.params.protection, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id/protection/:protection', function(req, res, next) {
        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                unequip(req.params.id, req.params.protection, callback);
            }
        ],function(err) {
            if(err) return next(err);

            rest.relationDelete(req, res, next, 'person', req.params.id, 'protection', req.params.protection);
        });
    });
};