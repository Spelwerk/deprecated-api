var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_world.user_id, ' +
        'user_has_world.world_id, ' +
        'user_has_world.owner, ' +
        'world.name AS world_name, ' +
        'world.created, ' +
        'world.deleted, ' +
        'world.updated ' +
        'FROM user_has_world ' +
        'LEFT JOIN world ON world.id = user_has_world.world_id';

    router.get(path + '/id/:id/world', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/world/calculated', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.calculated = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.post(path + '/id/:id/world', function(req, res) {
        rest.userRelationPost(pool, req, res, 'world');
    });

    router.delete(path + '/id/:id/world/:id2', function(req, res) {
        rest.userRelationDelete(pool, req, res, 'world');
    });
};