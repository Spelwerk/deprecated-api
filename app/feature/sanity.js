var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM ' + tableName;

    require('./../default')(router, tableName, query);

    router.get(path, function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });
};