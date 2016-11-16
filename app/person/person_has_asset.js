var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'asset.id, ' +
        'asset.name, ' +
        'person_has_asset.amount, ' +
        'asset.description, ' +
        'asset.price, ' +
        'asset.legal, ' +
        'asset.assettype_id, ' +
        'assettype.name AS assettype_name, ' +
        'assettype.assetgroup_id, ' +
        'assetgroup.name AS assetgroup_name, ' +
        'person_has_asset.equipped ' +
        'FROM person_has_asset ' +
        'LEFT JOIN asset ON asset.id = person_has_asset.asset_id ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_asset.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "person_id": req.params.id1,
            "asset_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};