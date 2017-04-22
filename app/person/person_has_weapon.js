var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.special, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'person_has_weapon.weapon_custom, ' +
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
        'person_has_attribute.value AS skill_attribute_value, ' +
        'weapongroup.damage_attribute_id, ' +
        'a2.name AS damage_attribute_name, ' +
        'weapongroup.expertise_id, ' +
        'expertise.name AS expertise_name, ' +
        'person_has_expertise.level AS expertise_level, ' +
        'person_has_weapon.weaponquality_id AS quality_id, ' +
        'weaponquality.name AS quality_name, ' +
        'weaponquality.price AS quality_price, ' +
        'weaponquality.damage_d12 AS quality_damage_d12, ' +
        'weaponquality.damage_bonus AS quality_damage_bonus, ' +
        'weaponquality.critical_d12 AS quality_critical_d12, ' +
        'weaponquality.initiative AS quality_initiative, ' +
        'weaponquality.hit AS quality_hit, ' +
        'weaponquality.distance AS quality_distance, ' +
        'person_has_weapon.equipped, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = person_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN attribute a1 ON a1.id = weapongroup.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = weapongroup.damage_attribute_id ' +
        'LEFT JOIN expertise ON expertise.id = weapongroup.expertise_id ' +
        'LEFT JOIN weaponquality ON weaponquality.id = person_has_weapon.weaponquality_id AND person_has_weapon.weapon_id = weapon.id ' +
        'LEFT JOIN person_has_attribute ON person_has_attribute.person_id = ? AND person_has_attribute.attribute_id = expertise.skill_attribute_id ' +
        'LEFT JOIN person_has_expertise ON person_has_expertise.person_id = ? AND person_has_expertise.expertise_id = weapongroup.expertise_id ' +
        'LEFT JOIN icon ON icon.id = weapongroup.icon_id';

    router.get(path + '/id/:id/weapon', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ? AND ' +
            'weapon.special = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id, req.params.id, 0], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/weapon/equipped/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ? AND ' +
            'person_has_weapon.equipped = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id, req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weapon', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.weapon_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/weapon/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'bionic');
    });

    router.put(path + '/id/:id/weapon/:id2/equip/:equip', function(req, res) {
        rest.personEquip(req, res, 'weapon');
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'weapon');
    });
};