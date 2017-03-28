//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'background.id, ' +
        'background.name, ' +
        'background.description, ' +
        'background.icon_id, ' +
        'icon.path AS icon_path, ' +
        'background.created, ' +
        'background.deleted, ' +
        'background.updated ' +
        'FROM background ' +
        'LEFT JOIN icon ON icon.id = background.icon_id';

    require('./../default')(pool, router, table, path, query);
};