var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM focus';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path + '/manifestation/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'manifestation_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};