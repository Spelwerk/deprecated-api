var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM asset_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = asset_has_attribute.attribute_id';

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'asset_has_attribute.asset_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'asset', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'asset', req.params.id, 'attribute', req.params.id2);
    });
};