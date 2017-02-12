var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'characteristic.id, ' +
        'characteristic.name, ' +
        'characteristic.description, ' +
        'characteristic.gift, ' +
        'characteristic.species_id, ' +
        'species.name AS species_name, ' +
        'characteristic.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'characteristic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'characteristic.attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_characteristic ' +
        'LEFT JOIN characteristic ON characteristic.id = world_has_characteristic.characteristic_id ' +
        'LEFT JOIN species ON species.id = characteristic.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = characteristic.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = characteristic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = characteristic.icon_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_characteristic.world_id = ? AND ' +
            'characteristic.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/gift/:id2/species/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_characteristic.world_id = ? AND ' +
            'characteristic.gift = ? AND ' +
            '(characteristic.species_id = ? OR characteristic.species_id IS NULL) AND ' +
            'characteristic.manifestation_id IS NULL AND ' +
            'characteristic.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });

    router.get(path + '/id/:id1/gift/:id2/species/:id3/manifestation/:id4', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_characteristic.world_id = ? AND ' +
            'characteristic.gift = ? AND ' +
            '(characteristic.species_id = ? OR characteristic.species_id IS NULL) AND ' +
            '(characteristic.manifestation_id = ? OR characteristic.manifestation_id IS NULL) AND ' +
            'characteristic.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3, req.params.id4]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","characteristic_id"]);
};