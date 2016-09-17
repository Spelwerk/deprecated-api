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
        'weapongroup.created, ' +
        'weapongroup.deleted ' +
        'FROM weapongroup ' +
        'LEFT JOIN attribute a1 ON a1.id = weapongroup.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = weapongroup.damage_attribute_id ' +
        'LEFT JOIn expertise ON expertise.id = weapongroup.expertise_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE weapongroup.id = ?';
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