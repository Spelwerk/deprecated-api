var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'manifestation.id, ' +
        'manifestation.name, ' +
        'manifestation.description, ' +
        'manifestation.icon_id, ' +
        'icon.path AS icon_path, ' +
        'manifestation.created, ' +
        'manifestation.deleted ' +
        'FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id ' +
        'LEFT JOIN icon ON icon.id = manifestation.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "world_id": req.params.id1,
            "manifestation_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};