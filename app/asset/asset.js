var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM asset';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'asset.canon = 1 AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/type/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'asset.canon = 1 AND ' +
            'asset.assettype_id = ? AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};