var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_permission.user_id, ' +
        'user_has_permission.permission_id, ' +
        'permission.name AS permission_name, ' +
        'permission.description AS permission_description, ' +
        'permission.created, ' +
        'permission.deleted ' +
        'FROM user_has_permission ' +
        'LEFT JOIN permission ON permission.id = user_has_permission.permission_id';

    require('../default-has')(pool, router, table, path, ["user_id","permission_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_permission.user_id = ? AND ' +
            'permission.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};