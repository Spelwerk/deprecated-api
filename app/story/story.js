//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM story';

    require('./../default-hash')(pool, router, table, path, query);
};