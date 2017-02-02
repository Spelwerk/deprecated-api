var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'world.deleted IS NULL AND ' +
            'world.template = ? AND ' +
            'world.hidden = ?';

        rest.QUERY(pool, req, res, call, [0,0], {"popularity": "DESC", "name": "ASC"});
    });

    router.get(path + '/template', function(req, res) {
        var call = query + ' WHERE ' +
            'world.deleted IS NULL AND ' +
            'world.template = ? AND ' +
            'world.hidden = ?';

        rest.QUERY(pool, req, res, call, [1,0], {"popularity": "DESC", "name": "ASC"});
    });
};