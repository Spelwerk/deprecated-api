var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_assetgroup ' +
        'LEFT JOIN assetgroup ON assetgroup.id = user_has_assetgroup.assetgroup_id';

    router.get(path + '/id/:id/assetgroup', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_assetgroup.user_id = ? AND ' +
            'assetgroup.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/assetgroup', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'assetgroup', req.body.insert_id);
    });

    router.delete(path + '/id/:id/assetgroup/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'assetgroup', req.params.id2);
    });
};