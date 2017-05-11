var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT focus.id FROM user_has_focus ' +
        'LEFT JOIN focus ON focus.id = user_has_focus.focus_id';

    router.get(path + '/id/:id/focus', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_focus.user_id = ? AND ' +
            'focus.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/focus', function(req, res, next) {
        req.relation.name = 'focus';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/focus/:id2', function(req, res, next) {
        req.relation.name = 'focus';

        rest.userRelationDelete(req, res, next);
    });
};