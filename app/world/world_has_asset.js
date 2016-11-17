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
        'assettype.icon_id, ' +
        'icon.path AS icon_path, ' +
        'asset.created, ' +
        'asset.deleted ' +
        'FROM world_has_asset ' +
        'LEFT JOIN asset ON asset.id = world_has_asset.asset_id ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id ' +
        'LEFT JOIN icon ON icon.id = assettype.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_asset.world_id = ? AND ' +
            'asset.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_asset.world_id = ? AND ' +
            'asset.assettype_id = ? AND ' +
            'asset.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "world_id": req.params.id1,
            "asset_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};