var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
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
            'canon = 1 AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'doctrine_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'skill_id = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'doctrine_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'manifestation_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};