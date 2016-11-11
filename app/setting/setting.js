var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'setting.name, ' +
        'setting.description, ' +
        'setting.template, ' +
        'setting.popularity, ' +
        'setting.supernatural, ' +
        'setting.supernatural, ' +
        'setting.supernatural, ' +
        'setting.supernatural_attributetype_id, ' +
        'a1.name AS supernatural_attributetype_name, ' +
        'setting.augmentation, ' +
        'setting.skill_split, ' +
        'setting.skill_attributetype_id, ' +
        'a2.name AS skill_attributetype_name, ' +
        'setting.expertise_split, ' +
        'setting.milestone_split, ' +
        'setting.relationship_split, ' +
        'setting.timeline_split, ' +
        'setting.characteristic_max, ' +
        'setting.created, ' +
        'setting.deleted ' +
        'FROM setting ' +
        'LEFT JOIN attributetype a1 ON a1.id = setting.supernatural_attributetype_id ' +
        'LEFT JOIN attributetype a2 ON a2.id = setting.skill_attributetype_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE setting.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });
};