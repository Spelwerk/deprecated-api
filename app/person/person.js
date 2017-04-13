var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person';

    var playable = 'SELECT * FROM person ' +
        'LEFT JOIN person_is_playable ON person_is_playable.id = person.id';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null, {"popularity": "DESC", "nickname": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person.id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"popularity": "DESC", "nickname": "ASC"});
    });

    router.get(path + '/playable', function(req, res) {
        var call = playable + ' WHERE ' +
            'playable = ? AND ' +
            'calculated = ? AND ' +
            'cheated = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1, 0], {"popularity": "DESC", "nickname": "ASC"});
    });

    router.get(path + '/playable/id/:id', function(req, res) {
        var call = playable + ' WHERE ' +
            'person.id = ? AND ' +
            'playable = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1], {"person.id": "ASC"});
    });
};