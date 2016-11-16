var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.name, ' +
        'protection.description, ' +
        'protection.price, ' +
        'protection.protectiontype_id, ' +
        'protectiontype.name AS protectiontype_name, ' +
        'protectiontype.attribute_id, ' +
        'attribute.name AS attribute_name,' +
        'protection.attribute_value, ' +
        'protection.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'protection.icon_id, ' +
        'icon.path AS icon_path, ' +
        'protection.created, ' +
        'protection.deleted ' +
        'FROM setting_has_protection ' +
        'LEFT JOIN protection ON protection.id = setting_has_protection.protection_id ' +
        'LEFT JOIN protectiontype ON protectiontype.id = protection.protectiontype_id ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id ' +
        'LEFT JOIN bodypart ON bodypart.id = protection.bodypart_id ' +
        'LEFT JOIN icon ON icon.id = protection.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_protection.setting_id = ? AND ' +
            'protection.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2/bodypart/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_protection.setting_id = ? AND ' +
            'protection.protectiontype_id = ? AND ' +
            'protection.bodypart_id = ? AND ' +
            'protection.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "protection_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};