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

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'story_has_person.story_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "story_id": req.params.id1,
            "person_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};