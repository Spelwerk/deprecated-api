var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.name, ' +
        'protection.description, ' +
        'person_has_protection.protection_custom, ' +
        'protection.price, ' +
        'protection.protectiontype_id, ' +
        'protectiontype.name AS protectiontype_name, ' +
        'protectiontype.attribute_id, ' +
        'attribute.name AS attribute_name,' +
        'protection.attribute_value, ' +
        'protection.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'person_has_protection.protectionquality_id AS quality_id, ' +
        'protectionquality.name AS quality_name, ' +
        'protectionquality.price AS quality_price, ' +
        'protectionquality.attribute_value AS quality_attribute_value, ' +
        'person_has_protection.equipped, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_protection ' +
        'LEFT JOIN protection ON protection.id = person_has_protection.protection_id ' +
        'LEFT JOIN protectiontype ON protectiontype.id = protection.protectiontype_id ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id ' +
        'LEFT JOIN bodypart ON bodypart.id = protection.bodypart_id ' +
        'LEFT JOIN protectionquality ON protectionquality.id = person_has_protection.protectionquality_id ' +
        'LEFT JOIN icon ON icon.id = protection.icon_id';

    require('../default-has')(pool, router, table, path, ["person_id","protection_id"]);

    router.get(path + '/id/:id1', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id1/equipped/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ? AND ' +
            'person_has_protection.equipped = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    router.put(path + '/id/:id1/id/:id2', function(req, res) {
        rest.PUT(pool, req, res, table, {"person_id": req.params.id1, "protection_id": req.params.id2});
    });
};