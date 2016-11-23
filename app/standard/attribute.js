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
        'attribute.species_id, ' +
        'species.name AS species_name, ' +
        'attribute.icon_id, ' +
        'icon.path AS icon_path, ' +
        'attribute.created, ' +
        'attribute.deleted,' +
        'attribute.updated ' +
        'FROM attribute ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN species ON species.id = attribute.species_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id1/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute.attributetype_id = ? AND ' +
            '(attribute.species_id = ? OR attribute.species_id is NULL) AND ' +
            'attribute.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });
};