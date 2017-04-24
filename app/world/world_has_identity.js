var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'identity.id, ' +
        'identity.name, ' +
        'identity.description, ' +
        'identity.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'identity.attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_identity ' +
        'LEFT JOIN identity ON identity.id = world_has_identity.identity_id ' +
        'LEFT JOIN attribute ON attribute.id = identity.attribute_id ' +
        'LEFT JOIN icon ON icon.id = identity.icon_id';

    router.get(path + '/id/:id/identity', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_identity.world_id = ? AND ' +
            'identity.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/identity', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'identity');
    });

    router.delete(path + '/id/:id/identity/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'identity');
    });
};