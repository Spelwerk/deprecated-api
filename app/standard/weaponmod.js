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
        'weaponmod.deleted ' +
        'FROM weaponmod ' +
        'LEFT JOIN weapontype ON weapontype.id = weaponmod.weapontype_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE weaponmod.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table, req.body);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table, req.body, 'id');
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, 'id');
    });
};