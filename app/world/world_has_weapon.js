var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.popularity, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.species, ' +
        'weapon.augmentation, ' +
        'weapon.damage_bonus, ' +
        'weapon.price, ' +
        'weapon.legal, ' +
        'weapon.weapontype_id, ' +
        'weapontype.damage_dice, ' +
        'weapontype.critical_dice, ' +
        'weapontype.hand, ' +
        'weapontype.initiative, ' +
        'weapontype.hit, ' +
        'weapontype.distance, ' +
        'weapontype.weapongroup_id, ' +
        'weapongroup.special, ' +
        'weapongroup.skill_id, ' +
        'weapongroup.expertise_id, ' +
        'weapongroup.damage_id, ' +
        'weapongroup.icon ' +
        'FROM world_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = world_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id';

    router.get(path + '/id/:id/weapon', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/weapon/type/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapon.weapontype_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/weapon/group/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'world_has_weapon.world_id = ? AND ' +
            'weapontype.weapongroup_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weapon', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'weapon', req.body.insert_id);
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'weapon', req.params.id2);
    });
};