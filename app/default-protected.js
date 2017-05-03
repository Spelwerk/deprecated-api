var rest = require('./rest');

module.exports = function(pool, router, table, path, query, allowedKeysPost, allowedKeysPut, adminOnly) {
    path = path || '/' + table;
    adminOnly = adminOnly || true;

    router.get(path + '/all', function(req, res) {
        rest.QUERY(pool, req, res, query, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table, allowedKeysPost, adminOnly);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table, allowedKeysPut, adminOnly);
    });

    router.put(path + '/id/:id/canon', function(req, res) {
        rest.CANON(pool, req, res, table);
    });

    router.put(path + '/id/:id/revive', function(req, res) {
        rest.REVIVE(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, adminOnly);
    });
};