var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.name, ' +
        'protection.description, ' +
        'protection.price, ' +
        'protection.created, ' +
        'protection.deleted, ' +
        'protection.protectiontype_id, ' +
        'protectiontype.name AS protectiontype_name, ' +
        'protectiontype.attribute_id, ' +
        'attribute.name AS attribute_name,' +
        'protection.attribute_value ' +
        'FROM protection ' +
        'LEFT JOIN protectiontype ON protectiontype.id = protection.protectiontype_id ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE protection.id = ?';
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