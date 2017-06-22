var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_assettype ' +
        'LEFT JOIN assettype ON assettype.id = user_has_assettype.assettype_id';

    router.get(path + '/id/:id/assettype', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_assettype.user_id = ? AND ' +
            'assettype.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/assettype', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'assettype', req.body.insert_id);
    });

    router.delete(path + '/id/:id/assettype/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'assettype', req.params.id2);
    });
};