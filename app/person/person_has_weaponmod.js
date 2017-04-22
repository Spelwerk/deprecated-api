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
        'weaponmod.distance ' +
        'FROM person_has_weaponmod ' +
        'LEFT JOIN weaponmod ON weaponmod.id = person_has_weaponmod.weaponmod_id';

    router.get(path + '/id/:id1/weapon/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_weaponmod.person_id = ? AND ' +
            'person_has_weaponmod.weapon_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });

    // todo post/put/delete
};