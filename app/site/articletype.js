var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'articletype.id, ' +
        'articletype.name, ' +
        'articletype.description, ' +
        'articletype.created ' +
        'FROM articletype';

    require('./../default')(pool, router, table, path, query);
};