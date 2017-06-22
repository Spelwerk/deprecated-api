var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM augmentation';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    require('./augmentation_has_attribue')(router, path);

    require('./augmentation_has_skill')(router, path);
};