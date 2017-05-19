var async = require('async'),
    mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM skill';

    require('./../default')(router, tableName, query);

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'skill.species_id IS NULL AND ' +
            'skill.manifestation = 0 AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/species/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'skill.canon = 1 AND ' +
            'skill.species_id = ? AND ' +
            'skill.manifestation = 0 AND ' +
            'skill.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};