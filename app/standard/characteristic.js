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
        'characteristic.icon_id, ' +
        'icon.path AS icon_path, ' +
        'characteristic.created, ' +
        'characteristic.deleted, ' +
        'characteristic.updated ' +
        'FROM characteristic ' +
        'LEFT JOIN species ON species.id = characteristic.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = characteristic.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = characteristic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = characteristic.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/gift/:id1/species/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'characteristic.gift = ? AND ' +
            '(characteristic.species_id = ? OR characteristic.species_id is NULL) AND ' +
            '(characteristic.manifestation_id = ? OR characteristic.manifestation_id is NULL) AND ' +
            'characteristic.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });
};