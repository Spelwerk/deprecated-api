var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_species ' +
        'LEFT JOIN species ON species.id = world_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/species/playable', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'species.playable = 1 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/species/creature', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'species.playable = 0 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/species', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'species', req.body.insert_id);
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'species', req.params.id2);
    });
};