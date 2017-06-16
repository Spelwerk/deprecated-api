var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM milestone_has_asset ' +
        'LEFT JOIN asset ON asset.id = milestone_has_asset.asset_id';

    router.get(path + '/id/:id/asset', function(req, res, next) {
        var call = query + ' WHERE ' +
            'milestone_has_asset.milestone_id = ? AND ' +
            'asset.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/asset', function(req, res, next) {
        rest.relationPost(req, res, next, 'milestone', req.params.id, 'asset', req.body.insert_id);
    });

    router.delete(path + '/id/:id/asset/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'milestone', req.params.id, 'asset', req.params.id2);
    });
};