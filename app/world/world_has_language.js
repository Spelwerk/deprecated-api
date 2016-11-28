var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'language.id, ' +
        'language.name, ' +
        'language.description, ' +
        'FROM world_has_language ' +
        'LEFT JOIN language ON language.id = world_has_language.language_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_language.world_id = ? AND ' +
            'language.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","language_id"]);
};