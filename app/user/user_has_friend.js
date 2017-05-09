var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'user_has_friend.user_id, ' +
        'user_has_friend.friend_id, ' +
        'user.displayname, ' +
        'FROM user_has_friend ' +
        'LEFT JOIN user ON user.id = user_has_friend.friend_id';

    router.get(path + '/id/:id/friend', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_friend.user_id = ? AND ' +
            'user.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/friend', function(req, res, next) {
        req.relation.name = 'friend';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/friend/:id2', function(req, res, next) {
        req.relation.name = 'friend';

        rest.userRelationDelete(req, res, next);
    });
};