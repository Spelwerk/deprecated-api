var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'gift.id, ' +
        'gift.canon, ' +
        'gift.name, ' +
        'gift.description, ' +
        'gift.species_id, ' +
        'species.name AS species_name, ' +
        'gift.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'gift.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'gift.attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_gift ' +
        'LEFT JOIN gift ON gift.id = world_has_gift.gift_id ' +
        'LEFT JOIN species ON species.id = gift.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = gift.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = gift.attribute_id ' +
        'LEFT JOIN icon ON icon.id = gift.icon_id';

    require('../default-has')(pool, router, table, path, ["world_id","gift_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            'gift.canon = ? AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id1/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            '(gift.species_id = ? OR gift.species_id IS NULL) AND ' +
            'gift.manifestation_id IS NULL AND ' +
            'gift.canon = ? AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, 1]);
    });

    router.get(path + '/id/:id1/species/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            '(gift.species_id = ? OR gift.species_id IS NULL) AND ' +
            '(gift.manifestation_id = ? OR gift.manifestation_id IS NULL) AND ' +
            'gift.canon = ? AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3, 1]);
    });
};