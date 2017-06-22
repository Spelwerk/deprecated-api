var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_weapongroup ' +
        'LEFT JOIN weapongroup ON weapongroup.id = user_has_weapongroup.weapongroup_id';

    router.get(path + '/id/:id/weapongroup', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_weapongroup.user_id = ? AND ' +
            'weapongroup.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/weapongroup', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'weapongroup', req.body.insert_id);
    });

    router.delete(path + '/id/:id/weapongroup/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'weapongroup', req.params.id2);
    });
};