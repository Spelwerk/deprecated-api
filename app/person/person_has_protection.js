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
        'person_has_protection.protectionquality_id AS quality_id, ' +
        'protectionquality.name AS quality_name, ' +
        'protectionquality.price AS quality_price, ' +
        'protectionquality.attribute_value AS quality_attribute_value ' +
        'FROM person_has_protection ' +
        'LEFT JOIN protection ON protection.id = person_has_protection.protection_id ' +
        'LEFT JOIN protectiontype ON protectiontype.id = protection.protectiontype_id ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id ' +
        'LEFT JOIN bodypart ON bodypart.id = protection.bodypart_id ' +
        'LEFT JOIN protectionquality ON protectionquality.id = person_has_protection.protectionquality_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "person_id": req.params.id1,
            "protection_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};