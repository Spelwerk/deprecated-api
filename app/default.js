var rest = require('./rest'),
    tokens = require('./tokens');

module.exports = function(router, tableName, query, options) {
    query = query || 'SELECT * FROM ' + tableName;

    var path = '/' + tableName;

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query;

        var array = [];

        if(req.table.user) {
            call = query + ' ' +
                'LEFT JOIN user_has_' + tableName + ' ON (user_has_' + tableName + '.' + tableName + '_id = ' + tableName + '.id AND user_has_' + tableName + '.owner = 1 AND user_has_' + tableName + '.user_id = ?) ' +
                'WHERE ' + tableName + '.id = ?';

            array = [req.user.id, req.params.id];
        } else {
            call = query + ' ' +
                'WHERE ' + tableName + '.id = ?';

            array = [req.params.id];
        }

        rest.QUERY(req, res, next, call, array);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' + tableName + '.deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    router.post(path, function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = options.admin || req.table.admin;
        req.table.user = options.user || req.table.user;

        rest.POST(req, res, next);
    });

    router.put(path + '/id/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = options.admin || req.table.admin;
        req.table.user = options.user || req.table.user;

        rest.PUT(req, res, next);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        req.table.name = tableName;

        rest.CANON(req, res, next);
    });

    router.put(path + '/id/:id/revive', function(req, res, next) {
        req.table.name = tableName;

        rest.REVIVE(req, res, next);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = options.admin || req.table.admin;
        req.table.user = options.user || req.table.user;

        rest.DELETE(req, res, next);
    });
};