//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'loyalty.id, ' +
        'loyalty.name, ' +
        'loyalty.description, ' +
        'loyalty.value, ' +
        'loyalty.icon_id, ' +
        'icon.path AS icon_path, ' +
        'loyalty.created, ' +
        'loyalty.deleted, ' +
        'loyalty.updated ' +
        'FROM loyalty ' +
        'LEFT JOIN icon ON icon.id = loyalty.icon_id';

    require('./../default')(pool, router, table, path, query);
};