var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM imperfection';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/special', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1]);
    });
};