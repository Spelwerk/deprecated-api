var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM focus';

    var allowedPost = ['name', 'description', 'icon', 'attribute_id', 'attribute_value', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'icon', 'attribute_id', 'attribute_value'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'manifestation_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};