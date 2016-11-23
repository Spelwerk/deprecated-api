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
        'asset.deleted, ' +
        'asset.updated ' +
        'FROM asset ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id ' +
        'LEFT JOIN icon ON icon.id = assettype.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.assettype_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};