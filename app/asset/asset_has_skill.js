var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM asset_has_skill ' +
        'LEFT JOIN skill ON skill.id = asset_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res, next) {
        var call = query + ' WHERE ' +
            'asset_has_skill.asset_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/skill', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'asset', req.params.id, 'skill', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'asset', req.params.id, 'skill', req.params.id2);
    });
};