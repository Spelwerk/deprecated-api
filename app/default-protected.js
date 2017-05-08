var rest = require('./rest'),
    tokens = require('./tokens');

module.exports = function(router, table, path, query, allowedKeysPost, allowedKeysPut, adminOnly) {
    path = path || '/' + table;
    adminOnly = adminOnly || true;

    router.get(path + '/all', function(req, res) {
        rest.QUERY(req, res, query, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query;

        var array = [];

        if(!adminOnly) {
            call = query + ' ' +
                'LEFT JOIN user_has_' + table + ' ON (user_has_' + table + '.' + table + '_id = ' + table + '.id AND user_has_' + table + '.owner = 1 AND user_has_' + table + '.user_id = ?) ' +
                'WHERE ' + table + '.id = ?';

            var token = tokens.decode(req),
                userId = token ? token.sub.id : 0;

            array = [userId, req.params.id];
        } else {
            array = [req.params.id];
        }

        rest.QUERY(req, res, call, array);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, call, null, {"id": "ASC"});
    });

    router.post(path, function(req, res) {
        rest.POST(req, res, table, allowedKeysPost, adminOnly);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(req, res, table, allowedKeysPut, adminOnly);
    });

    router.put(path + '/id/:id/canon', function(req, res) {
        rest.CANON(req, res, table);
    });

    router.put(path + '/id/:id/revive', function(req, res) {
        rest.REVIVE(req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(req, res, table, adminOnly);
    });
};