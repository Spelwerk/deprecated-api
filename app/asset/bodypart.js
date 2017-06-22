var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM bodypart';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'bodypart.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });
};