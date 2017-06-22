var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = user_has_manifestation.manifestation_id';

    router.get(path + '/id/:id/manifestation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_manifestation.user_id = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/manifestation', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'manifestation', req.body.insert_id);
    });

    router.delete(path + '/id/:id/manifestation/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'manifestation', req.params.id2);
    });
};