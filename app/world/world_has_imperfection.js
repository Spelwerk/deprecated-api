var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'imperfection.id, ' +
        'imperfection.canon, ' +
        'imperfection.name, ' +
        'imperfection.description, ' +
        'imperfection.species_id, ' +
        'species.name AS species_name, ' +
        'imperfection.manifestation_id, ' +
        'manifestation.name AS manifestation_name ' +
        'FROM world_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = world_has_imperfection.imperfection_id ' +
        'LEFT JOIN species ON species.id = imperfection.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = imperfection.manifestation_id';

    router.get(path + '/id/:id/imperfection', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_imperfection.world_id = ? AND ' +
            'imperfection.canon = ? AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/imperfection/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_imperfection.world_id = ? AND ' +
            '(imperfection.species_id = ? OR imperfection.species_id IS NULL) AND ' +
            'imperfection.manifestation_id IS NULL AND ' +
            'imperfection.canon = ? AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.get(path + '/id/:id/imperfection/species/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_imperfection.world_id = ? AND ' +
            '(imperfection.species_id = ? OR imperfection.species_id IS NULL) AND ' +
            '(imperfection.manifestation_id = ? OR imperfection.manifestation_id IS NULL) AND ' +
            'imperfection.canon = ? AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, req.params.id3, 1]);
    });

    router.post(path + '/id/:id/imperfection', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'imperfection');
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'gift');
    });
};