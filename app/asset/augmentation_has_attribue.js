var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM augmentation_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = augmentation_has_attribute.attribute_id';

    router.get(path + '/id/:id/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'augmentation_has_attribute.augmentation_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"attribute_id": "ASC"});
    });

    router.post(path + '/id/:id/attribute', function(req, res) {
        rest.relationPostWithValue(pool, req, res, 'augmentation', 'attribute');
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'augmentation', 'attribute');
    });
};