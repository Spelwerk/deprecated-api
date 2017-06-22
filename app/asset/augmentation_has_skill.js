var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM augmentation_has_skill ' +
        'LEFT JOIN skill ON skill.id = augmentation_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res, next) {
        var call = query + ' WHERE ' +
            'augmentation_has_skill.augmentation_id = ?';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/skill', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'augmentation', req.params.id, 'skill', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'augmentation', req.params.id, 'skill', req.params.id2);
    });
};