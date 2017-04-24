var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weaponmod.id, ' +
        'weaponmod.canon, ' +
        'weaponmod.name, ' +
        'weaponmod.description, ' +
        'weaponmod.short, ' +
        'weaponmod.price, ' +
        'weaponmod.damage_d12, ' +
        'weaponmod.damage_bonus, ' +
        'weaponmod.critical_d12, ' +
        'weaponmod.initiative, ' +
        'weaponmod.hit, ' +
        'weaponmod.distance, ' +
        'weaponmod.weapontype_id, ' +
        'weapontype.name AS weapontype_name ' +
        'FROM world_has_weaponmod ' +
        'LEFT JOIN weaponmod ON weaponmod.id = world_has_weaponmod.weaponmod_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weaponmod.weapontype_id';

    router.get(path + '/id/:id/weaponmod', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.canon = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/weaponmod/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.weapontype_id = ? AND ' +
            'weaponmod.canon = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.post(path + '/id/:id/weaponmod', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'weaponmod');
    });

    router.delete(path + '/id/:id/weaponmod/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'weaponmod');
    });
};