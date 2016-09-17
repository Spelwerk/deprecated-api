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
        'weapontype.created, ' +
        'weapontype.deleted ' +
        'FROM weapontype ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE weapontype.id = ?';
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