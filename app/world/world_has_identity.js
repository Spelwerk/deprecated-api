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

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_identity.world_id = ? AND ' +
            'identity.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","identity_id"]);
};