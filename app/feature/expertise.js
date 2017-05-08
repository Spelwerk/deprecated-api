var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.canon, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.skill_id, ' +
        'skill.name AS skill_name, ' +
        'expertise.species_id, ' +
        'species.name AS species_name, ' +
        'expertise.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'expertise.doctrine_id, ' +
        'skill.icon ' +
        'FROM expertise ' +
        'LEFT JOIN skill ON skill.id = expertise.skill_id ' +
        'LEFT JOIN species ON species.id = expertise.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = expertise.manifestation_id';

    var allowedPost = ['name', 'description', 'skill_id', 'icon', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'skill_id', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.doctrine_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, call, null, {"expertise.id":"ASC"});
    });

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.skill_id = ? AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.doctrine_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id], {"expertise.id":"ASC"});
    });

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.manifestation_id = ? AND ' +
            'expertise.doctrine_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id], {"expertise.id":"ASC"});
    });
};