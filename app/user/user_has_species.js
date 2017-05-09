var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'user_has_species.user_id, ' +
        'user_has_species.species_id, ' +
        'user_has_species.owner, ' +
        'species.name AS species_name ' +
        'FROM user_has_species ' +
        'LEFT JOIN species ON species.id = user_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_species.user_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/species', function(req, res, next) {
        req.relation.name = 'species';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res, next) {
        req.relation.name = 'species';

        rest.userRelationDelete(req, res, next);
    });
};