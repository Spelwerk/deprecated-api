var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_protection ' +
        'LEFT JOIN protection ON protection.id = user_has_protection.protection_id';

    router.get(path + '/id/:id/protection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_protection.user_id = ? AND ' +
            'protection.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/protection', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'protection', req.body.insert_id);
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'protection', req.params.id2);
    });
};