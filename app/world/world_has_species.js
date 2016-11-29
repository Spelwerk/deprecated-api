var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id, ' +
        'species.name, ' +
        'species.description, ' +
        'species.playable, ' +
        'species.max_age, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_species ' +
        'LEFT JOIN species ON species.id = world_has_species.species_id ' +
        'LEFT JOIN icon ON icon.id = species.icon_id';

    router.get(path + '/id/:id1/playable/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.playable = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","species_id"]);
};