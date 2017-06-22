var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_species ' +
        'LEFT JOIN species ON species.id = user_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_species.user_id = ? AND ' +
            'species.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/species', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'species', req.body.insert_id);
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'species', req.params.id2);
    });
};