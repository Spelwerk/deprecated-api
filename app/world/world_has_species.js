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

    router.get(path + '/id/:id/species', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.canon = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/species/playable/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.playable = ? AND ' +
            'species.canon = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    /*
     todo add to world on creation:
     todo + expertises on expertise.species_id
     todo + attribute(skill) on attribute.species_id
     todo + gift on gift.species_id
     todo + imperfection on imperfection.species_id
     todo + milestone on milestone.species_id
     */
    router.post(path + '/id/:id/species', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'species');
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'species');
    });
};