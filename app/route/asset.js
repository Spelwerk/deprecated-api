var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'asset.id, ' +
        'asset.name, ' +
        'asset.description, ' +
        'asset.price, ' +
        'asset.legal, ' +
        'asset.created, ' +
        'asset.deleted, ' +
        'asset.assettype_id, ' +
        'assettype.name AS assettype_name, ' +
        'assettype.assetgroup_id, ' +
        'assetgroup.name AS assetgroup_name ' +
        'FROM asset ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE asset.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table, req.body);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table, req.body, 'id');
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, 'id');
    });
};