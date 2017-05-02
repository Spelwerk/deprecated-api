var async = require('async'),
    mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM skill';

    var allowedPost = ['name', 'description', 'icon', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'skill.species_id IS NULL AND ' +
            'skill.manifestation = 0 AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/species/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'skill.species_id = ? AND ' +
            'skill.manifestation = 0 AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });
};