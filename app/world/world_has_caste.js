var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'caste.id, ' +
        'caste.name, ' +
        'caste.description, ' +
        'caste.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'caste.attribute_value AS attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_caste ' +
        'LEFT JOIN caste ON caste.id = world_has_caste.caste_id ' +
        'LEFT JOIN attribute ON attribute.id = caste.attribute_id ' +
        'LEFT JOIN icon ON icon.id = caste.icon_id';

    require('../default-has')(pool, router, table, path, ["world_id","caste_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_caste.world_id = ? AND ' +
            'caste.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};