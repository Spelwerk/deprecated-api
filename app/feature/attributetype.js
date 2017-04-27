var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM attributetype';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/skill', function(req, res) {
        var call = query + ' WHERE ' +
            'skill = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });

    router.get(path + '/manifestation', function(req, res) {
        var call = query + ' WHERE ' +
            'manifestation = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });

    router.get(path + '/protected', function(req, res) {
        var call = query + ' WHERE ' +
            'protected = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });
};