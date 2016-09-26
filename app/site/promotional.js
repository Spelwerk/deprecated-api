var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'promotional.id, ' +
        'promotional.title, ' +
        'promotional.content, ' +
        'promotional.start, ' +
        'promotional.end, ' +
        'promotional.user_id, ' +
        'user.username AS user_username, ' +
        'promotional.created ' +
        'FROM promotional ' +
        'LEFT JOIN user ON user.id = promotional.user_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        var call = query + ' WHERE promotional.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE promotional.id = ?';

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