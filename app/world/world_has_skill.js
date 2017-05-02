var mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_skill ' +
        'LEFT JOIN skill ON skill.id = world_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'world_has_skill.world_id = ? AND ' +
            'skill.species_id IS NULL AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/skill/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'world_has_skill.world_id = ? AND ' +
            '(skill.species_id = ? OR skill.species_id IS NULL) AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/skill', function(req, res) {
        rest.relationPost(pool, req, res, 'world', 'skill');
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'skill');
    });
};