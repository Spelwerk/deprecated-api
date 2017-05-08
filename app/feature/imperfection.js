var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM imperfection';

    var allowedPost = ['name', 'description', 'icon', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function (req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call);
    });

    router.get(path + '/manifestation/:id', function (req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/species/:id', function (req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'species_id = ? AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });
};