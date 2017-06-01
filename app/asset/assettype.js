var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM assettype';

    require('./../default')(router, tableName, query, {admin: true, user: false});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/group/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'assetgroup_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};