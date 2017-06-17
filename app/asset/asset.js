var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT ' +
        'asset.id, ' +
        'asset.canon, ' +
        'asset.popularity, ' +
        'asset.name, ' +
        'asset.description, ' +
        'asset.price, ' +
        'asset.legal, ' +
        'asset.assettype_id, ' +
        'assettype.name AS assettype_name, ' +
        'assettype.icon, ' +
        'assettype.assetgroup_id, ' +
        'assetgroup.name ' +
        'FROM asset ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id';

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

    require('./asset_has_attribute')(router, path);

    require('./asset_has_doctrine')(router, path);

    require('./asset_has_expertise')(router, path);

    require('./asset_has_skill')(router, path);
};