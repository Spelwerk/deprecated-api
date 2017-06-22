var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM background';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'background.canon = 1 AND ' +
            'background.species_id IS NULL AND ' +
            'background.manifestation_id IS NULL AND ' +
            'background.deleted IS NULL';

        rest.GET(req, res, next, call);
    });

    router.get(path + '/species/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'background.canon = 1 AND ' +
            'background.species_id = ? AND ' +
            'background.manifestation_id IS NULL AND ' +
            'background.deleted IS NULL';

        rest.GET(req, res, next, call);
    });

    router.get(path + '/manifestation/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'background.canon = 1 AND ' +
            'background.species_id IS NULL AND ' +
            'background.manifestation_id = ? AND ' +
            'background.deleted IS NULL';

        rest.GET(req, res, next, call);
    });

    require('./background_has_asset')(router, path);

    require('./background_has_attribute')(router, path);

    require('./background_has_skill')(router, path);
};