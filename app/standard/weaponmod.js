var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weaponmod.id, ' +
        'weaponmod.name, ' +
        'weaponmod.description, ' +
        'weaponmod.short, ' +
        'weaponmod.price, ' +
        'weaponmod.damage_d12, ' +
        'weaponmod.damage_bonus, ' +
        'weaponmod.critical_d12, ' +
        'weaponmod.initiative, ' +
        'weaponmod.hit, ' +
        'weaponmod.distance, ' +
        'weaponmod.weapontype_id, ' +
        'weapontype.name AS weapontype_name, ' +
        'weaponmod.created, ' +
        'weaponmod.deleted, ' +
        'weaponmod.updated ' +
        'FROM weaponmod ' +
        'LEFT JOIN weapontype ON weapontype.id = weaponmod.weapontype_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.weapontype_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};