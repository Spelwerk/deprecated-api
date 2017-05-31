var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM protection_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = protection_has_attribute.attribute_id';

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'protection_has_attribute.protection_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'protection', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'protection', req.params.id, 'attribute', req.params.id2);
    });
};