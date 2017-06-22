var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = user_has_milestone.milestone_id';

    router.get(path + '/id/:id/milestone', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_milestone.user_id = ? AND ' +
            'milestone.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/milestone', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'milestone', req.body.insert_id);
    });

    router.delete(path + '/id/:id/milestone/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'milestone', req.params.id2);
    });
};