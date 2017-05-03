var async = require('async'),
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'milestone.id, ' +
        'milestone.canon, ' +
        'milestone.name, ' +
        'milestone.description, ' +
        'milestone.background_id, ' +
        'milestone.attribute_id, ' +
        'milestone.attribute_value, ' +
        'milestone.loyalty_id, ' +
        'milestone.loyalty_occupation, ' +
        'person_has_milestone.custom ' +
        'FROM person_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = person_has_milestone.milestone_id';

    router.get(path + '/id/:id/milestone', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_milestone.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/milestone', function(req, res) {
        var person = {},
            insert = {},
            current = {};

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
                rest.query(pool, 'SELECT attribute_id, attribute_value AS value FROM milestone WHERE id = ?', [insert.id], function(err, result) {
                    insert.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_milestone (person_id,milestone_id) VALUES (?,?)', [person.id, insert.id], callback);
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

    router.put(path + '/id/:id/milestone/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'milestone');
    });

    router.delete(path + '/id/:id/milestone/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'milestone');
    });
};