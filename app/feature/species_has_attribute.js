var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.attributetype_id, ' +
        'attributetype.maximum, ' +
        'species_has_attribute.value, ' +
        'attribute.icon ' +
        'FROM species_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = species_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id';

    router.get(path + '/id/:id/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'species_has_attribute.species_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"attribute_id": "ASC"});
    });

    router.post(path + '/id/:id/attribute', function(req, res) {
        rest.relationPostWithValue(req, res, 'species', 'attribute');
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res) {
        rest.relationDelete(req, res, 'species', 'attribute');
    });
};