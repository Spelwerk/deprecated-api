var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM wound';

    require('./../default')(pool, router, table, path, query);
};