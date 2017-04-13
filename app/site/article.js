var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'article.id, ' +
        'article.title, ' +
        'article.abstract, ' +
        'article.content, ' +
        'article.published, ' +
        'article.articletype_id, ' +
        'articletype.name AS articletype_name, ' +
        'article.user_id, ' +
        'user.displayname AS user_username, ' +
        'article.created ' +
        'FROM article ' +
        'LEFT JOIN articletype ON articletype.id = article.articletype_id ' +
        'LEFT JOIN user ON user.id = article.user_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id1/published/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'article.articletype_id = ? AND ' +
            'article.published = ?' +
            'AND article.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });
};