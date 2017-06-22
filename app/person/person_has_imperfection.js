var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM person_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = person_has_imperfection.imperfection_id';

    router.get(path + '/id/:id/imperfection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_imperfection.person_id = ?';

        rest.GET(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/imperfection', function(req, res, next) {
        rest.relationPost(req, res, next, 'person', req.params.id, 'imperfection', req.body.insert_id);
    });

    router.put(path + '/id/:id/imperfection/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'imperfection', req.params.id2, req.body.custom);
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'person', req.params.id, 'imperfection', req.params.id2);
    });
};