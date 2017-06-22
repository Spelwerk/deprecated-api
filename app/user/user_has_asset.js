var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_asset ' +
        'LEFT JOIN asset ON asset.id = user_has_asset.asset_id';

    router.get(path + '/id/:id/asset', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_asset.user_id = ? AND ' +
            'asset.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/asset', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'asset', req.body.insert_id);
    });

    router.delete(path + '/id/:id/asset/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'asset', req.params.id2);
    });
};