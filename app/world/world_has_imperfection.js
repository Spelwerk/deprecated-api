var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = world_has_imperfection.imperfection_id';

    router.get(path + '/id/:id/imperfection', function(req, res) {
        var call = query + ' WHERE ' +
            'imperfection.canon = 1 AND ' +
            'world_has_imperfection.world_id = ? AND ' +
            'imperfection.species_id IS NULL AND ' +
            'imperfection.manifestation_id IS NULL AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/imperfection/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'imperfection.canon = 1 AND ' +
            'world_has_imperfection.world_id = ? AND ' +
            '(imperfection.species_id = ? OR imperfection.species_id IS NULL) AND ' +
            'imperfection.manifestation_id IS NULL AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/imperfection/species/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'imperfection.canon = 1 AND ' +
            'world_has_imperfection.world_id = ? AND ' +
            '(imperfection.species_id = ? OR imperfection.species_id IS NULL) AND ' +
            '(imperfection.manifestation_id = ? OR imperfection.manifestation_id IS NULL) AND ' +
            'imperfection.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id, req.params.id2, req.params.id3]);
    });

    router.post(path + '/id/:id/imperfection', function(req, res) {
        rest.relationPost(req, res, 'world', 'imperfection');
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res) {
        rest.relationDelete(req, res, 'world', 'imperfection');
    });
};