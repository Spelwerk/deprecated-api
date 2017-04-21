var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM ' + table;

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"id":"ASC"});
    });
};