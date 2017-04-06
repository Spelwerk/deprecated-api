var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person';

    var short = 'SELECT id,nickname,occupation,age,popularity,thumbsup,thumbsdown FROM person';

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

    router.get(path + '/short', function(req, res) {
        var call = short + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "nickname": "ASC"});
    });

    router.get(path + '/short/id/:id', function(req, res) {
        var call = short + ' WHERE ' +
            'person.id = ? AND ' +
            'person.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"popularity": "DESC", "nickname": "ASC"});
    });
};