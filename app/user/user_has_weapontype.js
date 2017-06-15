var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_weapontype ' +
        'LEFT JOIN weapontype ON weapontype.id = user_has_weapontype.weapontype_id';

    router.get(path + '/id/:id/weapontype', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_weapontype.user_id = ? AND ' +
            'weapontype.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/weapontype', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'weapontype', req.body.insert_id);
    });

    router.delete(path + '/id/:id/weapontype/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'weapontype', req.params.id2);
    });
};