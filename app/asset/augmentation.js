var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM augmentation';

    var allowedPost = ['name', 'description', 'price', 'energy', 'legal'];

    var allowedPut = ['name', 'description', 'price', 'energy', 'legal'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    // Augmentation

    require('./augmentation_has_attribue')(router, table, path);

    require('./augmentation_has_skill')(router, table, path);
};