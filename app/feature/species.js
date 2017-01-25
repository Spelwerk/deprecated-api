//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id, ' +
        'species.name, ' +
        'species.description, ' +
        'species.playable, ' +
        'species.max_age, ' +
        'species.icon_id, ' +
        'icon.path AS icon_path, ' +
        'species.created, ' +
        'species.deleted, ' +
        'species.updated ' +
        'FROM species ' +
        'LEFT JOIN icon ON icon.id = species.icon_id';

    require('./../default')(pool, router, table, path, query);
};