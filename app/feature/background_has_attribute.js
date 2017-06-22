var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM background_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = background_has_attribute.attribute_id';

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'background_has_attribute.background_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'background', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.put(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPutValue(req, res, next, 'background', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'background', req.params.id, 'attribute', req.params.id2);
    });
};