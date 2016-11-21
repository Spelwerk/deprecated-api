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
        'LEFT JOIN comment ON comment.id = article_has_comment.comment_id ' +
        'LEFT JOIN user ON user.id = comment.user_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'article_has_comment.article_id = ? AND comment.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "article_id": req.params.id1,
            "comment_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};