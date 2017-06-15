var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.canon, ' +
        'expertise.popularity, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.skill_id, ' +
        'skill.name AS skill_name, ' +
        'expertise.species_id, ' +
        'species.name AS species_name, ' +
        'expertise.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'skill.icon ' +
        'FROM expertise ' +
        'LEFT JOIN skill ON skill.id = expertise.skill_id ' +
        'LEFT JOIN species ON species.id = expertise.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = expertise.manifestation_id';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/skill/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.skill_id = ? AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/skill/:id/species/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'expertise.skill_id = ? AND ' +
            'expertise.species_id = ? AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/skill/:id/manifestation/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'expertise.skill_id = ? AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id = ? AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/species/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.skill_id IS NULL AND ' +
            'expertise.species_id = ? AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/manifestation/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.manifestation_id = ? AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};