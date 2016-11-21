var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attributetype.maximum, ' +
        'attribute.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'attribute.icon_id, ' +
        'icon.path AS icon_path, ' +
        'attribute.created, ' +
        'attribute.deleted ' +
        'FROM world_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN manifestation ON manifestation.id = attribute.manifestation_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.manifestation_id = ? AND ' +
            'attribute.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "world_id": req.params.id1,
            "attribute_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};