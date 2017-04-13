var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id, ' +
        'species.canon, ' +
        'species.name, ' +
        'species.description, ' +
        'species.playable, ' +
        'species.max_age, ' +
        'species.multiply_skill, ' +
        'species.multiply_expertise, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_species ' +
        'LEFT JOIN species ON species.id = world_has_species.species_id ' +
        'LEFT JOIN icon ON icon.id = species.icon_id';

    require('../default-has')(pool, router, table, path, ["world_id","species_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.canon = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id1/playable/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.playable = ? AND ' +
            'species.canon = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, 1]);
    });
};