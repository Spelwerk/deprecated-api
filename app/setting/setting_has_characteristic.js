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
        'characteristic.created, ' +
        'characteristic.deleted ' +
        'FROM setting_has_characteristic ' +
        'LEFT JOIN characteristic ON characteristic.id = setting_has_characteristic.characteristic_id ' +
        'LEFT JOIN species ON species.id = characteristic.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = characteristic.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = characteristic.attribute_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_characteristic.setting_id = ? AND ' +
            'characteristic.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/gift/:id2/species/:id3/manifestation/:id4', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_characteristic.setting_id = ? AND ' +
            'characteristic.gift = ? AND ' +
            '(characteristic.species_id = ? OR characteristic.species_id is null) AND ' +
            '(characteristic.manifestation_id = ? OR characteristic.manifestation_id is null) AND ' +
            'characteristic.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3, req.params.id4]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "characteristic_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};