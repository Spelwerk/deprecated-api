var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_world.user_id, ' +
        'user_has_world.world_id, ' +
        'user_has_world.hash AS world_hash, ' +
        'world.name AS world_name, ' +
        'world.created, ' +
        'world.deleted, ' +
        'world.updated ' +
        'FROM user_has_world ' +
        'LEFT JOIN world ON world.id = user_has_world.world_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, path, ["user_id","world_id"]);
};