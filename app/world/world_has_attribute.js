var mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.icon, ' +
        'attribute.attributetype_id, ' +
        'attributetype.maximum ' +
        'world_has_attribute.value, ' +
        'FROM world_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id';

    router.get(path + '/id/:id/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/attribute/value/:id2', function(req, res) {
        var call = 'SELECT value FROM world_has_attribute WHERE ' +
            'world_id = ? AND ' +
            'attribute_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2],{"attribute_id":"ASC"});
    });

    router.get(path + '/id/:id/attribute/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/attribute', function(req, res) {
        rest.relationPostWithValue(pool, req, res, 'world', 'attribute');
    });

    router.put(path + '/id/:id/attribute', function(req, res) {
        rest.relationPutValue(pool, req, res, 'world', 'attribute');
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'attribute');
    });
};