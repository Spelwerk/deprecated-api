var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.price, ' +
        'weapon.hidden, ' +
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
        'person_has_weapon.weaponquality_id AS quality_id, ' +
        'weaponquality.name AS quality_name, ' +
        'weaponquality.price AS quality_price, ' +
        'weaponquality.damage_d12 AS quality_damage_d12, ' +
        'weaponquality.damage_bonus AS quality_damage_bonus, ' +
        'weaponquality.critical_d12 AS quality_critical_d12, ' +
        'weaponquality.initiative AS quality_initiative, ' +
        'weaponquality.hit AS quality_hit, ' +
        'weaponquality.distance AS quality_distance ' +
        'FROM person_has_weapon ' +
        'LEFT JOIN weapon ON weapon.id = person_has_weapon.weapon_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN attribute a1 ON a1.id = weapongroup.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = weapongroup.damage_attribute_id ' +
        'LEFT JOIN expertise ON expertise.id = weapongroup.expertise_id ' +
        'LEFT JOIN weaponquality ON weaponquality.id = person_has_weapon.weaponquality_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_weapon.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "person_id": req.params.id1,
            "weapon_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};