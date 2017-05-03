var async = require('async'),
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.canon, ' +
        'protection.name, ' +
        'protection.description, ' +
        'protection.price, ' +
        'protection.bodypart_id, ' +
        'protection.icon, ' +
        'person_has_protection.protectionquality_id AS quality_id, ' +
        'protectionquality.bonus, ' +
        'person_has_protection.equipped, ' +
        'person_has_protection.custom ' +
        'FROM person_has_protection ' +
        'LEFT JOIN protection ON protection.id = person_has_protection.protection_id ' +
        'LEFT JOIN protectionquality ON protectionquality.id = person_has_protection.protectionquality_id';

    router.get(path + '/id/:id/protection', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/protection/equipped/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ? AND ' +
            'person_has_protection.equipped = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/protection', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_protection (person_id,protection_id) VALUES (?,?)', [person.id, insert.id], callback);
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/protection/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'protection');
    });

    router.put(path + '/id/:id/protection/:id2/equip/:equip', function(req, res) {
        rest.personEquip(req, res, 'protection');
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'protection');
    });
};