var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'imperfection.id, ' +
        'imperfection.canon, ' +
        'imperfection.name, ' +
        'imperfection.description, ' +
        'person_has_imperfection.custom ' +
        'FROM person_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = person_has_imperfection.imperfection_id';

    router.get(path + '/id/:id/imperfection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_imperfection.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/imperfection', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.personAuth(person, callback);
            },
            function(callback) {
                rest.query('INSERT INTO person_has_imperfection (person_id,imperfection_id) VALUES (?,?)', [person.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/imperfection/:id2', function(req, res, next) {
        req.table.name = 'imperfection';
        req.table.admin = false;
        req.table.user = true;

        rest.personCustomDescription(req, res, next);
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res, next) {
        req.table.name = 'imperfection';
        req.table.admin = false;
        req.table.user = true;

        rest.personDeleteRelation(req, res, next);
    });
};