var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id AS species_id, ' +
        'species.name AS species_name, ' +
        'attribute.id AS attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'species_has_attribute.value ' +
        'FROM species_has_attribute ' +
        'LEFT JOIN species ON species.id = species_has_attribute.species_id ' +
        'LEFT JOIN attribute ON attribute.id = species_has_attribute.attribute_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE species_has_attribute.species_id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, path, ["species_id","attribute_id"]);
};