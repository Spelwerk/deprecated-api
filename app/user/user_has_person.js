var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_person.user_id, ' +
        'user_has_person.person_id, ' +
        'user_has_person.hash AS person_hash, ' +
        'person.nickname AS person_nickname, ' +
        'person.firstname AS person_firstname, ' +
        'person.surname AS person_surname, ' +
        'person.created, ' +
        'person.deleted ' +
        'FROM user_has_person ' +
        'LEFT JOIN person ON person.id = user_has_person.person_id';

    require('../default-has')(pool, router, table, path, ["user_id","person_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'person.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};