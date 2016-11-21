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
        'nature.icon_id, ' +
        'icon.path AS icon_path, ' +
        'nature.created, ' +
        'nature.deleted ' +
        'FROM world_has_nature ' +
        'LEFT JOIN nature ON nature.id = world_has_nature.nature_id ' +
        'LEFT JOIN attribute ON attribute.id = nature.attribute_id ' +
        'LEFT JOIN icon ON icon.id = nature.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_nature.world_id = ? AND ' +
            'nature.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "world_id": req.params.id1,
            "nature_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};