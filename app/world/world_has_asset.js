var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'asset.id, ' +
        'asset.name, ' +
        'asset.description, ' +
        'asset.price, ' +
        'asset.legal, ' +
        'asset.assettype_id, ' +
        'assettype.name AS assettype_name, ' +
        'assettype.assetgroup_id, ' +
        'assetgroup.name AS assetgroup_name, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_asset ' +
        'LEFT JOIN asset ON asset.id = world_has_asset.asset_id ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id ' +
        'LEFT JOIN icon ON icon.id = assettype.icon_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_asset.world_id = ? AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_asset.world_id = ? AND ' +
            'asset.assettype_id = ? AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    require('../default-has')(pool, router, table, path, ["world_id","asset_id"]);
};