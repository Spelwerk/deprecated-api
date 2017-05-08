var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM protection';

    var allowedPost = ['name', 'description', 'price', 'bodypart_id', 'icon'];

    var allowedPut = ['name', 'description', 'price', 'bodypart_id', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/bodypart/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'bodypart_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    // Attribute

    require('./protection_has_attribute')(router, table, path);
};