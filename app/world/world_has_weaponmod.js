var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_weaponmod ' +
        'LEFT JOIN weaponmod ON weaponmod.id = world_has_weaponmod.weaponmod_id';

    router.get(path + '/id/:id/weaponmod', function(req, res) {
        var call = query + ' WHERE ' +
            'weaponmod.canon = 1 AND ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/weaponmod/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'weaponmod.canon = 1 AND ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.weapontype_id = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weaponmod', function(req, res) {
        rest.relationPost(pool, req, res, 'world', 'weaponmod');
    });

    router.delete(path + '/id/:id/weaponmod/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'weaponmod');
    });
};