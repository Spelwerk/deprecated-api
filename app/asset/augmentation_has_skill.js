var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM augmentation_has_skill ' +
        'LEFT JOIN skill ON skill.id = augmentation_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res, next) {
        var call = query + ' WHERE ' +
            'augmentation_has_skill.augmentation_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/skill', function(req, res, next) {
        req.table.name = 'augmentation';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'skill';

        rest.relationPostWithValue(req, res, next, 'augmentation', 'skill');
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res, next) {
        req.table.name = 'augmentation';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'skill';

        rest.relationDelete(req, res, next, 'augmentation', 'skill');
    });
};