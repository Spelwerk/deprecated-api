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

    require('../default-has')(pool, router, table, path, ["world_id","augmentation_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'bionic_has_augmentation.bionic_id = ? AND ' +
            'augmentation.canon = ? AND ' +
            'augmentation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });
};