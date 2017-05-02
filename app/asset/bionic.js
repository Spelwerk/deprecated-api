var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM bionic';

    var allowedPost = ['name', 'description', 'price', 'energy', 'legal', 'bodypart_id', 'attribute_id', 'attribute_value', 'icon'];

    var allowedPut = ['name', 'description', 'price', 'energy', 'legal', 'bodypart_id', 'attribute_id', 'attribute_value', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/bodypart/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'bodypart_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    // Augmentation

    require('./bionic_has_augmentation')(pool, router, table, path);
};