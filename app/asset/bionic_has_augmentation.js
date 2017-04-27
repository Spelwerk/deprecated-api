var rest = require('../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'augmentation.id, ' +
        'augmentation.canon, ' +
        'augmentation.name, ' +
        'augmentation.description, ' +
        'augmentation.price, ' +
        'augmentation.energy, ' +
        'augmentation.legal, ' +
        'augmentation.weapon_id, ' +
        'weapon.name AS weapon_name ' +
        'FROM bionic_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = bionic_has_augmentation.augmentation_id ' +
        'LEFT JOIN weapon ON weapon.id = augmentation.weapon_id';

    router.get(path + '/id/:id/augmentation', function(req, res) {
        var call = query + ' WHERE ' +
            'bionic_has_augmentation.bionic_id = ? AND ' +
            'augmentation.canon = ? AND ' +
            'augmentation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = 'DELETE FROM ' + table + ' ' +
            'WHERE ' + deleteArray[0] + ' = \'' + req.params.id1 + '\' ' +
            'AND ' + deleteArray[1] + ' = \'' + req.params.id2 + '\'';

        rest.queryMessage(pool, res, call, 202, 'deleted');
    });
};