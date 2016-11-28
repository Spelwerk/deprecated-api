var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id, ' +
        'species.name, ' +
        'species.description, ' +
        'species.max_age, ' +
        'species.icon_id, ' +
        'icon.name AS icon_name, ' +
        'species.created, ' +
        'species.deleted, ' +
        'species.updated ' +
        'FROM species ' +
        'LEFT JOIN icon ON icon.id = species.icon_id';

    require('./../default')(pool, router, table, path, query);
};