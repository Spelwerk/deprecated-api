var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM background_has_asset';

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'background_has_asset.background_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/asset', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'background', req.params.id, 'asset', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/asset/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'background', req.params.id, 'asset', req.params.id2);
    });
};