var rest = require('./rest'),
    tokens = require('./tokens'),
    base = require('./base');

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
        req.table.admin = !!options ? options.admin : req.table.admin;

        rest.PUT(req, res, next, tableName, req.params.id);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        rest.CANON(req, res, next, tableName, req.params.id);
    });

    router.put(path + '/id/:id/revive', function(req, res, next) {
        rest.REVIVE(req, res, next, tableName, req.params.id);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        req.table.admin = options.admin || req.table.admin;

        rest.DELETE(req, res, next, tableName, req.params.id);
    });

    // BASE

    router.get(path + '/base/:base', function(req, res, next) {
        var call = query;

        var array = [];

        if(req.table.user) {
            call = query + ' ' +
                'LEFT JOIN user_has_' + tableName + ' ON (user_has_' + tableName + '.' + tableName + '_id = ' + tableName + '.id AND user_has_' + tableName + '.owner = 1 AND user_has_' + tableName + '.user_id = ?) ' +
                'WHERE ' + tableName + '.id = ?';

            array = [req.user.id, base.unique(req.params.base)];
        } else {
            call = query + ' ' +
                'WHERE ' + tableName + '.id = ?';

            array = [base.unique(req.params.base)];
        }

        rest.QUERY(req, res, next, call, array);
    });

    router.put(path + '/base/:base', function(req, res, next) {
        req.table.admin = !!options ? options.admin : req.table.admin;

        rest.PUT(req, res, next, tableName, req.params.base);
    });

    router.put(path + '/base/:base/canon', function(req, res, next) {
        rest.CANON(req, res, next, tableName, req.params.base);
    });

    router.put(path + '/base/:base/revive', function(req, res, next) {
        rest.REVIVE(req, res, next, tableName, req.params.base);
    });

    router.delete(path + '/base/:base', function(req, res, next) {
        req.table.admin = options.admin || req.table.admin;

        rest.DELETE(req, res, next, tableName, req.params.base);
    });
};