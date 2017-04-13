//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'background.id, ' +
        'background.canon, ' +
        'background.name, ' +
        'background.description, ' +
        'background.species_id, ' +
        'species.name AS species_name, ' +
        'background.icon_id, ' +
        'icon.path AS icon_path, ' +
        'background.created, ' +
        'background.deleted, ' +
        'background.updated ' +
        'FROM background ' +
        'LEFT JOIN species ON species.id = background.species_id ' +
        'LEFT JOIN icon ON icon.id = background.icon_id';

    require('./../default')(pool, router, table, path, query);
};