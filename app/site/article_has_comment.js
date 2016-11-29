var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'comment.id, ' +
        'comment.content, ' +
        'comment.user_id, ' +
        'user.username AS user_username, ' +
        'comment.created, ' +
        'comment.updated ' +
        'FROM article_has_comment ' +
        'LEFT JOIN comment ON comment.id = article_has_comment.comment_id ' +
        'LEFT JOIN user ON user.id = comment.user_id';

    require('../default-has')(pool, router, table, path, ["article_id","comment_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'article_has_comment.article_id = ? AND ' +
            'comment.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};