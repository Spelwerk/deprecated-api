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
        'FROM setting_has_weaponmod ' +
        'LEFT JOIN weaponmod ON weaponmod.id = setting_has_weaponmod.weaponmod_id ' +
        'LEFT JOIN weapontype ON weapontype.id = weaponmod.weapontype_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_weaponmod.setting_id = ? AND ' +
            'weaponmod.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_weaponmod.setting_id = ? AND ' +
            'weaponmod.weapontype_id = ? AND ' +
            'weaponmod.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "weaponmod_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};