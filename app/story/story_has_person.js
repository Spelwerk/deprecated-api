var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM story_has_person ' +
        'LEFT JOIN person ON person.id = story_has_person.person_id';

    router.get(path + '/id/:id/person', function(req, res, next) {
        var call = query + ' WHERE ' +
            'story_has_person.story_id = ?';

        rest.GET(req, res, next, call, [req.params.id], {"nickname":"ASC"});
    });

    router.post(path + '/id/:id/person', function(req, res, next) {
        rest.relationPost(req, res, next, 'story', req.params.id, 'person', req.body.insert_id);
    });

    router.delete(path + '/id/:id/person/:id2', function(req, res, next) {
        //todo
    });
};