var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM gift';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/special', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute_id IS NULL AND ' +
            'canon = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1]);
    });

    router.get(path + '/skill/:id/special', function(req, res) {
        var call = query + ' WHERE ' +
            'attribute_id = ? AND ' +
            'canon = 1 AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};