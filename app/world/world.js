var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'world.deleted IS NULL AND ' +
            'world.template = \'0\' AND ' +
            'world.hidden = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "name": "ASC"});
    });

    router.get(path + '/template', function(req, res) {
        var call = query + ' WHERE ' +
            'world.deleted IS NULL AND ' +
            'world.template = \'1\' AND ' +
            'world.hidden = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "name": "ASC"});
    });
};