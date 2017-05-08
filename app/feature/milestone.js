var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM milestone';

    var allowedPost = ['name', 'description', 'attribute_id', 'attribute_value', 'skill_id', 'skill_value', 'loyalty_id', 'loyalty_occupation', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'attribute_id', 'attribute_value', 'skill_id', 'skill_value', 'loyalty_id', 'loyalty_occupation'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'skill_id IS NULL AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, call);
    });

    router.get(path + '/background/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'skill_id IS NULL AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/species/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id = ? AND ' +
            'manifestation_id IS NULL AND ' +
            'skill_id IS NULL AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id = ? AND ' +
            'skill_id IS NULL AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'skill_id = ? AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });
};