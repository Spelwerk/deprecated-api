var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT world.id FROM user_has_world ' +
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
            'world.calculated = 1 AND ' +
            'world.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/world', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'world', req.body.insert_id);
    });

    router.delete(path + '/id/:id/world/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'world', req.params.id2);
    });
};