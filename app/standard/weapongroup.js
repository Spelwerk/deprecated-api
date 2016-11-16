var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weapongroup.id, ' +
        'weapongroup.name, ' +
        'weapongroup.description, ' +
        'weapongroup.skill_attribute_id, ' +
        'a1.name AS skill_attribute_name, ' +
        'weapongroup.damage_attribute_id, ' +
        'a2.name AS damage_attribute_name, ' +
        'weapongroup.expertise_id, ' +
        'expertise.name AS expertise_name, ' +
        'weapongroup.icon_id, ' +
        'icon.path AS icon_path, ' +
        'weapongroup.created, ' +
        'weapongroup.deleted ' +
        'FROM weapongroup ' +
        'LEFT JOIN attribute a1 ON a1.id = weapongroup.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = weapongroup.damage_attribute_id ' +
        'LEFT JOIn expertise ON expertise.id = weapongroup.expertise_id ' +
        'LEFT JOIN icon ON icon.id = weapongroup.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.skill_attribute_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};