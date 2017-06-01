var mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id';

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/attribute/value/:id2', function(req, res, next) {
        var call = 'SELECT value FROM world_has_attribute WHERE ' +
            'world_id = ? AND ' +
            'attribute_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/attribute/type/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'world', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.put(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPutValue(req, res, next, 'world', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'attribute', req.params.id2);
    });
};