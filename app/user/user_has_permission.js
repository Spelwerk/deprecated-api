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

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_permission.user_id = ? AND ' +
            'permission.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var json = {
            "user_id": req.params.id1,
            "permission_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, json);
    });
};