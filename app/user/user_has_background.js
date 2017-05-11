var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT background.id FROM user_has_background ' +
        'LEFT JOIN background ON background.id = user_has_background.background_id';

    router.get(path + '/id/:id/background', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_background.user_id = ? AND ' +
            'background.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/background', function(req, res, next) {
        req.relation.name = 'background';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/background/:id2', function(req, res, next) {
        req.relation.name = 'background';

        rest.userRelationDelete(req, res, next);
    });
};