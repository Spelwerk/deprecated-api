var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'gift.id, ' +
        'gift.canon, ' +
        'gift.name, ' +
        'gift.description, ' +
        'gift.attribute_id, ' +
        'gift.attribute_value, ' +
        'person_has_gift.custom ' +
        'FROM person_has_gift ' +
        'LEFT JOIN gift ON gift.id = person_has_gift.gift_id';

    router.get(path + '/id/:id/gift', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_gift.person_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/gift', function(req, res) {
        var person = {},
            current = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT attribute_id, attribute_value AS value FROM gift WHERE id = ?', [insert.id], function(err, result) {
                    insert.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_gift (person_id,gift_id) VALUES (?,?)', [person.id, insert.id], callback);
            },
            function(callback) {
                rest.personInsertAttribute(pool, person, insert, current, callback);
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

    router.put(path + '/id/:id/gift/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'gift');
    });

    router.delete(path + '/id/:id/gift/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'gift');
    });
};