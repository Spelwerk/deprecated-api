var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_protection ' +
        'LEFT JOIN protection ON protection.id = world_has_protection.protection_id';

    router.get(path + '/id/:id/protection', function(req, res) {
        var call = query + ' WHERE ' +
            'protection.canon = 1 AND ' +
            'world_has_protection.world_id = ? AND ' +
            'protection.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/protection', function(req, res) {
        rest.relationPost(req, res, 'world', 'protection');
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res) {
        rest.relationDelete(req, res, 'world', 'protection');
    });
};