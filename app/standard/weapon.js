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
        'weapon.created, ' +
        'weapon.deleted ' +
        'FROM weapon ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.weapontype_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};