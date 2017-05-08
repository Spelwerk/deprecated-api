var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'imperfection.id, ' +
        'imperfection.canon, ' +
        'imperfection.name, ' +
        'imperfection.description, ' +
        'person_has_imperfection.custom ' +
        'FROM person_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = person_has_imperfection.imperfection_id';

    router.get(path + '/id/:id/imperfection', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_imperfection.person_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/imperfection', function(req, res) {
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
                rest.query(pool, 'INSERT INTO person_has_imperfection (person_id,imperfection_id) VALUES (?,?)', [person.id, insert.id], callback);
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

    router.put(path + '/id/:id/imperfection/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'imperfection');
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'imperfection');
    });
};