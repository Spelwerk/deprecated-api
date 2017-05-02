var async = require('async'),
    mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species';

    var allowedPost = ['playable', 'name', 'description', 'max_age', 'multiply_skill', 'multiply_expertise', 'icon'];

    var allowedPut = ['playable', 'name', 'description', 'max_age', 'multiply_skill', 'multiply_expertise', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted is NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/playable', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'playable = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/creature', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'playable = 0 AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('./species_has_attribute')(pool, router, table, path);

    require('./species_has_weapon')(pool, router, table, path);
};