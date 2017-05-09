var rest = require('./rest'),
    tokens = require('./tokens');

module.exports = function(router, table, path, query, allowedKeysPost, allowedKeysPut, adminOnly) {
    path = path || '/' + table;
    adminOnly = adminOnly || true;

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query;

        var array = [];

        if(!adminOnly) {
            call = query + ' ' +
                'LEFT JOIN user_has_' + table + ' ON (user_has_' + table + '.' + table + '_id = ' + table + '.id AND user_has_' + table + '.owner = 1 AND user_has_' + table + '.user_id = ?) ' +
                'WHERE ' + table + '.id = ?';

            array = [req.user.id, req.params.id];
        } else {
            array = [req.params.id];
        }

        rest.QUERY(req, res, next, call, array);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    router.post(path, function(req, res, next) {
        rest.POST(req, res, next, table, allowedKeysPost, adminOnly);
    });

    router.put(path + '/id/:id', function(req, res, next) {
        rest.PUT(req, res, next, table, allowedKeysPut, adminOnly);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        rest.CANON(req, res, next, table);
    });

    router.put(path + '/id/:id/revive', function(req, res, next) {
        rest.REVIVE(req, res, next, table);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        rest.DELETE(req, res, next, table, adminOnly);
    });
};