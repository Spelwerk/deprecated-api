var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM expertisetype';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });

    router.get(path + '/dice', function(req, res) {
        var call = query + ' WHERE ' +
            'dice = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });

    router.get(path + '/manifestation', function(req, res) {
        var call = query + ' WHERE ' +
            'manifestation = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });
};