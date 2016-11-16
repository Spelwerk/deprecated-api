var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weapontype.id, ' +
        'weapontype.name, ' +
        'weapontype.description, ' +
        'weapontype.damage_d12, ' +
        'weapontype.damage_bonus, ' +
        'weapontype.critical_d12, ' +
        'weapontype.hand, ' +
        'weapontype.initiative, ' +
        'weapontype.hit, ' +
        'weapontype.distance, ' +
        'weapontype.weapongroup_id, ' +
        'weapongroup.name AS weapongroup_name, ' +
        'weapongroup.icon_id, ' +
        'icon.path AS icon_path, ' +
        'weapontype.created, ' +
        'weapontype.deleted ' +
        'FROM weapontype ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id ' +
        'LEFT JOIN icon ON icon.id = weapongroup.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/group/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.weapongroup_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};