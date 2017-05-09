var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_skill ' +
        'LEFT JOIN skill ON skill.id = world_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res, next) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'world_has_skill.world_id = ? AND ' +
            'skill.species_id IS NULL AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/skill/species/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'world_has_skill.world_id = ? AND ' +
            '(skill.species_id = ? OR skill.species_id IS NULL) AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/skill', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'skill';

        rest.relationPost(req, res, next);
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'skill';

        rest.relationDelete(req, res, next);
    });
};