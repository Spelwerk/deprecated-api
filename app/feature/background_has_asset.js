var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM background_has_asset';

    require('../default-has')(pool, router, table, path, ["background_id","asset_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'background_has_asset.background_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"asset_id": "ASC"});
    });
};