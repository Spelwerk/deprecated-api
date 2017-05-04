var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM augmentation_has_skill ' +
        'LEFT JOIN skill ON skill.id = augmentation_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res) {
        var call = query + ' WHERE ' +
            'augmentation_has_skill.augmentation_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"skill_id": "ASC"});
    });

    router.post(path + '/id/:id/skill', function(req, res) {
        rest.relationPostWithValue(pool, req, res, 'augmentation', 'skill');
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'augmentation', 'skill');
    });
};