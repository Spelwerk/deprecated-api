var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM milestone';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/special', function(req, res) {
        var call = query + ' WHERE ' +
            'background_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'canon = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1]);
    });

    router.get(path + '/special/background/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'background_id = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'canon = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });
};