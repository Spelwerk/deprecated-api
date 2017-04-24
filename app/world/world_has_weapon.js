var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.special, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.price, ' +
        'weapon.legal, ' +
        'weapon.weapontype_id, ' +
        'weapontype.name AS weapontype_name, ' +
        'weapontype.weapongroup_id, ' +
        'weapongroup.name AS weapongroup_name, ' +
        'weapontype.damage_d12, ' +
        'weapontype.damage_bonus, ' +
        'weapontype.critical_d12, ' +
        'weapontype.hand, ' +
        'weapontype.initiative, ' +
        'weapontype.hit, ' +
        'weapontype.distance, ' +
        'weapongroup.skill_attribute_id, ' +
        'a1.name AS skill_attribute_name, ' +
        'weapongroup.damage_attribute_id, ' +
        'a2.name AS damage_attribute_name, ' +
        'weapongroup.expertise_id, ' +
        'expertise.name AS expertise_name, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = world_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN attribute a1 ON a1.id = weapongroup.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = weapongroup.damage_attribute_id ' +
        'LEFT JOIN expertise ON expertise.id = weapongroup.expertise_id ' +
        'LEFT JOIN icon ON icon.id = weapongroup.icon_id';

    router.get(path + '/id/:id/weapon', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapon.special = ? AND ' +
            'weapon.canon = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 0, 1]);
    });

    router.get(path + '/id/:id/weapon/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapon.weapontype_id = ? AND ' +
            'weapon.special = ? AND ' +
            'weapon.canon = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 0, 1]);
    });

    router.get(path + '/id/:id/weapon/group/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapontype.weapongroup_id = ? AND ' +
            'weapon.special = ? AND ' +
            'weapon.canon = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 0, 1]);
    });

    router.post(path + '/id/:id/weapon', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'weapon');
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'weapon');
    });
};