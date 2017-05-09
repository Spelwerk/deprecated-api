var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'user_has_world.user_id, ' +
        'user_has_world.world_id, ' +
        'user_has_world.owner, ' +
        'world.name AS world_name ' +
        'FROM user_has_world ' +
        'LEFT JOIN world ON world.id = user_has_world.world_id';

    router.get(path + '/id/:id/world', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/world/calculated', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_world.user_id = ? AND ' +
            'world.calculated = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, 1]);
    });

    router.post(path + '/id/:id/world', function(req, res, next) {
        req.relation.name = 'world';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/world/:id2', function(req, res, next) {
        req.relation.name = 'world';

        rest.userRelationDelete(req, res, next);
    });
};