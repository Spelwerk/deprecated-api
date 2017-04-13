var rest = require('./../rest');

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
        'augmentation.bionic_id, ' +
        'bionic.name AS bionic_name, ' +
        'augmentation.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'augmentation.attribute_value, ' +
        'augmentation.weapon_id, ' +
        'weapon.name AS weapon_name, ' +
        'augmentation.created, ' +
        'augmentation.deleted, ' +
        'augmentation.updated ' +
        'FROM augmentation ' +
        'LEFT JOIN bionic ON bionic.id = augmentation.bionic_id ' +
        'LEFT JOIN attribute ON attribute.id = augmentation.attribute_id ' +
        'LEFT JOIN weapon ON weapon.id = augmentation.weapon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/bionic/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.bionic_id = ? AND ' +
            table + '.deleted is NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};