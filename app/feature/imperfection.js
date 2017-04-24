var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'characteristic.id, ' +
        'characteristic.canon, ' +
        'characteristic.name, ' +
        'characteristic.description, ' +
        'characteristic.species_id, ' +
        'species.name AS species_name, ' +
        'characteristic.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'characteristic.icon_id, ' +
        'icon.path AS icon_path, ' +
        'characteristic.created, ' +
        'characteristic.deleted, ' +
        'characteristic.updated ' +
        'FROM characteristic ' +
        'LEFT JOIN species ON species.id = characteristic.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = characteristic.manifestation_id ' +
        'LEFT JOIN icon ON icon.id = characteristic.icon_id';

    require('./../default')(pool, router, table, path, query);
};