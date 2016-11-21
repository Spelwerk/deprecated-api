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
        'attribute.description AS attribute_description, ' +
        'augmentation.attribute_value, ' +
        'augmentation.weapon_id, ' +
        'weapon.name AS weapon_name, ' +
        'person_has_augmentation.augmentationquality_id AS quality_id, ' +
        'augmentationquality.name AS quality_name, ' +
        'augmentationquality.price AS quality_price, ' +
        'augmentationquality.energy AS quality_energy ' +
        'FROM person_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = person_has_augmentation.augmentation_id ' +
        'LEFT JOIN bionic ON bionic.id = augmentation.bionic_id ' +
        'LEFT JOIN attribute ON attribute.id = augmentation.attribute_id ' +
        'LEFT JOIN weapon ON weapon.id = augmentation.weapon_id ' +
        'LEFT JOIN augmentationquality ON augmentationquality.id = person_has_augmentation.augmentationquality_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id1/bionic/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ? AND ' +
            'augmentation.bionic_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "person_id": req.params.id1,
            "augmentation_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};