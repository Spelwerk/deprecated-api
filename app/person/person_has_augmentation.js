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

    require('../default-has')(pool, router, table, path, ["person_id","augmentation_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/bionic/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ? AND ' +
            'augmentation.bionic_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });
};