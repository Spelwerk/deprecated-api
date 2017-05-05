var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.canon, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.skill_id, ' +
        'expertise.species_id, ' +
        'expertise.manifestation_id, ' +
        'expertise.doctrine_id, ' +
        'skill.icon ' +
        'FROM expertise ' +
        'LEFT JOIN skill ON skill.id = expertise.skill_id';

    var allowedPost = ['name', 'description', 'skill_id', 'icon', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'skill_id', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.doctrine_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.skill_id = ? AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.doctrine_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.canon = 1 AND ' +
            'expertise.manifestation_id = ? AND ' +
            'expertise.doctrine_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};