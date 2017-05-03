var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_person.user_id, ' +
        'user_has_person.person_id, ' +
        'user_has_person.owner, ' +
        'user_has_person.secret, ' +
        'user_has_person.favorite, ' +
        'person.nickname AS nickname, ' +
        'person.occupation AS occupation, ' +
        'person.created, ' +
        'person.deleted ' +
        'FROM user_has_person ' +
        'LEFT JOIN person ON person.id = user_has_person.person_id';

    router.get(path + '/id/:id/person', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'person.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"person_id": "ASC"});
    });

    router.get(path + '/id/:id/person/favorite', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'user_has_person.favorite = 1 AND ' +
            'person.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"person_id": "ASC"});
    });

    router.post(path + '/id/:id/person', function(req, res) {
        rest.userRelationPost(pool, req, res, 'person');
    });

    router.delete(path + '/id/:id/person/:id2', function(req, res) {
        rest.userRelationDelete(pool, req, res, 'person');
    });
};