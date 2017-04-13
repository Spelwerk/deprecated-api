var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM ' + table;

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"id":"ASC"});
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        var call = 'DELETE FROM person_is_creation ' +
            'WHERE id = \'' + req.params.id + '\' ';

        rest.queryMessage(pool, res, call, 202, 'deleted');
    });
};