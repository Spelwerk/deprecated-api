var rest = require('./rest');

module.exports = function(pool, router, table, path, query) {
    path = path || '/' + table;

    query = query || 'SELECT * FROM ' + table;

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(pool, req, res, query);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });
};