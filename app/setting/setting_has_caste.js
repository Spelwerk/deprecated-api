var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'caste.id, ' +
        'caste.name, ' +
        'caste.description, ' +
        'caste.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'caste.attribute_value AS attribute_value, ' +
        'caste.icon_id, ' +
        'icon.path AS icon_path, ' +
        'caste.created, ' +
        'caste.deleted ' +
        'FROM setting_has_caste ' +
        'LEFT JOIN caste ON caste.id = setting_has_caste.caste_id ' +
        'LEFT JOIN attribute ON attribute.id = caste.attribute_id ' +
        'LEFT JOIN icon ON icon.id = caste.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_caste.setting_id = ? AND ' +
            'caste.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "caste_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};