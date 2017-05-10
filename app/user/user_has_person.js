var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT person.id FROM user_has_person ' +
        'LEFT JOIN person ON person.id = user_has_person.person_id';

    router.get(path + '/id/:id/person', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'person.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/person/favorite', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'user_has_person.favorite = 1 AND ' +
            'person.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/person', function(req, res, next) {
        req.relation.name = 'person';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/person/:id2', function(req, res, next) {
        req.relation.name = 'person';

        rest.userRelationDelete(req, res, next);
    });
};