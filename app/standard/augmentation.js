var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'augmentation.id, ' +
        'augmentation.name, ' +
        'augmentation.description, ' +
        'augmentation.price, ' +
        'augmentation.energy, ' +
        'augmentation.legal, ' +
        'augmentation.bionic_id, ' +
        'bionic.name AS bionic_name, ' +
        'augmentation.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'augmentation.attribute_value, ' +
        'augmentation.weapon_id, ' +
        'weapon.name AS weapon_name, ' +
        'augmentation.created, ' +
        'augmentation.deleted ' +
        'FROM augmentation ' +
        'LEFT JOIN bionic ON bionic.id = augmentation.bionic_id ' +
        'LEFT JOIN attribute ON attribute.id = augmentation.attribute_id ' +
        'LEFT JOIN weapon ON weapon.id = augmentation.weapon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE augmentation.id = ?';
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