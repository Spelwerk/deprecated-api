var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM asset_has_doctrine ' +
        'LEFT JOIN doctrine ON doctrine.id = asset_has_doctrine.doctrine_id';

    router.get(path + '/id/:id/doctrine', function(req, res, next) {
        var call = query + ' WHERE ' +
            'asset_has_doctrine.asset_id = ?';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/doctrine', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'asset', req.params.id, 'doctrine', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/doctrine/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'asset', req.params.id, 'doctrine', req.params.id2);
    });
};