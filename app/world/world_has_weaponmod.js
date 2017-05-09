var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_weaponmod ' +
        'LEFT JOIN weaponmod ON weaponmod.id = world_has_weaponmod.weaponmod_id';

    router.get(path + '/id/:id/weaponmod', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weaponmod.canon = 1 AND ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/weaponmod/type/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weaponmod.canon = 1 AND ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.weapontype_id = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weaponmod', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'weaponmod';

        rest.relationPost(req, res, next);
    });

    router.delete(path + '/id/:id/weaponmod/:id2', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'weaponmod';

        rest.relationDelete(req, res, next);
    });
};