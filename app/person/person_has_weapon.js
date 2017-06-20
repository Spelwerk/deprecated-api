var async = require('async'),
    rest = require('./../rest');

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
        'weapongroup.icon, ' +
        'person_has_weapon.custom, ' +
        'person_has_weapon.equipped, ' +
        'person_has_skill.value AS skill_value, ' +
        'person_has_expertise.value AS expertise_value ' +
        'FROM person_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = person_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN person_has_skill ON person_has_skill.person_id = ? AND person_has_skill.skill_id = weapongroup.skill_id ' +
        'LEFT JOIN person_has_expertise ON person_has_expertise.person_id = ? AND person_has_expertise.expertise_id = weapongroup.expertise_id';

    router.get(path + '/id/:id/weapon', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ? AND ' +
            'weapongroup.special = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id, req.params.id, 0], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/weapon/equipped/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ? AND ' +
            'person_has_weapon.equipped = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id, req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weapon', function(req, res, next) {
        rest.relationPost(req, res, next, 'person', req.params.id, 'weapon', req.body.insert_id);
    });

    router.put(path + '/id/:id/weapon/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'weapon', req.params.id2, req.body.custom);
    });

    router.put(path + '/id/:id/weapon/:weapon/equip', function(req, res, next) {
        var person = {},
            weapon = {};

        weapon.equip = 1;

        person.id = req.params.id;
        weapon.id = req.params.weapon;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', person.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_weapon SET equipped = ? WHERE person_id = ? AND weapon_id = ?', [weapon.equip, person.id, weapon.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/weapon/:weapon/unequip', function(req, res, next) {
        var person = {},
            weapon = {};

        weapon.equip = 0;

        person.id = req.params.id;
        weapon.id = req.params.weapon;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', person.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_weapon SET equipped = ? WHERE person_id = ? AND weapon_id = ?', [weapon.equip, person.id, weapon.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'person', req.params.id, 'weapon', req.params.id2);
    });
};