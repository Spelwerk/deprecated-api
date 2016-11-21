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
        'identity.icon_id, ' +
        'icon.path AS icon_path, ' +
        'identity.created, ' +
        'identity.deleted ' +
        'FROM world_has_identity ' +
        'LEFT JOIN identity ON identity.id = world_has_identity.identity_id ' +
        'LEFT JOIN attribute ON attribute.id = identity.attribute_id ' +
        'LEFT JOIN icon ON icon.id = identity.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_identity.world_id = ? AND ' +
            'identity.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "world_id": req.params.id1,
            "identity_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};