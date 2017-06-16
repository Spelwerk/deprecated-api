var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_protection ' +
        'LEFT JOIN protection ON protection.id = world_has_protection.protection_id';

    router.get(path + '/id/:id/protection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_protection.world_id = ? AND ' +
            'protection.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/protection', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'protection', req.body.insert_id);
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'protection', req.params.id2);
    });
};