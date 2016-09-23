var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'articletype.id, ' +
        'articletype.name, ' +
        'articletype.description, ' +
        'articletype.user_id, ' +
        'user.username AS user_username, ' +
        'articletype.created ' +
        'FROM articletype ' +
        'LEFT JOIN user ON user.id = articletype.user_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'articletype.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table, req.body);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table, req.body, 'id');
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, 'id');
    });
};