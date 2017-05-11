var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT imperfection.id FROM user_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = user_has_imperfection.imperfection_id';

    router.get(path + '/id/:id/imperfection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_imperfection.user_id = ? AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/imperfection', function(req, res, next) {
        req.relation.name = 'imperfection';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res, next) {
        req.relation.name = 'imperfection';

        rest.userRelationDelete(req, res, next);
    });
};