var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.canon, ' +
        'protection.name, ' +
        'protection.description, ' +
        'person_has_protection.protection_custom, ' +
        'protection.price, ' +
        'protection.protectiontype_id, ' +
        'protectiontype.name AS protectiontype_name, ' +
        'protectiontype.attribute_id, ' +
        'attribute.name AS attribute_name,' +
        'protection.attribute_value, ' +
        'protection.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'person_has_protection.protectionquality_id AS quality_id, ' +
        'protectionquality.name AS quality_name, ' +
        'protectionquality.price AS quality_price, ' +
        'protectionquality.attribute_value AS quality_attribute_value, ' +
        'person_has_protection.equipped, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_protection ' +
        'LEFT JOIN protection ON protection.id = person_has_protection.protection_id ' +
        'LEFT JOIN protectiontype ON protectiontype.id = protection.protectiontype_id ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id ' +
        'LEFT JOIN bodypart ON bodypart.id = protection.bodypart_id ' +
        'LEFT JOIN protectionquality ON protectionquality.id = person_has_protection.protectionquality_id ' +
        'LEFT JOIN icon ON icon.id = protection.icon_id';

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

        insert.id = req.body.protection_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_protection (person_id,protection_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/protection/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'protection');
    });

    router.put(path + '/id/:id/protection/:id2/equip/:equip', function(req, res) {
        rest.personEquip(req, res, 'protection');
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'protection');
    });
};