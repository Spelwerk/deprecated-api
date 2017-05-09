var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.species, ' +
        'weapon.augmentation, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.price, ' +
        'weapon.legal, ' +
        'weapon.weapontype_id, ' +
        'weapontype.name AS weapontype_name, ' +
        'weapontype.damage_d12, ' +
        'weapontype.damage_bonus, ' +
        'weapontype.critical_d12, ' +
        'weapontype.hand, ' +
        'weapontype.initiative, ' +
        'weapontype.hit, ' +
        'weapontype.distance, ' +
        'weapontype.weapongroup_id, ' +
        'weapongroup.name AS weapongroup_name, ' +
        'weapongroup.special, ' +
        'weapongroup.skill_id, ' +
        'weapongroup.expertise_id, ' +
        'weapongroup.damage_id, ' +
        'weapongroup.icon ' +
        'FROM world_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = world_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN skill ON skill.id = weapongroup.skill_id ' +
        'LEFT JOIN expertise ON expertise.id = weapongroup.expertise_id ' +
        'LEFT JOIN attribute ON attribute.id = weapongroup.damage_id';

    router.get(path + '/id/:id/weapon', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/weapon/type/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapon.weapontype_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/weapon/group/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapontype.weapongroup_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weapon', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'weapon';

        rest.relationPost(req, res, next);
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'weapon';

        rest.relationDelete(req, res, next);
    });
};