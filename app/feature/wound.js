var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM wound';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'wound.deleted IS NULL AND ' +
            'wound.hidden = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DEC", "name": "ASC"});
    });
};