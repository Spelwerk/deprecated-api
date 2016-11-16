var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id, ' +
        'species.name, ' +
        'species.description, ' +
        'species.max_age, ' +
        'species.icon_id, ' +
        'icon.path AS icon_path, ' +
        'species.created, ' +
        'species.deleted ' +
        'FROM setting_has_species ' +
        'LEFT JOIN species ON species.id = setting_has_species.species_id ' +
        'LEFT JOIN icon ON icon.id = species.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_species.setting_id = ? AND ' +
            'species.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "species_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};