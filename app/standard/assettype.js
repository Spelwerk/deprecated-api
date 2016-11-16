var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'assettype.id, ' +
        'assettype.name, ' +
        'assettype.assetgroup_id, ' +
        'assetgroup.name AS assetgroup_name, ' +
        'assettype.icon_id, ' +
        'icon.path AS icon_path, ' +
        'assettype.created, ' +
        'assettype.deleted ' +
        'FROM assettype ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id ' +
        'LEFT JOIN icon ON icon.id = assettype.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/group/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.assetgroup_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};