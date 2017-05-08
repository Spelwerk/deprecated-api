var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_species.user_id, ' +
        'user_has_species.species_id, ' +
        'user_has_species.owner, ' +
        'species.name AS species_name ' +
        'FROM user_has_species ' +
        'LEFT JOIN species ON species.id = user_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_species.user_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/species', function(req, res) {
        rest.userRelationPost(req, res, 'species');
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res) {
        rest.userRelationDelete(req, res, 'species');
    });
};