var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT bionic.id FROM user_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = user_has_bionic.bionic_id';

    router.get(path + '/id/:id/bionic', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_bionic.user_id = ? AND ' +
            'bionic.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/bionic', function(req, res, next) {
        req.relation.name = 'bionic';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/bionic/:id2', function(req, res, next) {
        req.relation.name = 'bionic';

        rest.userRelationDelete(req, res, next);
    });
};