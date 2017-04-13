var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/canon', function(req, res) {
        var call = query + ' WHERE ' +
            'world.canon = ? AND ' +
            'world.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1], {"name": "ASC"});
    });
};