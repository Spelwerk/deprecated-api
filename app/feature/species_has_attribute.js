var rest = require('./../rest');

module.exports = function(router, path) {
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

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species_has_attribute.species_id = ?';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'species', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'species', req.params.id, 'attribute', req.params.id2);
    });
};