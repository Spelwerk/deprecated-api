var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM asset ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id';

    var allowedPost = ['name', 'description', 'price', 'legal', 'assettype_id'];

    var allowedPut = ['name', 'description', 'price', 'legal', 'assettype_id'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'asset.canon = 1 AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'asset.canon = 1 AND ' +
            'asset.assettype_id = ? AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};