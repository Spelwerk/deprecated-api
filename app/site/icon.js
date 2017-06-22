var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = '/icon';

    var query = 'SELECT * FROM icon';

    router.get(path, function(req, res, next) {
        rest.GET(req, res, next, query);
    });

    router.post(path, function(req, res, next) {
        rest.POST(req, res, next, true, false, 'icon');
    });
};