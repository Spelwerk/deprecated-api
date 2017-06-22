var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_skill ' +
        'LEFT JOIN skill ON skill.id = user_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_skill.user_id = ? AND ' +
            'skill.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/skill', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'skill', req.body.insert_id);
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'skill', req.params.id2);
    });
};