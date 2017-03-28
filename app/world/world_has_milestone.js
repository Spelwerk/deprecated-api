var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'milestone.id, ' +
        'milestone.name, ' +
        'milestone.description, ' +
        'milestone.background_id, ' +
        'background.name AS background_name, ' +
        'milestone.species_id, ' +
        'species.name AS species_name, ' +
        'milestone.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'milestone.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'milestone.attribute_value, ' +
        'milestone.loyalty_id, ' +
        'loyalty.name AS loyalty_name, ' +
        'milestone.loyalty_occupation ' +
        'FROM world_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = world_has_milestone.milestone_id ' +
        'LEFT JOIN background ON background.id = milestone.background_id ' +
        'LEFT JOIN species ON species.id = milestone.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = milestone.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = milestone.attribute_id ' +
        'LEFT JOIN loyalty ON loyalty.id = milestone.loyalty_id';

    require('../default-has')(pool, router, table, path, ["world_id","milestone_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            'milestone.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/background/:id2/species/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            '(milestone.background_id = ? OR milestone.background_id IS NULL) AND ' +
            '(milestone.species_id = ? OR milestone.species_id IS NULL) AND ' +
            'milestone.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });

    router.get(path + '/id/:id1/background/:id2/species/:id3/manifestation/:id4', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            '(milestone.background_id = ? OR milestone.background_id IS NULL) AND ' +
            '(milestone.species_id = ? OR milestone.species_id IS NULL) AND ' +
            '(milestone.manifestation_id = ? OR milestone.manifestation_id IS NULL) AND ' +
            'milestone.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3, req.params.id4]);
    });
};