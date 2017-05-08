var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM gift';

    var allowedPost = ['name', 'description', 'icon', 'attribute_id', 'attribute_value', 'skill_id', 'skill_value', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'icon', 'attribute_id', 'attribute_value', 'skill_id', 'skill_value'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'skill_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call);
    });

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/species/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'species_id = ? AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'skill_id = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });
};