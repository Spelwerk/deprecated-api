var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_doctrine ' +
        'LEFT JOIN doctrine ON doctrine.id = user_has_doctrine.doctrine_id';

    router.get(path + '/id/:id/doctrine', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_doctrine.user_id = ? AND ' +
            'doctrine.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/doctrine', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'doctrine', req.body.insert_id);
    });

    router.delete(path + '/id/:id/doctrine/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'doctrine', req.params.id2);
    });
};