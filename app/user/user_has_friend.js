var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_friend.user_id, ' +
        'user_has_friend.friend_id, ' +
        'user.displayname, ' +
        'FROM user_has_friend ' +
        'LEFT JOIN user ON user.id = user_has_friend.friend_id';

    router.get(path + '/id/:id/friend', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_friend.user_id = ? AND ' +
            'user.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/friend', function(req, res) {
        rest.userRelationPost(req, res, 'story');
    });

    router.delete(path + '/id/:id/friend/:id2', function(req, res) {
        rest.userRelationDelete(req, res, 'story');
    });
};