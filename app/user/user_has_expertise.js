var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = user_has_expertise.expertise_id';

    router.get(path + '/id/:id/expertise', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_expertise.user_id = ? AND ' +
            'expertise.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/expertise', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'expertise', req.body.insert_id);
    });

    router.delete(path + '/id/:id/expertise/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'expertise', req.params.id2);
    });
};