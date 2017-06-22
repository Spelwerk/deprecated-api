var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM milestone';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted is NULL';

        rest.GET(req, res, next, call);
    });

    router.get(path + '/background/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id = ? AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted is NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/species/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id = ? AND ' +
            'manifestation_id IS NULL AND ' +
            'deleted is NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/manifestation/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'background_id IS NULL AND ' +
            'species_id IS NULL AND ' +
            'manifestation_id = ? AND ' +
            'deleted is NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    require('./milestone_has_attribute')(router, path);

    require('./milestone_has_skill')(router, path);
};