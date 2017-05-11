var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT expertise.id FROM user_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = user_has_expertise.expertise_id';

    router.get(path + '/id/:id/expertise', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_expertise.user_id = ? AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/expertise', function(req, res, next) {
        req.relation.name = 'expertise';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/expertise/:id2', function(req, res, next) {
        req.relation.name = 'expertise';

        rest.userRelationDelete(req, res, next);
    });
};