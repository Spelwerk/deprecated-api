var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'story_has_person.story_id, ' +
        'story_has_person.person_id, ' +
        'story_has_person.person_hash, ' +
        'person.nickname AS person_nickname, ' +
        'person.occupation AS person_occupation ' +
        'FROM story_has_person ' +
        'LEFT JOIN person ON person.id = story_has_person.person_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'story_has_person.story_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"nickname":"ASC"});
    });

    // todo post/put/delete
};