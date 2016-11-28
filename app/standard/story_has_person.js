var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'person.id, ' +
        'story_has_person.person_hash AS hash, ' +
        'person.nickname, ' +
        'person.firstname, ' +
        'person.surname, ' +
        'person.occupation, ' +
        'person.description ' +
        'FROM story_has_person ' +
        'LEFT JOIN person ON person.id = story_has_person.person_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'story_has_person.story_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, path, ["story_id","person_id"]);
};