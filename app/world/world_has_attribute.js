var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.name, ' +
        'world_has_attribute.default, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attributetype.maximum, ' +
        'attribute.species_id, ' +
        'species.name AS species_name, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN species ON species.id = attribute.species_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    router.get(path + '/id/:id1/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            '(attribute.species_id = ? OR attribute.species_id IS NULL) AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    router.get(path + '/id/:id1/type/:id2/species/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            '(attribute.species_id = ? OR attribute.species_id IS NULL) AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","attribute_id"]);
};