var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM assetgroup';

    require('./../default')(router, tableName, query, {admin: true, user: false});

    router.get(path, function(req, res, next) {
        rest.GET(req, res, next, query);
    });
};