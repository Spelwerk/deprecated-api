var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT weapon.id FROM user_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = user_has_weapon.weapon_id';

    router.get(path + '/id/:id/weapon', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_weapon.user_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/weapon', function(req, res, next) {
        req.relation.name = 'weapon';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res, next) {
        req.relation.name = 'weapon';

        rest.userRelationDelete(req, res, next);
    });
};