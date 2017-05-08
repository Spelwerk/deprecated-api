var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM background_has_skill';

    router.get(path + '/id/:id/skill', function(req, res) {
        var call = query + ' WHERE ' +
            'background_has_skill.background_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"skill_id": "ASC"});
    });

    router.post(path + '/id/:id/skill', function(req, res) {
        rest.relationPostWithValue(req, res, 'background', 'skill');
    });

    router.delete(path + '/id/:id/skill/:id2', function(req, res) {
        rest.relationDelete(req, res, 'background', 'skill');
    });
};