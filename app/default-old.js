var rest = require('./rest');

module.exports = function(router, table, path, query) {
    path = path || '/' + table;

    query = query || 'SELECT * FROM ' + table;

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, next, call, null, {"id": "ASC"});
    });

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE ' + table + '.id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path, function(req, res, next) {
        rest.POST(req, res, next, table, null, true);
    });

    router.put(path + '/id/:id', function(req, res, next) {
        rest.PUT(req, res, next, table, null, true);
    });

    router.put(path + '/revive/:id', function(req, res, next) {
        rest.REVIVE(req, res, next, table);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        rest.DELETE(req, res, next, table, true);
    });
};