var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = world_has_milestone.milestone_id';

    router.get(path + '/id/:id/milestone', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            'milestone.species_id IS NULL AND ' +
            'milestone.manifestation_id IS NULL AND ' +
            'milestone.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/milestone/background/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            '(milestone.background_id = ? OR milestone.background_id IS NULL) AND ' +
            'milestone.species_id IS NULL AND ' +
            'milestone.manifestation_id IS NULL AND ' +
            'milestone.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/milestone/background/:id2/species/:id3', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            '(milestone.background_id = ? OR milestone.background_id IS NULL) AND ' +
            '(milestone.species_id = ? OR milestone.species_id IS NULL) AND ' +
            'milestone.manifestation_id IS NULL AND ' +
            'milestone.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id, req.params.id2, req.params.id3]);
    });

    router.get(path + '/id/:id/milestone/background/:id2/species/:id3/manifestation/:id4', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            '(milestone.background_id = ? OR milestone.background_id IS NULL) AND ' +
            '(milestone.species_id = ? OR milestone.species_id IS NULL) AND ' +
            '(milestone.manifestation_id = ? OR milestone.manifestation_id IS NULL) AND ' +
            'milestone.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id, req.params.id2, req.params.id3, req.params.id4]);
    });

    router.post(path + '/id/:id/milestone', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'milestone', req.body.insert_id);
    });

    router.delete(path + '/id/:id/milestone/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'milestone', req.params.id2);
    });
};