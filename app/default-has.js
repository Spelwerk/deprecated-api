var rest = require('./rest');

module.exports = function(pool, router, table, path, deleteArray) {
    path = path || '/' + table;

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.post(path, function(req, res) {
        rest.OLD_INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id/id/:id2', function(req, res) {
        var call = 'DELETE FROM ' + table + ' ' +
            'WHERE ' + deleteArray[0] + ' = ? ' +
            'AND ' + deleteArray[1] + ' = ?';

        rest.query(pool, call, [req.params.id, req.params.id2], function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(202).send();
            }
        });
    });
};