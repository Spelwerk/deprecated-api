var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\' AND ' +
            'person.template = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "nickname": "ASC"});
    });

    router.get(path + '/template', function(req, res) {
        var call = query + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\' AND ' +
            'person.template = \'1\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "nickname": "ASC"});
    });
};