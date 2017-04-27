var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.canon, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'bionic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'bionic.attribute_value, ' +
        'bionic.icon_id, ' +
        'icon.path AS icon_path, ' +
        'bionic.created, ' +
        'bionic.deleted, ' +
        'bionic.updated ' +
        'FROM bionic ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN attribute ON attribute.id = bionic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = bionic.icon_id';

    // Get

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/bodypart/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.bodypart_id = ? AND ' +
            table + '.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    // Bionic

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });

    // Augmentation

    require('./bionic_has_augmentation')(pool, router, table, path);
};