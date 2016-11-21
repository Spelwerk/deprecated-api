var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attributetype.roll, ' +
        'attributetype.consumable, ' +
        'attributetype.maximum, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attribute.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'attribute.icon_id, ' +
        'icon.path AS icon_path, ' +
        'attribute.created, ' +
        'attribute.deleted ' +
        'FROM attribute ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN manifestation ON manifestation.id = attribute.manifestation_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id1/manifestation/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute.attributetype_id = ? AND ' +
            '(attribute.manifestation_id = ? OR attribute.manifestation_id is NULL) AND ' +
            'attribute.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });
};