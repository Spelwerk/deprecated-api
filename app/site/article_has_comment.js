var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'comment.id, ' +
        'comment.content, ' +
        'comment.user_id, ' +
        'user.username AS user_username, ' +
        'comment.created ' +
        'FROM article_has_comment ' +
        'LEFT JOIN user ON user.id = comment.user_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'article_has_comment.article_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "article_id": req.params.id1,
            "comment_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};