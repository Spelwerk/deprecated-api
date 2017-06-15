var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = user_has_bionic.bionic_id';

    router.get(path + '/id/:id/bionic', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_bionic.user_id = ? AND ' +
            'bionic.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/bionic', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'bionic', req.body.insert_id);
    });

    router.delete(path + '/id/:id/bionic/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'bionic', req.params.id2);
    });
};