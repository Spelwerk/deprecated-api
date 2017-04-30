var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species';

    // Get

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/playable/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'species.playable = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    // Species

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });

    // Attribute

    require('species_has_attribute')(pool, router, table, path);

    // Weapon

    require('species_has_weapon')(pool, router, table, path);
};