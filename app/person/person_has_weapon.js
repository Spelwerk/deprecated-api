var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.species, ' +
        'weapon.augmentation, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'person_has_weapon.custom, ' +
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
        'person_has_skill.value AS skill_value, ' +
        'weapongroup.expertise_id, ' +
        'person_has_expertise.value AS expertise_level, ' +
        'weapongroup.damage_id, ' +
        'weapongroup.icon, ' +
        'person_has_weapon.weaponquality_id AS quality_id, ' +
        'weaponquality.name AS quality_name, ' +
        'weaponquality.price AS quality_price, ' +
        'weaponquality.damage_d12 AS quality_damage_d12, ' +
        'weaponquality.damage_bonus AS quality_damage_bonus, ' +
        'weaponquality.critical_d12 AS quality_critical_d12, ' +
        'weaponquality.initiative AS quality_initiative, ' +
        'weaponquality.hit AS quality_hit, ' +
        'weaponquality.distance AS quality_distance, ' +
        'person_has_weapon.equipped ' +
        'icon.path AS icon_path ' +
        'FROM person_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = person_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN weaponquality ON weaponquality.id = person_has_weapon.weaponquality_id AND person_has_weapon.weapon_id = weapon.id ' +
        'LEFT JOIN skill ON skill.id = weapongroup.skill_id ' +
        'LEFT JOIN expertise ON expertise.id = weapongroup.expertise_id ' +
        'LEFT JOIN person_has_skill ON person_has_skill.person_id = ? AND person_has_skill.skill_id = expertise.skill_id ' +
        'LEFT JOIN person_has_expertise ON person_has_expertise.person_id = ? AND person_has_expertise.expertise_id = weapongroup.expertise_id';

    router.get(path + '/id/:id/weapon', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ? AND ' +
            'weapon.special = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id, req.params.id, 0], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/weapon/equipped/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ? AND ' +
            'person_has_weapon.equipped = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id, req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weapon', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.personAuth(person, callback);
            },
            function(callback) {
                rest.query('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)', [person.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/weapon/:id2', function(req, res, next) {
        req.table.name = 'weapon';
        req.table.admin = false;
        req.table.user = true;

        rest.personCustomDescription(req, res, next);
    });

    router.put(path + '/id/:id/weapon/:id2/equip/:equip', function(req, res, next) {
        req.table.name = 'weapon';
        req.table.admin = false;
        req.table.user = true;

        rest.personEquip(req, res, next);
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res, next) {
        req.table.name = 'weapon';
        req.table.admin = false;
        req.table.user = true;

        rest.personDeleteRelation(req, res, next);
    });
};