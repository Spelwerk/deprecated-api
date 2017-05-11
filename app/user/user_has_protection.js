var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT protection.id FROM user_has_protection ' +
        'LEFT JOIN protection ON protection.id = user_has_protection.protection_id';

    router.get(path + '/id/:id/protection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_protection.user_id = ? AND ' +
            'protection.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/protection', function(req, res, next) {
        req.relation.name = 'protection';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res, next) {
        req.relation.name = 'protection';

        rest.userRelationDelete(req, res, next);
    });
};