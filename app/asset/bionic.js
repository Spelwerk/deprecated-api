var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM bionic';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/bodypart/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'bodypart_id = ? AND ' +
            'deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    require('./bionic_has_attribute')(router, path);

    require('./bionic_has_augmentation')(router, path);
};