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
        'protection.deleted, ' +
        'protection.updated ' +
        'FROM protection ' +
        'LEFT JOIN protectiontype ON protectiontype.id = protection.protectiontype_id ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id ' +
        'LEFT JOIN bodypart ON bodypart.id = protection.bodypart_id ' +
        'LEFT JOIN icon ON icon.id = protection.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id1/bodypart/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.protectiontype_id = ? AND ' +
            table + '.bodypart_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });
};