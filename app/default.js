var rest = require('./rest');

module.exports = function(router, table, path, query) {
    path = path || '/' + table;

    query = query || 'SELECT * FROM ' + table;

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';

        rest.QUERY(req, res, call);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, call, null, {"id": "ASC"});
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(req, res, query, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(req, res, table, null, true);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(req, res, table, null, true);
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(req, res, table, true);
    });
};