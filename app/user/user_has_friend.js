var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_friend.user_id, ' +
        'user_has_friend.friend_id, ' +
        'user.displayname AS friend_displayname, ' +
        'user.firstname AS friend_firstname, ' +
        'user.surname AS friend_surname ' +
        'FROM user_has_friend ' +
        'LEFT JOIN user ON user.id = user_has_friend.friend_id';

    require('../default-has')(pool, router, table, path, ["user_id","friend_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_friend.user_id = ? AND ' +
            'user.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};