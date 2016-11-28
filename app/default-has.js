var rest = require('./rest');

module.exports = function(pool, router, table, path, deleteArray) {
    path = path || '/' + table;

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = 'DELETE FROM ' + table + ' ' +
            'WHERE ' + deleteArray[0] + ' = \'' + req.params.id1 + '\' ' +
            'AND ' + deleteArray[1] + ' = \'' + req.params.id2 + '\'';

        rest.queryMessage(pool, res, call, 202, 'deleted');
    });
};