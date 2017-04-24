var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'nature.id, ' +
        'nature.name, ' +
        'nature.description, ' +
        'nature.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'nature.attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_nature ' +
        'LEFT JOIN nature ON nature.id = world_has_nature.nature_id ' +
        'LEFT JOIN attribute ON attribute.id = nature.attribute_id ' +
        'LEFT JOIN icon ON icon.id = nature.icon_id';

    router.get(path + '/id/:id/nature', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_nature.world_id = ? AND ' +
            'nature.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/nature', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'nature');
    });

    router.delete(path + '/id/:id/nature/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'nature');
    });
};