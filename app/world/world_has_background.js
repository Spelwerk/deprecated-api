var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'background.id, ' +
        'background.canon, ' +
        'background.name, ' +
        'background.description, ' +
        'background.species_id, ' +
        'species.name AS species_name, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_background ' +
        'LEFT JOIN background ON background.id = world_has_background.background_id ' +
        'LEFT JOIN species ON species.id = background.species_id ' +
        'LEFT JOIN icon ON icon.id = background.icon_id';

    require('../default-has')(pool, router, table, path, ["world_id","background_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_background.world_id = ? AND ' +
            'background.canon = ? AND ' +
            'background.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id1/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_background.world_id = ? AND ' +
            '(background.species_id = ? OR background.species_id IS NULL) AND ' +
            'background.canon = ? AND ' +
            'background.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, 1]);
    });
};