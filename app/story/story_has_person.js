var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'story_has_person.story_id, ' +
        'story_has_person.person_id, ' +
        'story_has_person.person_hash, ' +
        'person.nickname AS person_nickname, ' +
        'person.occupation AS person_occupation ' +
        'FROM story_has_person ' +
        'LEFT JOIN person ON person.id = story_has_person.person_id';

    require('../default-has')(pool, router, table, path, ["story_id","person_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'story_has_person.story_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"nickname":"ASC"});
    });
};