var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM assettype';

    var allowedPost = ['name', 'assetgroup_id', 'icon'];

    var allowedPut = ['name', 'assetgroup_id', 'icon'];

    var allowsUser = false;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/group/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'assetgroup_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });
};