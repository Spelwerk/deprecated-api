var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'article.id, ' +
        'article.title, ' +
        'article.abstract, ' +
        'article.content, ' +
        'article.articletype_id, ' +
        'articletype.name AS articletype_name, ' +
        'article.user_id, ' +
        'user.username AS user_username, ' +
        'article.created ' +
        'FROM article ' +
        'LEFT JOIN articletype ON articletype.id = article.articletype_id ' +
        'LEFT JOIN user ON user.id = article.user_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        var call = query + ' WHERE article.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'article.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'article.articletype_id = ? ' +
            'AND article.deleted is null';

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