var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM software';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'software.canon = 1 AND ' +
            'software.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};