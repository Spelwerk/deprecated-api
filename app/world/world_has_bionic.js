var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'bionic.icon_id, ' +
        'icon.path AS icon_path, ' +
        'bionic.created, ' +
        'bionic.deleted ' +
        'FROM world_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = world_has_bionic.bionic_id ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN icon ON icon.id = bionic.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_bionic.world_id = ? AND ' +
            'bionic.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/bodypart/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_bionic.world_id = ? AND ' +
            'bionic.bodypart_id = AND ' +
            'bionic.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "world_id": req.params.id1,
            "bionic_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};