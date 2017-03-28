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
        'milestone.loyalty_occupation, ' +
        'milestone.created, ' +
        'milestone.deleted, ' +
        'milestone.updated ' +
        'FROM milestone ' +
        'LEFT JOIN background ON background.id = milestone.background_id ' +
        'LEFT JOIN species ON species.id = milestone.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = milestone.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = milestone.attribute_id ' +
        'LEFT JOIN loyalty ON loyalty.id = milestone.loyalty_id';

    require('./../default')(pool, router, table, path, query);
};