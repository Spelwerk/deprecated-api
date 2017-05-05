var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM background';

    var allowedPost = ['name', 'description', 'icon', 'species_id', 'manifestation_id'];

    var allowedPut = ['name', 'description', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'background.canon = 1 AND ' +
            'background.species_id IS NULL AND ' +
            'background.manifestation_id IS NULL AND ' +
            'background.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/species/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'background.canon = 1 AND ' +
            'background.species_id = ? AND ' +
            'background.manifestation_id IS NULL AND ' +
            'background.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'background.canon = 1 AND ' +
            'background.species_id IS NULL AND ' +
            'background.manifestation_id = ? AND ' +
            'background.deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    require('./background_has_asset')(pool, router, table, path);

    require('./background_has_attribute')(pool, router, table, path);

    require('./background_has_skill')(pool, router, table, path);
};