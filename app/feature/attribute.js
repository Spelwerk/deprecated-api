var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.attributetype_id, ' +
        'attributetype.maximum, ' +
        'attribute.icon, ' +
        'attribute.created, ' +
        'attribute.deleted,' +
        'attribute.updated ' +
        'FROM attribute ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id';

    var allowedPost = ['name', 'description', 'attributetype_id', 'icon'];

    var allowedPut = ['name', 'description', 'attributetype_id', 'icon'];

    var allowsUser = false;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};