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
        'person_has_asset.equipped, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_asset ' +
        'LEFT JOIN asset ON asset.id = person_has_asset.asset_id ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id ' +
        'LEFT JOIN icon ON icon.id = assettype.icon_id';

    require('../default-has')(pool, router, table, path, ["person_id","asset_id"]);

    router.get(path + '/id/:id1/equipped/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_asset.person_id = ? AND ' +
            'person_has_asset.equipped = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });
};